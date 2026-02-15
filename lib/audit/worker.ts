import { getGeminiModel } from '@/lib/gemini/client';
import { getPrompt, fillPromptVariables } from '@/lib/gemini/prompts';
import { createServiceClient } from '@/lib/supabase/server';
import { parseGitHubRepo, formatFilesForPrompt } from '@/lib/audit/parser';
import { AuditType, AuditResultData } from '@/types';

interface RunAuditParams {
  jobId: string;
  moduleId: string;
  auditType: AuditType;
  sourceContent: string;
  sourcePath: string;
}

export async function runModuleAudit({
  jobId,
  moduleId,
  auditType,
  sourceContent,
  sourcePath,
}: RunAuditParams): Promise<AuditResultData | null> {
  const supabase = await createServiceClient();
  const startTime = Date.now();

  await supabase.from('audit_results').update({ status: 'processing' }).eq('job_id', jobId).eq('module_id', moduleId);

  try {
    const promptTemplate = getPrompt(moduleId, auditType);
    if (!promptTemplate) throw new Error(`No prompt found for module: ${moduleId}`);

    const prompt = fillPromptVariables(promptTemplate, {
      SOURCE_PATH: sourcePath,
      OUTPUT_PATH: `audit_${moduleId}`,
      DATE: new Date().toISOString().split('T')[0],
      SOURCE_CONTENT: sourceContent,
    });

    const result = await getGeminiModel().generateContent(prompt);
    const text = result.response.text();

    let parsed: AuditResultData;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (!jsonMatch) throw new Error('Failed to parse JSON response');
      parsed = JSON.parse(jsonMatch[1]);
    }

    const processingTime = Date.now() - startTime;
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;

    await supabase
      .from('audit_results')
      .update({
        status: 'completed',
        score: parsed.overall_score,
        results: parsed,
        raw_response: text,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
      })
      .eq('job_id', jobId)
      .eq('module_id', moduleId);

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase
      .from('audit_results')
      .update({ status: 'failed', error_message: message, processing_time_ms: Date.now() - startTime })
      .eq('job_id', jobId)
      .eq('module_id', moduleId);

    return null;
  }
}

export async function runAuditJob(jobId: string) {
  const supabase = await createServiceClient();

  const { data: job, error: jobError } = await supabase.from('audit_jobs').select('*').eq('id', jobId).single();
  if (jobError || !job) throw new Error(`Job not found: ${jobId}`);

  await supabase.from('audit_jobs').update({ status: 'processing' }).eq('id', jobId);

  const modules = job.selected_modules as string[];
  for (const moduleId of modules) {
    await supabase.from('audit_results').insert({
      job_id: jobId,
      module_id: moduleId,
      module_name: moduleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      status: 'pending',
    });
  }

  let sourceContent = '// Source unavailable';
  if (job.source_type === 'github' && job.source_url) {
    const parsed = await parseGitHubRepo(job.source_url, job.audit_type as AuditType);
    sourceContent = formatFilesForPrompt(parsed.files);
  }

  let hasErrors = false;
  for (const moduleId of modules) {
    const result = await runModuleAudit({
      jobId,
      moduleId,
      auditType: job.audit_type as AuditType,
      sourceContent,
      sourcePath: job.source_name,
    });

    if (!result) hasErrors = true;

    const { data: results } = await supabase.from('audit_results').select('module_id, status').eq('job_id', jobId);
    const progress =
      results?.reduce((acc, r) => {
        acc[r.module_id] = r.status;
        return acc;
      }, {} as Record<string, string>) || {};

    await supabase.from('audit_jobs').update({ progress }).eq('id', jobId);
  }

  await supabase
    .from('audit_jobs')
    .update({ status: hasErrors ? 'failed' : 'completed', completed_at: new Date().toISOString() })
    .eq('id', jobId);
}


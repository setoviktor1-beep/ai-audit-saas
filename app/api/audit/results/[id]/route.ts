import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';
import { createClient } from '@/lib/supabase/server';

function md(value: unknown) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function listBlock(title: string, items?: string[]) {
  if (!items || items.length === 0) return [];
  return [`#### ${title}`, '', ...items.map((item) => `- ${item}`), ''];
}

function toMarkdownReport(aggregated: any) {
  const lines: string[] = [];

  lines.push(`# Audit Report: ${aggregated.source_name}`);
  lines.push('');
  lines.push(`- Job ID: ${aggregated.job_id}`);
  lines.push(`- Audit Type: ${aggregated.audit_type}`);
  lines.push(`- Status: ${aggregated.status}`);
  lines.push(`- Created At: ${aggregated.created_at}`);
  lines.push(`- Completed At: ${aggregated.completed_at || 'N/A'}`);
  lines.push(`- Credits Used: ${aggregated.total_credits}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---:|');
  lines.push(`| Overall Score | ${aggregated.summary.overall_score}/100 |`);
  lines.push(`| Modules Completed | ${aggregated.summary.modules_completed} |`);
  lines.push(`| Modules Failed | ${aggregated.summary.modules_failed} |`);
  lines.push(`| Total Issues | ${aggregated.summary.total_issues} |`);
  lines.push(`| Critical | ${aggregated.summary.critical} |`);
  lines.push(`| High | ${aggregated.summary.high} |`);
  lines.push(`| Medium | ${aggregated.summary.medium} |`);
  lines.push(`| Low | ${aggregated.summary.low} |`);
  lines.push('');
  lines.push('## Modules');
  lines.push('');

  for (const moduleResult of aggregated.modules || []) {
    lines.push(`### ${moduleResult.name} (${moduleResult.id})`);
    lines.push('');
    lines.push(`- Status: ${moduleResult.status}`);
    lines.push(`- Score: ${moduleResult.score ?? 'N/A'}`);
    lines.push(`- Tokens Used: ${moduleResult.tokens_used ?? 'N/A'}`);
    lines.push(`- Processing Time (ms): ${moduleResult.processing_time_ms ?? 'N/A'}`);
    lines.push('');

    const scoreEntries = Object.entries(moduleResult.results?.scores || {});
    if (scoreEntries.length > 0) {
      lines.push('#### Score Breakdown');
      lines.push('');
      lines.push('| Criterion | Score | Max | Justification |');
      lines.push('|---|---:|---:|---|');
      for (const [key, value] of scoreEntries as [string, any][]) {
        lines.push(`| ${md(key.replace(/_/g, ' '))} | ${value?.score ?? 'N/A'} | ${value?.max ?? 'N/A'} | ${md(value?.justification ?? '')} |`);
      }
      lines.push('');
    }

    const issues = moduleResult.results?.issues || [];
    if (issues.length > 0) {
      lines.push('#### Issues');
      lines.push('');
      lines.push('| Severity | Title | Category | File | Description | Suggestion |');
      lines.push('|---|---|---|---|---|---|');
      for (const issue of issues as any[]) {
        const file = issue.file ? `${issue.file}${issue.line ? `:${issue.line}` : ''}` : '';
        lines.push(
          `| ${md(issue.severity)} | ${md(issue.title)} | ${md(issue.category)} | ${md(file)} | ${md(issue.description)} | ${md(issue.suggestion || issue.fix || '')} |`
        );
      }
      lines.push('');
    }

    const recommendations = moduleResult.results?.recommendations || {};
    lines.push(...listBlock('Immediate', recommendations.immediate));
    lines.push(...listBlock('Short Term', recommendations.short_term));
    lines.push(...listBlock('Long Term', recommendations.long_term));
  }

  return lines.join('\n');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get('format') || 'json';

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: job, error: jobError } = await supabase
      .from('audit_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { data: results, error: resultsError } = await supabase
      .from('audit_results')
      .select('*')
      .eq('job_id', id)
      .order('created_at');

    if (resultsError) throw resultsError;

    const aggregated = {
      job_id: job.id,
      source_name: job.source_name,
      audit_type: job.audit_type,
      status: job.status,
      created_at: job.created_at,
      completed_at: job.completed_at,
      total_credits: job.credits_cost,
      summary: {
        overall_score: 0,
        modules_completed: 0,
        modules_failed: 0,
        total_issues: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      modules: results?.map((r) => ({
        id: r.module_id,
        name: r.module_name,
        status: r.status,
        score: r.score,
        results: r.results,
        tokens_used: r.tokens_used,
        processing_time_ms: r.processing_time_ms,
      })),
    };

    const completed = results?.filter((r) => r.status === 'completed') || [];
    aggregated.summary.modules_completed = completed.length;
    aggregated.summary.modules_failed = (results?.length || 0) - completed.length;

    if (completed.length > 0) {
      const scores = completed.map((r) => r.score || 0);
      aggregated.summary.overall_score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      for (const result of completed) {
        const summary = result.results?.summary || {};
        aggregated.summary.total_issues += summary.total_issues || 0;
        aggregated.summary.critical += summary.critical || 0;
        aggregated.summary.high += summary.high || 0;
        aggregated.summary.medium += summary.medium || 0;
        aggregated.summary.low += summary.low || 0;
      }
    }

    if (format === 'yaml') {
      const yamlContent = yaml.dump(aggregated, { indent: 2 });
      return new NextResponse(yamlContent, {
        headers: {
          'Content-Type': 'text/yaml',
          'Content-Disposition': `attachment; filename="audit_${id}.yaml"`,
        },
      });
    }

    if (format === 'md') {
      const markdown = toMarkdownReport(aggregated);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit_${id}.md"`,
        },
      });
    }

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

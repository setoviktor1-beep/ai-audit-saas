import { NextRequest, NextResponse } from 'next/server';
import yaml from 'js-yaml';
import { createClient } from '@/lib/supabase/server';

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

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: job, error } = await supabase
      .from('audit_jobs')
      .select(`*, audit_results (module_id, module_name, status, score)`)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const results = job.audit_results || [];
    const completed = results.filter((r: { status: string }) => r.status === 'completed').length;
    const total = results.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      id: job.id,
      status: job.status,
      sourceName: job.source_name,
      auditType: job.audit_type,
      progress: job.progress,
      progressPercent,
      modules: results,
      createdAt: job.created_at,
      completedAt: job.completed_at,
      errorMessage: job.error_message,
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}

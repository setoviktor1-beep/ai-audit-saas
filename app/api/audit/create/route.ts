import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { calculateCreditsCost } from '@/types';
import { runAuditJob } from '@/lib/audit/worker';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const serviceSupabase = await createServiceClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceUrl, auditType, selectedModules } = await request.json();

    if (!sourceUrl || !auditType || !selectedModules?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const creditsCost = calculateCreditsCost(selectedModules, auditType);

    const { data: userCredits } = await supabase.from('user_credits').select('balance').eq('user_id', user.id).single();
    const balance = userCredits?.balance || 0;

    if (balance < creditsCost) {
      return NextResponse.json({ error: 'Insufficient credits', required: creditsCost, available: balance }, { status: 402 });
    }

    let sourceName = sourceUrl;
    if (sourceUrl.includes('github.com')) {
      const match = sourceUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      sourceName = match ? match[1] : sourceUrl;
    }

    const { data: job, error: jobError } = await serviceSupabase
      .from('audit_jobs')
      .insert({
        user_id: user.id,
        source_type: 'github',
        source_url: sourceUrl,
        source_name: sourceName,
        audit_type: auditType,
        selected_modules: selectedModules,
        credits_cost: creditsCost,
        status: 'pending',
        progress: {},
      })
      .select()
      .single();

    if (jobError) throw jobError;

    const { data: deducted } = await serviceSupabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: creditsCost,
      p_job_id: job.id,
    });

    if (!deducted) {
      await serviceSupabase.from('audit_jobs').delete().eq('id', job.id);
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 402 });
    }

    runAuditJob(job.id).catch(console.error);

    return NextResponse.json({ jobId: job.id, status: 'pending', creditsCost });
  } catch (error) {
    console.error('Audit creation error:', error);
    return NextResponse.json({ error: 'Failed to create audit job' }, { status: 500 });
  }
}

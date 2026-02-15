import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/getUser';
import { AuditProgress } from '@/components/audit/AuditProgress';
import { AuditResults } from '@/components/audit/AuditResults';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function AuditDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from('audit_jobs')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();
  if (error || !job) redirect('/audits');

  const { data: results } = await supabase.from('audit_results').select('*').eq('job_id', params.id).order('created_at');

  const isProcessing = job.status === 'pending' || job.status === 'processing';

  const aggregatedResults = {
    summary: { overall_score: 0, total_issues: 0, critical: 0, high: 0, medium: 0, low: 0, modules_completed: 0 },
    modules: results?.map((r) => ({
      id: r.module_id,
      name: r.module_name,
      status: r.status,
      score: r.score,
      results: r.results,
    })),
  };

  const completed = results?.filter((r) => r.status === 'completed') || [];
  aggregatedResults.summary.modules_completed = completed.length;

  if (completed.length) {
    const scores = completed.map((r) => r.score || 0);
    aggregatedResults.summary.overall_score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    for (const result of completed) {
      const summary = result.results?.summary || {};
      aggregatedResults.summary.total_issues += summary.total_issues || 0;
      aggregatedResults.summary.critical += summary.critical || 0;
      aggregatedResults.summary.high += summary.high || 0;
      aggregatedResults.summary.medium += summary.medium || 0;
      aggregatedResults.summary.low += summary.low || 0;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/audits" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to audits
          </Link>
          <h1 className="text-3xl font-bold">{job.source_name}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-600">
            <Badge variant="outline">{job.audit_type === 'code' ? 'Code Audit' : 'Landing Page'}</Badge>
            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            <span>{job.credits_cost} credits</span>
          </div>
        </div>
      </div>

      {isProcessing ? (
        <AuditProgress
          jobId={job.id}
          initialStatus={job.status}
          initialModules={
            results?.map((r) => ({
              module_id: r.module_id,
              module_name: r.module_name,
              status: r.status,
              score: r.score,
            })) || []
          }
        />
      ) : (
        <AuditResults jobId={job.id} results={aggregatedResults} />
      )}
    </div>
  );
}

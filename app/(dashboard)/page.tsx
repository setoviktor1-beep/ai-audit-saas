import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/getUser';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentAudits } from '@/components/dashboard/RecentAudits';

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from('audit_jobs')
    .select('id, source_name, audit_type, status, created_at, credits_cost')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: results } = await supabase
    .from('audit_results')
    .select('job_id, score, results')
    .in('job_id', jobs?.map((j) => j.id) || []);

  const totalAudits = jobs?.length || 0;
  const completedAudits = jobs?.filter((j) => j.status === 'completed').length || 0;
  const creditsUsed = jobs?.reduce((sum, j) => sum + (j.credits_cost || 0), 0) || 0;

  let totalIssues = 0;
  results?.forEach((r: any) => {
    if (r.results?.summary?.total_issues) totalIssues += r.results.summary.total_issues;
  });

  const recentAudits = (jobs?.slice(0, 5) || []).map((job) => {
    const jobResults = (results || []).filter((r: any) => r.job_id === job.id && r.score !== null);
    const scores = jobResults.map((r: any) => r.score || 0);
    const overallScore = scores.length
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : undefined;

    return {
      id: job.id,
      sourceName: job.source_name,
      auditType: job.audit_type as 'code' | 'landing',
      status: job.status,
      createdAt: job.created_at,
      overallScore,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s your audit overview.</p>
      </div>
      <StatsCards
        totalAudits={totalAudits}
        completedAudits={completedAudits}
        totalIssues={totalIssues}
        creditsUsed={creditsUsed}
      />
      <RecentAudits audits={recentAudits} />
    </div>
  );
}

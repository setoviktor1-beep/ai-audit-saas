import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/getUser';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default async function AuditsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: audits } = await supabase
    .from('audit_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audits</h1>
          <p className="text-gray-600">View and manage your code audits</p>
        </div>
        <Button asChild>
          <Link href="/audits/new">
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Link>
        </Button>
      </div>

      {audits && audits.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell className="font-medium">{audit.source_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{audit.audit_type === 'code' ? 'Code' : 'Landing'}</Badge>
                  </TableCell>
                  <TableCell>{audit.selected_modules.length} modules</TableCell>
                  <TableCell>
                    <Badge className={statusColors[audit.status]}>{audit.status}</Badge>
                  </TableCell>
                  <TableCell>{audit.credits_cost}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Link href={`/audits/${audit.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-4">No audits yet</p>
          <Button asChild>
            <Link href="/audits/new">Create your first audit</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

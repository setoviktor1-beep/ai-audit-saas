import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Audit {
  id: string;
  sourceName: string;
  auditType: 'code' | 'landing';
  status: string;
  createdAt: string;
  overallScore?: number;
}

interface RecentAuditsProps {
  audits: Audit[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function RecentAudits({ audits }: RecentAuditsProps) {
  if (!audits.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No audits yet</p>
            <Button className="mt-4" asChild>
              <Link href="/audits/new">Start your first audit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Audits</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/audits">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {audits.map((audit) => (
            <Link
              key={audit.id}
              href={`/audits/${audit.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">{audit.sourceName}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{audit.auditType === 'code' ? 'Code' : 'Landing'}</Badge>
                <Badge className={statusColors[audit.status]}>{audit.status}</Badge>
                {audit.status === 'completed' && audit.overallScore !== undefined && (
                  <div className="text-lg font-bold">{audit.overallScore}/100</div>
                )}
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

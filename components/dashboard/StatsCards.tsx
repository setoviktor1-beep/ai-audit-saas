import { FileSearch, CheckCircle, AlertTriangle, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  totalAudits: number;
  completedAudits: number;
  totalIssues: number;
  creditsUsed: number;
}

export function StatsCards({ totalAudits, completedAudits, totalIssues, creditsUsed }: StatsCardsProps) {
  const stats = [
    { name: 'Total Audits', value: totalAudits, icon: FileSearch, color: 'text-blue-500' },
    { name: 'Completed', value: completedAudits, icon: CheckCircle, color: 'text-green-500' },
    { name: 'Issues Found', value: totalIssues, icon: AlertTriangle, color: 'text-yellow-500' },
    { name: 'Credits Used', value: creditsUsed, icon: Coins, color: 'text-purple-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

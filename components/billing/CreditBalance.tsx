'use client';

import { Coins } from 'lucide-react';
import { useCredits } from '@/lib/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CreditBalance() {
  const { balance, loading } = useCredits();

  if (loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{balance}</div>
        <p className="text-xs text-muted-foreground">credits available</p>
      </CardContent>
    </Card>
  );
}

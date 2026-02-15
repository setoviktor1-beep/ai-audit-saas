'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { PricingPackage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingCardsProps {
  packages: PricingPackage[];
}

export function PricingCards({ packages }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className={pkg.id === 'pro' ? 'border-primary shadow-lg' : ''}>
          <CardHeader>
            {pkg.id === 'pro' && <Badge className="w-fit mb-2">Most Popular</Badge>}
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.features.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-bold">EUR {(pkg.priceCents / 100).toFixed(0)}</span>
              <span className="text-muted-foreground"> one-time</span>
            </div>
            <div className="text-2xl font-semibold text-primary">{pkg.credits} credits</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                {pkg.features.maxModules === -1 ? 'All audit modules' : `Up to ${pkg.features.maxModules} modules`}
              </li>
              {pkg.features.reaudit && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Free re-audit included
                </li>
              )}
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                JSON/YAML export
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={pkg.id === 'pro' ? 'default' : 'outline'}
              onClick={() => handlePurchase(pkg.id)}
              disabled={loading !== null || !pkg.stripePriceId}
            >
              {loading === pkg.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pkg.stripePriceId ? 'Buy Credits' : 'Not Configured'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

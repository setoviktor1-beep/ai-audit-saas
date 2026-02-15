import { CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/getUser';
import { CreditBalance } from '@/components/billing/CreditBalance';
import { PricingCards } from '@/components/billing/PricingCards';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  await requireUser();
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from('pricing_packages')
    .select('*')
    .eq('is_active', true)
    .order('price_cents');

  const formattedPackages =
    packages?.map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.price_cents,
      credits: p.credits,
      stripePriceId: p.stripe_price_id,
      features: p.features as { maxModules?: number; reaudit?: boolean; description?: string },
      isActive: p.is_active,
    })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Credits</h1>
        <p className="text-muted-foreground">Purchase credits to run code audits</p>
      </div>

      {searchParams.success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Payment successful! Your credits have been added.
          </AlertDescription>
        </Alert>
      )}

      {searchParams.canceled && (
        <Alert className="border-destructive bg-destructive/10">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Payment was canceled. No credits were added.</AlertDescription>
        </Alert>
      )}

      <CreditBalance />

      <div>
        <h2 className="text-xl font-semibold mb-4">Buy More Credits</h2>
        <PricingCards packages={formattedPackages} />
      </div>
    </div>
  );
}

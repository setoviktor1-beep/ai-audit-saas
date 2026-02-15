import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const { data: pkg, error: pkgError } = await supabase
      .from('pricing_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (!pkg.stripe_price_id) {
      return NextResponse.json({ error: 'Package not configured for payments' }, { status: 400 });
    }

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      packageId: pkg.id,
      stripePriceId: pkg.stripe_price_id,
      credits: pkg.credits,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

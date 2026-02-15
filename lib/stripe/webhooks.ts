import type Stripe from 'stripe';
import { getStripeClient } from './client';
import { createServiceClient } from '@/lib/supabase/server';

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const credits = parseInt(session.metadata?.credits || '0', 10);
  const paymentId = session.payment_intent as string;

  if (!userId || !credits) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const supabase = await createServiceClient();

  const { error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: credits,
    p_stripe_id: paymentId,
    p_description: `Purchased ${credits} credits`,
  });

  if (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}

export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  return getStripeClient().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
}


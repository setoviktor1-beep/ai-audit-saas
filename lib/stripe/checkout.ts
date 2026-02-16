import { getStripeClient } from './client';

interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  packageId: string;
  stripePriceId: string;
  credits: number;
}

function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, '');
}

export async function createCheckoutSession({
  userId,
  userEmail,
  packageId,
  stripePriceId,
  credits,
}: CreateCheckoutParams) {
  const appUrl = getAppUrl();

  return getStripeClient().checkout.sessions.create({
    customer_email: userEmail,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${appUrl}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/credits?canceled=true`,
    metadata: {
      userId,
      packageId,
      credits: credits.toString(),
    },
  });
}


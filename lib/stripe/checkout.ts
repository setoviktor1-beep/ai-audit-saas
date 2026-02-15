import { getStripeClient } from './client';

interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  packageId: string;
  stripePriceId: string;
  credits: number;
}

export async function createCheckoutSession({
  userId,
  userEmail,
  packageId,
  stripePriceId,
  credits,
}: CreateCheckoutParams) {
  return getStripeClient().checkout.sessions.create({
    customer_email: userEmail,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?canceled=true`,
    metadata: {
      userId,
      packageId,
      credits: credits.toString(),
    },
  });
}


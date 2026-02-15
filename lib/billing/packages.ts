export type BillingPackage = {
  id: 'starter' | 'pro' | 'advanced';
  name: string;
  priceCents: number;
  credits: number;
  stripePriceId?: string;
  features: {
    maxModules?: number;
    reaudit?: boolean;
    description?: string;
  };
  isActive: boolean;
};

export const FALLBACK_PACKAGES: BillingPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceCents: 1900,
    credits: 30,
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER,
    features: {
      maxModules: 3,
      description: '3 audit modules',
    },
    isActive: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceCents: 4900,
    credits: 80,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
    features: {
      maxModules: -1,
      description: 'Full audit',
    },
    isActive: true,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    priceCents: 9900,
    credits: 150,
    stripePriceId: process.env.STRIPE_PRICE_ID_ADVANCED,
    features: {
      maxModules: -1,
      reaudit: true,
      description: 'Full + re-audit',
    },
    isActive: true,
  },
];

export function getFallbackPackage(packageId: string) {
  return FALLBACK_PACKAGES.find((pkg) => pkg.id === packageId);
}

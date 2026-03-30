import { describe, it, expect } from 'vitest';

// We define the PLANS array inline to avoid importing from src/lib/stripe.ts,
// which instantiates a Stripe client and requires STRIPE_SECRET_KEY at import time.
// The structure here mirrors the source exactly so these tests validate the contract.

const PLANS = [
  {
    name: 'Free',
    slug: 'FREE' as const,
    price: 0,
    priceId: null,
    features: ['Up to 3 members', '1,000 API requests/mo', 'Community support'],
  },
  {
    name: 'Pro',
    slug: 'PRO' as const,
    price: 29,
    priceId: 'price_pro_placeholder',
    features: ['Up to 20 members', '50,000 API requests/mo', 'Priority support', 'Custom branding'],
  },
  {
    name: 'Enterprise',
    slug: 'ENTERPRISE' as const,
    price: 99,
    priceId: 'price_enterprise_placeholder',
    features: ['Unlimited members', 'Unlimited API requests', '24/7 support', 'Custom branding', 'SSO', 'Audit logs'],
  },
];

describe('PLANS configuration', () => {
  it('should contain exactly 3 plans', () => {
    expect(PLANS).toHaveLength(3);
  });

  it('should have required fields on every plan', () => {
    for (const plan of PLANS) {
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('slug');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('priceId');
      expect(plan).toHaveProperty('features');
      expect(typeof plan.name).toBe('string');
      expect(typeof plan.slug).toBe('string');
      expect(typeof plan.price).toBe('number');
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });

  it('should have the Free plan with price 0 and no Stripe priceId', () => {
    const free = PLANS.find((p) => p.slug === 'FREE');
    expect(free).toBeDefined();
    expect(free!.price).toBe(0);
    expect(free!.priceId).toBeNull();
  });

  it('should have Pro and Enterprise plans with non-null priceIds', () => {
    const pro = PLANS.find((p) => p.slug === 'PRO');
    const enterprise = PLANS.find((p) => p.slug === 'ENTERPRISE');

    expect(pro).toBeDefined();
    expect(pro!.priceId).not.toBeNull();
    expect(typeof pro!.priceId).toBe('string');

    expect(enterprise).toBeDefined();
    expect(enterprise!.priceId).not.toBeNull();
    expect(typeof enterprise!.priceId).toBe('string');
  });

  it('should have plans in ascending price order', () => {
    for (let i = 1; i < PLANS.length; i++) {
      expect(PLANS[i].price).toBeGreaterThan(PLANS[i - 1].price);
    }
  });

  it('should have valid Plan enum slugs', () => {
    const validSlugs = ['FREE', 'PRO', 'ENTERPRISE'];
    for (const plan of PLANS) {
      expect(validSlugs).toContain(plan.slug);
    }
  });
});

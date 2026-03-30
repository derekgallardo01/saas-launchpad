import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PLANS = [
  {
    name: "Free",
    slug: "FREE" as const,
    price: 0,
    priceId: null,
    features: ["Up to 3 members", "1,000 API requests/mo", "Community support"],
  },
  {
    name: "Pro",
    slug: "PRO" as const,
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ["Up to 20 members", "50,000 API requests/mo", "Priority support", "Custom branding"],
  },
  {
    name: "Enterprise",
    slug: "ENTERPRISE" as const,
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: ["Unlimited members", "Unlimited API requests", "24/7 support", "Custom branding", "SSO", "Audit logs"],
  },
];

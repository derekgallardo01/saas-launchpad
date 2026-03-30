import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type { Plan } from "@/generated/prisma/client";
import type Stripe from "stripe";

const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: "PRO",
  [process.env.STRIPE_ENTERPRISE_PRICE_ID!]: "ENTERPRISE",
};

function getPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const item = subscription.items.data[0];
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000);
  }
  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      if (!orgId) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;

      await db.organization.update({
        where: { id: orgId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: getPeriodEnd(subscription),
          plan: PRICE_TO_PLAN[priceId] || "PRO",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;

      await db.organization.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: getPeriodEnd(subscription),
          plan: PRICE_TO_PLAN[priceId] || "PRO",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await db.organization.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

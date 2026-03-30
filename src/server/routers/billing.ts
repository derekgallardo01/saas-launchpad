import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { stripe, PLANS } from "@/lib/stripe";

export const billingRouter = router({
  plans: protectedProcedure.query(() => {
    return PLANS;
  }),

  getSubscription: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({ where: { id: input.orgId } });
      if (!org) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        plan: org.plan,
        stripeSubscriptionId: org.stripeSubscriptionId,
        stripeCurrentPeriodEnd: org.stripeCurrentPeriodEnd,
        isCanceled: false,
      };
    }),

  createCheckoutSession: protectedProcedure
    .input(z.object({ orgId: z.string(), priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({ where: { id: input.orgId } });
      if (!org) throw new TRPCError({ code: "NOT_FOUND" });

      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email!,
          metadata: { orgId: org.id },
        });
        customerId = customer.id;
        await ctx.db.organization.update({
          where: { id: org.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: input.priceId, quantity: 1 }],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
        metadata: { orgId: org.id },
      });

      return { url: session.url };
    }),

  createPortalSession: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({ where: { id: input.orgId } });
      if (!org?.stripeCustomerId) throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account" });

      const session = await stripe.billingPortal.sessions.create({
        customer: org.stripeCustomerId,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
      });

      return { url: session.url };
    }),
});

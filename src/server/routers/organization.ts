import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const organizationRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(2).max(50) }))
    .mutation(async ({ ctx, input }) => {
      let slug = slugify(input.name);
      const existing = await ctx.db.organization.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;

      const org = await ctx.db.organization.create({
        data: {
          name: input.name,
          slug,
          memberships: {
            create: { userId: ctx.user.id, role: "OWNER" },
          },
        },
      });

      await ctx.db.activityLog.create({
        data: { action: "org.created", organizationId: org.id, userId: ctx.user.id },
      });

      return org;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.membership.findMany({
      where: { userId: ctx.user.id },
      include: {
        organization: {
          include: { _count: { select: { memberships: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return memberships.map((m: typeof memberships[number]) => ({ ...m.organization, role: m.role }));
  }),

  getById: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findUnique({
        where: { userId_organizationId: { userId: ctx.user.id, organizationId: input.orgId } },
      });
      if (!membership) throw new TRPCError({ code: "FORBIDDEN" });

      const org = await ctx.db.organization.findUnique({
        where: { id: input.orgId },
        include: {
          memberships: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          _count: { select: { memberships: true, apiKeys: true } },
        },
      });
      return { ...org, currentUserRole: membership.role };
    }),

  update: adminProcedure
    .input(z.object({ orgId: z.string(), name: z.string().min(2).max(50).optional(), logo: z.string().url().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, ...data } = input;
      const org = await ctx.db.organization.update({ where: { id: orgId }, data });
      await ctx.db.activityLog.create({
        data: { action: "org.updated", details: JSON.parse(JSON.stringify(data)), organizationId: orgId, userId: ctx.user.id },
      });
      return org;
    }),

  delete: protectedProcedure
    .input(z.object({ orgId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.membership.findUnique({
        where: { userId_organizationId: { userId: ctx.user.id, organizationId: input.orgId } },
      });
      if (membership?.role !== "OWNER") throw new TRPCError({ code: "FORBIDDEN", message: "Only owners can delete" });

      await ctx.db.organization.delete({ where: { id: input.orgId } });
      return { success: true };
    }),
});

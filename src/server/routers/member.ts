import { z } from "zod";
import { router, protectedProcedure, orgProcedure, adminProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

export const memberRouter = router({
  list: orgProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberships = await ctx.db.membership.findMany({
        where: { organizationId: input.orgId },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "asc" },
      });
      return memberships;
    }),

  invite: adminProcedure
    .input(z.object({ orgId: z.string(), email: z.string().email(), role: z.enum(["ADMIN", "MEMBER"]) }))
    .mutation(async ({ ctx, input }) => {
      const existingMember = await ctx.db.membership.findFirst({
        where: { organizationId: input.orgId, user: { email: input.email } },
      });
      if (existingMember) throw new TRPCError({ code: "CONFLICT", message: "User is already a member" });

      const existingInvite = await ctx.db.invitation.findFirst({
        where: { organizationId: input.orgId, email: input.email, expires: { gt: new Date() } },
      });
      if (existingInvite) throw new TRPCError({ code: "CONFLICT", message: "Invitation already pending" });

      const invitation = await ctx.db.invitation.create({
        data: {
          email: input.email,
          role: input.role,
          organizationId: input.orgId,
          invitedById: ctx.user.id,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await ctx.db.activityLog.create({
        data: {
          action: "member.invited",
          details: { email: input.email, role: input.role },
          organizationId: input.orgId,
          userId: ctx.user.id,
        },
      });

      return invitation;
    }),

  removeMember: adminProcedure
    .input(z.object({ orgId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.membership.findUnique({
        where: { userId_organizationId: { userId: input.userId, organizationId: input.orgId } },
      });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      if (target.role === "OWNER") throw new TRPCError({ code: "FORBIDDEN", message: "Cannot remove owner" });

      await ctx.db.membership.delete({
        where: { userId_organizationId: { userId: input.userId, organizationId: input.orgId } },
      });

      await ctx.db.activityLog.create({
        data: { action: "member.removed", details: { userId: input.userId }, organizationId: input.orgId, userId: ctx.user.id },
      });

      return { success: true };
    }),

  updateRole: protectedProcedure
    .input(z.object({ orgId: z.string(), userId: z.string(), role: z.enum(["ADMIN", "MEMBER"]) }))
    .mutation(async ({ ctx, input }) => {
      const callerMembership = await ctx.db.membership.findUnique({
        where: { userId_organizationId: { userId: ctx.user.id, organizationId: input.orgId } },
      });
      if (callerMembership?.role !== "OWNER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only owners can change roles" });
      }

      const updated = await ctx.db.membership.update({
        where: { userId_organizationId: { userId: input.userId, organizationId: input.orgId } },
        data: { role: input.role },
      });

      await ctx.db.activityLog.create({
        data: {
          action: "member.roleUpdated",
          details: { userId: input.userId, newRole: input.role },
          organizationId: input.orgId,
          userId: ctx.user.id,
        },
      });

      return updated;
    }),
});


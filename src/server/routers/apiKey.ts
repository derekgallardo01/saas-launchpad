import { z } from "zod";
import { router, orgProcedure, adminProcedure } from "@/server/trpc";
import { randomBytes, createHash } from "crypto";

function generateApiKey() {
  const raw = `sl_${randomBytes(32).toString("hex")}`;
  const hashed = createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

export const apiKeyRouter = router({
  list: orgProcedure
    .input(z.object({ orgId: z.string() }))
    .query(async ({ ctx, input }) => {
      const keys = await ctx.db.apiKey.findMany({
        where: { organizationId: input.orgId },
        include: { createdBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      return keys.map((k: typeof keys[number]) => ({
        ...k,
        key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
      }));
    }),

  create: adminProcedure
    .input(z.object({ orgId: z.string(), name: z.string().min(1).max(50), expiresAt: z.string().datetime().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { raw, hashed } = generateApiKey();

      const apiKey = await ctx.db.apiKey.create({
        data: {
          name: input.name,
          key: hashed,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          organizationId: input.orgId,
          createdById: ctx.user.id,
        },
      });

      await ctx.db.activityLog.create({
        data: {
          action: "apiKey.created",
          details: { name: input.name },
          organizationId: input.orgId,
          userId: ctx.user.id,
        },
      });

      return { ...apiKey, plainKey: raw };
    }),

  revoke: adminProcedure
    .input(z.object({ orgId: z.string(), keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.apiKey.delete({ where: { id: input.keyId, organizationId: input.orgId } });

      await ctx.db.activityLog.create({
        data: {
          action: "apiKey.revoked",
          details: { keyId: input.keyId },
          organizationId: input.orgId,
          userId: ctx.user.id,
        },
      });

      return { success: true };
    }),
});

import { z } from "zod";
import { router, orgProcedure } from "@/server/trpc";

export const activityRouter = router({
  list: orgProcedure
    .input(z.object({ orgId: z.string(), page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const [items, total] = await Promise.all([
        ctx.db.activityLog.findMany({
          where: { organizationId: input.orgId },
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.activityLog.count({ where: { organizationId: input.orgId } }),
      ]);
      return { items, total, pages: Math.ceil(total / input.limit) };
    }),
});

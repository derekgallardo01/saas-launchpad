import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import superjson from "superjson";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export async function createContext() {
  const session = await getServerSession(authOptions);
  return { session, db };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

const ROLE_HIERARCHY: Record<Role, number> = { OWNER: 3, ADMIN: 2, MEMBER: 1 };

function createOrgMiddleware(minRole: Role) {
  return protectedProcedure
    .input(z.object({ orgId: z.string() }).passthrough())
    .use(async ({ ctx, input, next }) => {
      const membership = await ctx.db.membership.findUnique({
        where: { userId_organizationId: { userId: ctx.user.id, organizationId: input.orgId } },
      });
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" });
      if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minRole]) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient role" });
      }
      return next({ ctx: { ...ctx, membership } });
    });
}

export const orgProcedure = createOrgMiddleware("MEMBER");
export const adminProcedure = createOrgMiddleware("ADMIN");

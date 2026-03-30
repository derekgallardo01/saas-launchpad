import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/trpc";
import { hashPassword } from "@/lib/auth-utils";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });

      const hashed = await hashPassword(input.password);
      const user = await ctx.db.user.create({
        data: { name: input.name, email: input.email, password: hashed },
      });
      return { id: user.id, email: user.email };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    });
    return user;
  }),
});

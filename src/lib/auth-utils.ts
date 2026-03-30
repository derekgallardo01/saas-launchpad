import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";
import type { Role } from "@/generated/prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export async function requireOrgRole(orgId: string, minRole: Role) {
  const user = await requireAuth();
  const membership = await db.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
  if (!membership) throw new Error("Not a member of this organization");
  if (ROLE_HIERARCHY[membership.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error("Insufficient permissions");
  }
  return { user, membership };
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}

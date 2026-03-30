import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await hash("password123", 12);

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Derek G.",
      email: "demo@example.com",
      password,
    },
  });

  // Create second user
  const jane = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@example.com",
      password,
    },
  });

  // Create third user
  const mike = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      name: "Mike Johnson",
      email: "mike@example.com",
      password,
    },
  });

  // Create organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-inc" },
    update: {},
    create: {
      name: "Acme Inc",
      slug: "acme-inc",
      plan: "PRO",
    },
  });

  // Add memberships
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: { userId: user.id, organizationId: org.id, role: "OWNER" },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: jane.id, organizationId: org.id } },
    update: {},
    create: { userId: jane.id, organizationId: org.id, role: "ADMIN" },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: mike.id, organizationId: org.id } },
    update: {},
    create: { userId: mike.id, organizationId: org.id, role: "MEMBER" },
  });

  // Add activity logs
  const actions = [
    { action: "org.created", userId: user.id },
    { action: "member.invited", userId: user.id, details: { email: "jane@example.com", role: "ADMIN" } },
    { action: "member.invited", userId: user.id, details: { email: "mike@example.com", role: "MEMBER" } },
    { action: "plan.upgraded", userId: user.id, details: { from: "FREE", to: "PRO" } },
    { action: "apiKey.created", userId: user.id, details: { name: "Production API Key" } },
  ];

  for (const log of actions) {
    await prisma.activityLog.create({
      data: { ...log, organizationId: org.id },
    });
  }

  console.log("Seed complete: demo@example.com / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

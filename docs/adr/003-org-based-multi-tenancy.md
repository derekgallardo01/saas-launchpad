# ADR-003: Organization-Based Multi-Tenancy

**Status:** Accepted
**Date:** 2025-12-15
**Decision Makers:** Architecture Team

## Context

Multi-tenancy in SaaS applications can be implemented at several isolation levels:

1. **Database-per-tenant** -- Each organization gets its own PostgreSQL database. Maximum isolation, highest operational complexity.
2. **Schema-per-tenant** -- Each organization gets its own schema within a shared database. Good isolation, moderate complexity.
3. **Row-level isolation** -- All tenants share the same tables. Isolation is enforced via `organizationId` foreign keys and application-level access checks.

## Decision

We chose **row-level isolation with organization-based multi-tenancy**, where every data model that belongs to a tenant includes an `organizationId` foreign key.

## Rationale

### Simplest deployment model

One database, one schema, one connection pool. This works on every hosting provider (Vercel + Neon, Railway, Supabase, bare metal) without requiring custom provisioning logic. Database-per-tenant and schema-per-tenant require automation to create/migrate/backup tenant databases at scale.

### Prisma compatibility

Prisma does not natively support dynamic schema switching or multi-database routing. Row-level isolation works seamlessly with a single `PrismaClient` instance and standard queries filtered by `organizationId`.

### Cost efficiency at the early stage

A single shared database serves all tenants until the workload demands sharding. For a SaaS product in its first 0-1000 customers, this is the right trade-off. Premature isolation adds operational burden without corresponding benefit.

### Enforced at the middleware layer

Every tRPC procedure that accesses organization data goes through `orgProcedure` or `adminProcedure`, which verify membership before the query runs:

```typescript
// src/server/trpc.ts
export const orgProcedure = protectedProcedure
  .input(z.object({ orgId: z.string() }).passthrough())
  .use(async ({ ctx, input, next }) => {
    const membership = await ctx.db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: ctx.user.id,
          organizationId: input.orgId,
        },
      },
    });
    if (!membership) throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx: { ...ctx, membership } });
  });
```

This is the equivalent of PostgreSQL Row-Level Security (RLS), but implemented in application code where it can be unit tested and type-checked.

### Trade-offs acknowledged

| Concern | Our mitigation |
|---------|---------------|
| **No hard database-level isolation** | Acceptable for B2B SaaS. If a customer requires SOC 2 database isolation, we can migrate them to a dedicated instance as an Enterprise add-on. |
| **Risk of missing a WHERE clause** | All tenant-scoped queries flow through `orgProcedure`, which injects `organizationId` into the context. Direct `db` access that skips the middleware is caught in code review. |
| **Noisy neighbor problem** | Addressed with per-key and per-plan API rate limiting. Heavy tenants are throttled before they impact the shared database. |
| **Data export and deletion (GDPR)** | Straightforward with row-level: `DELETE FROM table WHERE organizationId = ?`. No schema or database to tear down. |

## Consequences

- Every model that belongs to a tenant (Membership, ApiKey, ActivityLog, Invitation) has an `organizationId` column with a foreign key to `Organization`.
- All tRPC procedures for tenant data use `orgProcedure` (members can read) or `adminProcedure` (admins can write).
- The `useCurrentOrg()` React hook on the client tracks the selected organization and passes `orgId` to every tRPC call.
- Database indexes include `organizationId` for efficient filtered queries.
- If we reach scale where isolation is needed, we will evaluate PostgreSQL Row-Level Security or a sharding strategy without changing the application code.

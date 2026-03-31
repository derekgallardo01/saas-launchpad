# ADR-002: JWT Sessions over Database Sessions

**Status:** Accepted
**Date:** 2025-12-15
**Decision Makers:** Architecture Team

## Context

NextAuth.js supports two session strategies:

1. **Database sessions** -- A session row is created in PostgreSQL on every login. Every authenticated request queries the database to validate the session.
2. **JWT sessions** -- A signed JSON Web Token is stored in an HTTP-only cookie. The server verifies the token cryptographically without any database call.

## Decision

We chose the **JWT session strategy** for NextAuth.js.

## Rationale

### Eliminates per-request database lookups

With database sessions, every authenticated API call adds a `SELECT` to PostgreSQL. In a SaaS dashboard with frequent tRPC calls, this can account for 30-50% of all database queries. JWTs are verified purely with HMAC-SHA256 -- no I/O required.

### Simpler infrastructure

JWTs work identically on a single server, on Vercel serverless functions, or behind a load balancer with multiple instances. Database sessions require a shared session store, which means either a persistent database connection or an external session cache (Redis).

### Faster cold starts on serverless

Serverless functions on Vercel/AWS Lambda must establish a database connection on cold start. With JWTs, the first authenticated request can complete without waiting for the connection pool. The tRPC query that follows will connect to the database, but the auth layer itself adds zero latency.

### Trade-offs acknowledged

| Concern | Our mitigation |
|---------|---------------|
| **Cannot revoke individual sessions** | For a B2B SaaS dashboard, forced logout is rare. If needed, we can add a `tokenVersion` field to the User model and bump it on password change, effectively invalidating all existing JWTs. |
| **Token size in cookies** | Our JWT payload is small (~300 bytes): `userId`, `email`, `name`. This is well within the 4 KB cookie limit. |
| **Stale data in the token** | We use short-lived tokens (30-day expiry) and re-fetch user data from the database in tRPC middleware when role/permission checks are needed. The JWT only carries identity, not authorization state. |

## Consequences

- NextAuth is configured with `session: { strategy: "jwt" }` in `src/lib/auth.ts`.
- The `jwt` callback enriches the token with `user.id`.
- The `session` callback exposes `session.user.id` for use in tRPC context.
- Organization membership and roles are always fetched fresh from PostgreSQL in `orgProcedure` / `adminProcedure` -- never cached in the JWT.
- If we add a "revoke all sessions" feature, we will implement the `tokenVersion` pattern described above.

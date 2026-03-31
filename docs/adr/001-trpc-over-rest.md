# ADR-001: tRPC over REST and GraphQL

**Status:** Accepted
**Date:** 2025-12-15
**Decision Makers:** Architecture Team

## Context

We needed to choose an API layer for communication between the Next.js frontend and backend. The primary candidates were:

1. **REST** (Next.js API routes) -- The industry default. Well-understood, massive ecosystem, language-agnostic.
2. **GraphQL** (Apollo / Yoga / Pothos) -- Flexible query language, strong typing with codegen, optimized data fetching.
3. **tRPC** -- End-to-end type safety for TypeScript monorepos, zero code generation, thin runtime.

## Decision

We chose **tRPC v11** as the sole API layer for all client-server communication.

## Rationale

### End-to-end type safety without codegen

tRPC infers the full API contract from the router definitions. Rename a field on the server, and every call site in the client shows a compile error immediately. With REST or GraphQL, you need a separate codegen step (OpenAPI -> TypeScript, or GraphQL Codegen) and hope it stays in sync.

### Minimal bundle overhead

tRPC's client is ~2 KB gzipped. Compare this to Apollo Client (~35 KB) or even the lighter urql (~12 KB). For a SaaS dashboard where initial load matters, this adds up.

### React Query integration

tRPC v11 wraps `@tanstack/react-query`, which means we get caching, background refetching, optimistic updates, and devtools for free. We would have needed to wire this up manually with REST or pick a separate data-fetching layer with GraphQL.

### Simpler mental model

There is no schema file, no resolvers, no query language. A tRPC procedure is just a TypeScript function with Zod input validation. Junior developers ramp up faster; senior developers ship faster.

### Trade-offs acknowledged

| Concern | Our position |
|---------|-------------|
| **Not language-agnostic** | Acceptable -- this is a TypeScript monorepo. External consumers use our API key system and receive JSON; they do not need tRPC. |
| **No public API docs** | We export the `AppRouter` type. If we need external docs, we can add an OpenAPI export plugin (`trpc-openapi`). |
| **Less ecosystem tooling** | tRPC's ecosystem is smaller than GraphQL's, but we have not hit a feature gap. React Query devtools cover our debugging needs. |

## Consequences

- All server functions are defined as tRPC procedures with Zod schemas.
- The single API entrypoint is `/api/trpc/[trpc]`.
- Frontend consumes the API exclusively via the typed `trpc` React hooks.
- If we ever need a public REST API (e.g., for third-party integrations), we will add `trpc-openapi` to generate OpenAPI from existing procedures rather than building a parallel API surface.

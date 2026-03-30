# SaaS Launchpad

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-635BFF)](https://stripe.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Production-ready multi-tenant SaaS boilerplate with authentication, organizations, Stripe billing, API key management, and activity logging. Built with Next.js 16, tRPC v11, Prisma 7, and TypeScript -- designed to let you skip months of infrastructure work and focus on your product.

## Features

- **Authentication** -- Email/password + GitHub + Google OAuth via NextAuth.js (JWT strategy)
- **Multi-Tenancy** -- Organizations with Owner/Admin/Member role hierarchy
- **Stripe Billing** -- Subscriptions, checkout, customer portal, and webhook handling
- **API Keys** -- Generate, manage, and revoke keys with SHA-256 hashed storage
- **Activity Logs** -- Complete audit trail for all organization actions
- **Type-Safe API** -- End-to-end typesafe with tRPC v11 + Zod validation
- **Dark Mode** -- System-aware with manual toggle
- **Docker** -- One-command development environment
- **CI/CD** -- GitHub Actions for lint, type-check, and build

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| API | tRPC v11 |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth.js v4 (JWT) |
| Payments | Stripe |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + Playwright |
| Deployment | Docker + Vercel/Railway |

## Architecture

```mermaid
graph TD
    subgraph Client["Client Layer"]
        style Client fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
        AppRouter["Next.js App Router"]
        Pages["Pages<br/>(Login, Register, Dashboard,<br/>Members, Billing, API Keys,<br/>Activity, Settings)"]
        Components["UI Components<br/>(Avatar, Badge, Button,<br/>Card, Input, Table)"]
        AppRouter --> Pages
        AppRouter --> Components
    end

    subgraph API["API Layer"]
        style API fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
        tRPC["tRPC v11 Server"]
        AuthRouter["auth Router"]
        OrgRouter["organization Router"]
        MemberRouter["member Router"]
        BillingRouter["billing Router"]
        ApiKeyRouter["apiKey Router"]
        ActivityRouter["activity Router"]
        tRPC --> AuthRouter
        tRPC --> OrgRouter
        tRPC --> MemberRouter
        tRPC --> BillingRouter
        tRPC --> ApiKeyRouter
        tRPC --> ActivityRouter
    end

    subgraph Data["Data Layer"]
        style Data fill:#dcfce7,stroke:#22c55e,stroke-width:2px
        Prisma["Prisma ORM v7"]
        PG["PostgreSQL"]
        Prisma --> PG
    end

    subgraph External["External Services"]
        style External fill:#fce7f3,stroke:#ec4899,stroke-width:2px
        Stripe["Stripe<br/>(Payments)"]
        NextAuth["NextAuth.js v4"]
        GitHub["GitHub OAuth"]
        Google["Google OAuth"]
        NextAuth --> GitHub
        NextAuth --> Google
    end

    Client -->|"tRPC Client<br/>(React Query)"| API
    API -->|"Prisma Queries"| Data
    API -->|"Checkout &<br/>Webhooks"| Stripe
    Client -->|"Session"| NextAuth
    API -->|"Auth Middleware"| NextAuth
```

## Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string password
        datetime createdAt
    }

    Account {
        string id PK
        string userId FK
        string provider
        string providerAccountId
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    Organization {
        string id PK
        string name
        string slug UK
        Plan plan
        string stripeCustomerId UK
        string stripeSubscriptionId UK
    }

    Membership {
        string id PK
        Role role
        string userId FK
        string organizationId FK
    }

    Invitation {
        string id PK
        string email
        Role role
        string token UK
        datetime expires
        string organizationId FK
        string invitedById FK
    }

    ApiKey {
        string id PK
        string name
        string key UK
        datetime expiresAt
        string organizationId FK
        string createdById FK
    }

    ActivityLog {
        string id PK
        string action
        json details
        string userId FK
        string organizationId FK
        datetime createdAt
    }

    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ Membership : "belongs to orgs"
    User ||--o{ ApiKey : "created"
    User ||--o{ ActivityLog : "performed"
    User ||--o{ Invitation : "invited by"
    Organization ||--o{ Membership : "has members"
    Organization ||--o{ Invitation : "has invitations"
    Organization ||--o{ ApiKey : "has keys"
    Organization ||--o{ ActivityLog : "has logs"
```

**Enums:** `Role` (OWNER, ADMIN, MEMBER) and `Plan` (FREE, PRO, ENTERPRISE).

See the [full ER diagram](docs/diagrams/database-er.md) with all fields and annotations.

## API Reference

All API routes are served via tRPC at `/api/trpc/[trpc]`. Three middleware levels control access:

| Level | Middleware | Description |
|-------|-----------|-------------|
| **Public** | `publicProcedure` | No authentication required |
| **Protected** | `protectedProcedure` / `orgProcedure` | Requires authenticated session |
| **Admin** | `adminProcedure` | Requires ADMIN or OWNER role in the organization |

### Routes

| Route | Type | Access | Description |
|-------|------|--------|-------------|
| `auth.register` | mutation | Public | Register a new user (name, email, password) |
| `auth.me` | query | Protected | Get current user profile |
| `organization.create` | mutation | Protected | Create a new organization (caller becomes Owner) |
| `organization.list` | query | Protected | List organizations the user belongs to |
| `organization.getById` | query | Protected | Get full organization details with members |
| `organization.update` | mutation | Admin | Update organization name or logo |
| `organization.delete` | mutation | Protected | Delete organization (Owner only) |
| `member.list` | query | Protected | List all members of an organization |
| `member.invite` | mutation | Admin | Send an email invitation with role |
| `member.removeMember` | mutation | Admin | Remove a member (cannot remove Owner) |
| `member.updateRole` | mutation | Protected | Change a member's role (Owner only) |
| `billing.plans` | query | Protected | List available subscription plans |
| `billing.getSubscription` | query | Protected | Get current org subscription status |
| `billing.createCheckoutSession` | mutation | Protected | Create a Stripe Checkout session |
| `billing.createPortalSession` | mutation | Protected | Open the Stripe Customer Portal |
| `apiKey.list` | query | Protected | List organization API keys (hashed) |
| `apiKey.create` | mutation | Admin | Generate a new API key (returns plain key once) |
| `apiKey.revoke` | mutation | Admin | Delete an API key |
| `activity.list` | query | Protected | Paginated activity log for an organization |

See the [full API structure diagram](docs/diagrams/api-structure.md) for a visual overview.

## Authentication

NextAuth.js is configured with a **JWT strategy** -- no server-side session database lookups on every request. Supports three providers:

1. **Credentials** -- Email + password (bcryptjs with 12 salt rounds)
2. **GitHub OAuth** -- One-click sign in
3. **Google OAuth** -- One-click sign in

```mermaid
sequenceDiagram
    actor User
    participant Login as Login Page
    participant NextAuth as NextAuth.js
    participant DB as PostgreSQL

    User->>Login: Enter credentials / click OAuth
    Login->>NextAuth: Authentication request
    NextAuth->>DB: Verify user / create account
    DB-->>NextAuth: User record
    NextAuth-->>Login: JWT session cookie
    Login-->>User: Redirect to /dashboard
```

The `protectedProcedure` tRPC middleware calls `getServerSession()` on every API request to verify the JWT token. Organization-scoped procedures (`orgProcedure`, `adminProcedure`) additionally verify role-based membership.

See the [full authentication flow diagrams](docs/diagrams/auth-flow.md) for detailed sequences.

## Stripe Billing

Three subscription tiers with full Stripe integration:

| Plan | Price | Members | API Requests | Stripe Price ID |
|------|-------|---------|-------------|-----------------|
| Free | $0/mo | 3 | 1,000/mo | `null` |
| Pro | $29/mo | 20 | 50,000/mo | `STRIPE_PRO_PRICE_ID` |
| Enterprise | $99/mo | Unlimited | Unlimited | `STRIPE_ENTERPRISE_PRICE_ID` |

**Webhook events handled** at `/api/webhooks/stripe`:
- `checkout.session.completed` -- Activate subscription after payment
- `customer.subscription.updated` -- Sync plan changes
- `customer.subscription.deleted` -- Downgrade to Free

See the [full Stripe payment flow diagram](docs/diagrams/stripe-flow.md) for the complete sequence.

## Screenshots

Interactive HTML mockups of every major page (open in a browser):

| Page | File | Description |
|------|------|-------------|
| Landing Page | [landing-page.html](docs/screenshots/landing-page.html) | Marketing page with hero, features grid, and pricing cards |
| Login | [login.html](docs/screenshots/login.html) | OAuth buttons + email/password form |
| Dashboard | [dashboard.html](docs/screenshots/dashboard.html) | Stat cards and recent activity feed |
| Members | [members.html](docs/screenshots/members.html) | Team roster, invite form, pending invitations |
| Billing | [billing.html](docs/screenshots/billing.html) | Current plan status and plan comparison cards |
| API Keys | [api-keys.html](docs/screenshots/api-keys.html) | Key management with creation alert |

## Diagrams

Detailed Mermaid diagrams documenting the full system:

| Diagram | File | Description |
|---------|------|-------------|
| System Architecture | [architecture.md](docs/diagrams/architecture.md) | Layered overview of client, API, data, and external services |
| Database Schema | [database-er.md](docs/diagrams/database-er.md) | Full ER diagram with all models and relationships |
| Authentication Flow | [auth-flow.md](docs/diagrams/auth-flow.md) | Credentials, OAuth, and session handling sequences |
| Stripe Payment Flow | [stripe-flow.md](docs/diagrams/stripe-flow.md) | Checkout, webhook, and portal sequences |
| API Structure | [api-structure.md](docs/diagrams/api-structure.md) | tRPC router hierarchy with access levels |
| CI/CD Pipeline | [ci-cd-pipeline.md](docs/diagrams/ci-cd-pipeline.md) | GitHub Actions workflow visualization |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourusername/saas-launchpad.git
cd saas-launchpad
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)
```

### 3. Start database

```bash
docker compose up -d db
```

### 4. Run migrations and seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login with `demo@example.com` / `password123`.

### Using Docker (full stack)

```bash
docker compose up
```

This starts both PostgreSQL and the Next.js app with hot reloading.

## Project Structure

```
saas-launchpad/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, register pages
│   │   ├── (dashboard)/         # Dashboard, members, billing, API keys, activity, settings
│   │   ├── api/
│   │   │   ├── auth/            # NextAuth API route
│   │   │   ├── trpc/            # tRPC API handler
│   │   │   └── webhooks/stripe/ # Stripe webhook handler
│   │   ├── layout.tsx           # Root layout with providers
│   │   └── page.tsx             # Landing page
│   ├── components/ui/           # Reusable UI components (Avatar, Badge, Button, Card, Input, Table)
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── auth-utils.ts        # Password hashing, role helpers
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── stripe.ts            # Stripe client + PLANS config
│   │   └── trpc.tsx             # tRPC React client
│   ├── server/
│   │   ├── trpc.ts              # tRPC init, context, middleware (public/protected/admin)
│   │   └── routers/
│   │       ├── _app.ts          # Root appRouter
│   │       ├── auth.ts          # register, me
│   │       ├── organization.ts  # create, list, getById, update, delete
│   │       ├── member.ts        # list, invite, removeMember, updateRole
│   │       ├── billing.ts       # plans, getSubscription, createCheckoutSession, createPortalSession
│   │       ├── apiKey.ts        # list, create, revoke
│   │       └── activity.ts      # list (paginated)
│   ├── generated/prisma/        # Prisma generated client
│   └── types/                   # TypeScript declarations
├── prisma/
│   ├── schema.prisma            # Database schema (8 models, 2 enums)
│   └── seed.ts                  # Demo data seeder
├── tests/
│   └── unit/
│       ├── auth-utils.test.ts   # Password hashing/verification tests
│       └── stripe.test.ts       # Plans configuration tests
├── docs/
│   ├── diagrams/                # Mermaid architecture diagrams (6 files)
│   └── screenshots/             # HTML UI mockups (6 files)
├── .github/workflows/ci.yml     # GitHub Actions CI pipeline
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | App URL (e.g., `http://localhost:3000`) | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint signing secret | Yes |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan ($29/mo) | Yes |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe price ID for Enterprise plan ($99/mo) | Yes |

## Testing

Unit tests are written with [Vitest](https://vitest.dev/) and located in `tests/unit/`.

```bash
# Run all unit tests
npx vitest run

# Run tests in watch mode
npx vitest

# Run a specific test file
npx vitest run tests/unit/auth-utils.test.ts
```

### Test Coverage

| Suite | Tests | What's covered |
|-------|-------|----------------|
| `auth-utils.test.ts` | 6 | Password hashing with bcryptjs, unique salts, verification |
| `stripe.test.ts` | 6 | PLANS array structure, required fields, price ordering, enum slugs |

## Stripe Setup

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Create two Products with monthly recurring prices:
   - **Pro** at $29/month
   - **Enterprise** at $99/month
3. Copy each product's price ID to your `.env` file
4. Set up a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`
5. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Deployment

### Vercel + Railway

1. **Database:** Create a PostgreSQL instance on [Railway](https://railway.app) or [Neon](https://neon.tech)
2. **App:** Import the repo in [Vercel](https://vercel.com)
3. **Environment:** Add all environment variables in the Vercel dashboard
4. **Build:** Vercel auto-detects Next.js -- builds run `prisma generate` + `next build`
5. **Webhooks:** Update your Stripe webhook endpoint to the production URL
6. **DNS:** Configure your custom domain in Vercel

### Docker (self-hosted)

```bash
# Build the production image
docker build -t saas-launchpad .

# Run with environment variables
docker run -p 3000:3000 --env-file .env saas-launchpad
```

Or use Docker Compose for the full stack:

```bash
docker compose -f docker-compose.yml up -d
```

### CI/CD Pipeline

Every push to `main` and every pull request triggers the GitHub Actions pipeline:

1. **Lint** (ESLint) and **Type Check** (tsc) run in parallel
2. **Build** (next build) runs after both pass
3. Vercel/Railway auto-deploys on merge to `main`

See the [CI/CD pipeline diagram](docs/diagrams/ci-cd-pipeline.md) for a visual overview.

## License

MIT

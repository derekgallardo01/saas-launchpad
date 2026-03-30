# Contributing to SaaS Launchpad

Thanks for your interest in contributing! This guide will help you get started.

## Prerequisites

- **Node.js 22+** (LTS recommended)
- **Docker** (for PostgreSQL)
- **npm** (comes with Node.js)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/saas-launchpad.git
cd saas-launchpad

# Run the setup script (Linux/macOS)
bash scripts/setup.sh

# Or on Windows (PowerShell)
.\scripts\setup.ps1

# Start the dev server
npm run dev
```

Open http://localhost:3000 and log in with `demo@example.com` / `password123`.

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. **Write code** -- follow the patterns already in the codebase.
3. **Run checks** before committing:
   ```bash
   npm run type-check   # TypeScript strict mode
   npm run lint         # ESLint
   npm run test         # Vitest unit tests
   ```
4. **Commit** with a clear message (e.g., `feat: add team permissions matrix`).
5. **Open a pull request** against `main`.

## Code Style

- **TypeScript** -- strict mode enabled, no `any` types.
- **Tailwind CSS v4** -- utility-first styling, no custom CSS files.
- **tRPC patterns** -- all API routes go through tRPC routers in `src/server/routers/`.
- **Prisma** -- database changes go through `prisma/schema.prisma`, then `npx prisma migrate dev`.
- **Zod** -- all tRPC inputs are validated with Zod schemas.

## Project Structure

- `src/app/` -- Next.js App Router pages and layouts
- `src/components/ui/` -- Reusable UI components
- `src/lib/` -- Shared utilities (auth, db, stripe, trpc client)
- `src/server/` -- tRPC server, context, middleware, and routers
- `prisma/` -- Schema and migrations
- `tests/` -- Unit and integration tests

## Testing

- **Unit tests**: [Vitest](https://vitest.dev/) -- `npm run test`
- **E2E tests**: [Playwright](https://playwright.dev/) -- `npx playwright test` (when available)

When adding a new tRPC router or utility function, add corresponding tests in `tests/unit/`.

## Database Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe-your-change`
3. Update `prisma/seed.ts` if the change affects demo data
4. Commit the migration files along with your code

## Need Help?

Open an issue describing what you want to work on before starting large changes. This helps avoid duplicate effort and ensures alignment with the project direction.

# Testing

## Test Categories

### Unit Tests (`tests/unit/`)

Fast, isolated tests that validate core business logic without requiring a running server, database, or external services.

**Run unit tests:**

```bash
npm test              # single run
npm run test:watch    # watch mode
```

**Test files:**

| File | What it covers |
|---|---|
| `auth-utils.test.ts` | Password hashing and verification via bcryptjs |
| `stripe.test.ts` | PLANS configuration structure and pricing invariants |
| `organization.test.ts` | Slugify function, slug deduplication logic |
| `api-key.test.ts` | API key generation, prefix, length, SHA-256 hashing |
| `trpc-context.test.ts` | Role hierarchy ordering, role-based access control logic |

### E2E Tests (`tests/e2e/`)

Browser-based tests using Playwright that validate full user flows against a running dev server.

**Prerequisites:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Run E2E tests:**

```bash
npx playwright test                   # all browsers
npx playwright test --project=chromium  # chromium only
npx playwright test --ui               # interactive UI mode
```

**Test files:**

| File | What it covers |
|---|---|
| `landing.spec.ts` | Landing page content, pricing cards, navigation links |
| `auth.spec.ts` | Login form, OAuth buttons, registration form, password strength |

## Prerequisites

- **Unit tests:** Node.js 18+. No database or server required.
- **E2E tests:** Node.js 18+, Playwright browsers installed, and a running dev server (Playwright auto-starts it via `npm run dev` if configured in `playwright.config.ts`).

## CI/CD Integration

### GitHub Actions example

```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Notes

- Unit tests run in pure Node.js with Vitest and have no external dependencies.
- E2E tests require the database to be running (or mocked) since the Next.js dev server needs Prisma. Use `npm run db:start && npm run db:migrate` before E2E runs.
- Playwright is configured to take screenshots on failure and save traces on first retry for debugging.

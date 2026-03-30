# CI/CD Pipeline

```mermaid
flowchart LR
    Push["Git Push /<br/>Pull Request"]

    subgraph GHA["GitHub Actions"]
        direction TB
        subgraph Parallel["Parallel Jobs"]
            direction LR
            Lint["Lint<br/>(ESLint)"]
            TypeCheck["Type Check<br/>(tsc --noEmit)"]
        end
        Build["Build<br/>(next build)"]
    end

    subgraph Deploy["Deployment"]
        Vercel["Vercel /<br/>Railway"]
    end

    Push --> Lint
    Push --> TypeCheck
    Lint --> Build
    TypeCheck --> Build
    Build -->|"main branch<br/>merge"| Vercel

    style Push fill:#f3e8ff,stroke:#a855f7,color:#000
    style Lint fill:#fef3c7,stroke:#f59e0b,color:#000
    style TypeCheck fill:#fef3c7,stroke:#f59e0b,color:#000
    style Build fill:#dbeafe,stroke:#2563eb,color:#000
    style Vercel fill:#dcfce7,stroke:#22c55e,color:#000
```

### Pipeline Stages

| Stage | Runner | Steps | Trigger |
|-------|--------|-------|---------|
| **Lint** | `ubuntu-latest` | Checkout, Setup Node 22, `npm ci`, `npm run lint` | Push to `main`, PRs to `main` |
| **Type Check** | `ubuntu-latest` | Checkout, Setup Node 22, `npm ci`, `npx prisma generate`, `npx tsc --noEmit` | Push to `main`, PRs to `main` |
| **Build** | `ubuntu-latest` | Checkout, Setup Node 22, `npm ci`, `npx prisma generate`, `npm run build` | After Lint + Type Check pass |
| **Deploy** | Vercel / Railway | Automatic deployment via platform integration | Merge to `main` |

### Key Details

- **Node.js 22** with npm cache enabled for faster installs
- **Lint** and **Type Check** run in parallel to reduce pipeline time
- **Build** depends on both parallel jobs completing successfully (`needs: [lint, type-check]`)
- **Prisma Generate** runs before type-check and build to ensure generated types are available
- Build step uses minimal environment variables (no real database required)

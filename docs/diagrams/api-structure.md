# API Structure

```mermaid
graph TD
    appRouter["appRouter<br/>(tRPC v11)"]

    subgraph auth["auth Router"]
        auth_register["register<br/><i>mutation</i>"]
        auth_me["me<br/><i>query</i>"]
    end

    subgraph organization["organization Router"]
        org_create["create<br/><i>mutation</i>"]
        org_list["list<br/><i>query</i>"]
        org_getById["getById<br/><i>query</i>"]
        org_update["update<br/><i>mutation</i>"]
        org_delete["delete<br/><i>mutation</i>"]
    end

    subgraph member["member Router"]
        mem_list["list<br/><i>query</i>"]
        mem_invite["invite<br/><i>mutation</i>"]
        mem_remove["removeMember<br/><i>mutation</i>"]
        mem_updateRole["updateRole<br/><i>mutation</i>"]
    end

    subgraph billing["billing Router"]
        bill_plans["plans<br/><i>query</i>"]
        bill_getSub["getSubscription<br/><i>query</i>"]
        bill_checkout["createCheckoutSession<br/><i>mutation</i>"]
        bill_portal["createPortalSession<br/><i>mutation</i>"]
    end

    subgraph apiKey["apiKey Router"]
        key_list["list<br/><i>query</i>"]
        key_create["create<br/><i>mutation</i>"]
        key_revoke["revoke<br/><i>mutation</i>"]
    end

    subgraph activity["activity Router"]
        act_list["list<br/><i>query</i>"]
    end

    appRouter --> auth
    appRouter --> organization
    appRouter --> member
    appRouter --> billing
    appRouter --> apiKey
    appRouter --> activity

    %% Styling by access level
    style auth_register fill:#dcfce7,stroke:#16a34a,color:#000
    style auth_me fill:#dbeafe,stroke:#2563eb,color:#000
    style org_create fill:#dbeafe,stroke:#2563eb,color:#000
    style org_list fill:#dbeafe,stroke:#2563eb,color:#000
    style org_getById fill:#dbeafe,stroke:#2563eb,color:#000
    style org_update fill:#fed7aa,stroke:#ea580c,color:#000
    style org_delete fill:#dbeafe,stroke:#2563eb,color:#000
    style mem_list fill:#dbeafe,stroke:#2563eb,color:#000
    style mem_invite fill:#fed7aa,stroke:#ea580c,color:#000
    style mem_remove fill:#fed7aa,stroke:#ea580c,color:#000
    style mem_updateRole fill:#dbeafe,stroke:#2563eb,color:#000
    style bill_plans fill:#dbeafe,stroke:#2563eb,color:#000
    style bill_getSub fill:#dbeafe,stroke:#2563eb,color:#000
    style bill_checkout fill:#dbeafe,stroke:#2563eb,color:#000
    style bill_portal fill:#dbeafe,stroke:#2563eb,color:#000
    style key_list fill:#dbeafe,stroke:#2563eb,color:#000
    style key_create fill:#fed7aa,stroke:#ea580c,color:#000
    style key_revoke fill:#fed7aa,stroke:#ea580c,color:#000
    style act_list fill:#dbeafe,stroke:#2563eb,color:#000
```

### Access Level Legend

| Color | Level | Middleware | Description |
|-------|-------|-----------|-------------|
| Green | **Public** | `publicProcedure` | No authentication required |
| Blue | **Protected** | `protectedProcedure` / `orgProcedure` | Requires authenticated session (and org membership for org-scoped routes) |
| Orange | **Admin** | `adminProcedure` | Requires ADMIN or OWNER role in the organization |

### Route Details

| Route | Type | Access | Description |
|-------|------|--------|-------------|
| `auth.register` | mutation | Public | Register a new user account |
| `auth.me` | query | Protected | Get current user profile |
| `organization.create` | mutation | Protected | Create a new organization |
| `organization.list` | query | Protected | List user's organizations |
| `organization.getById` | query | Protected | Get organization details |
| `organization.update` | mutation | Admin | Update organization name/logo |
| `organization.delete` | mutation | Protected | Delete organization (Owner only) |
| `member.list` | query | Protected | List organization members |
| `member.invite` | mutation | Admin | Invite a user by email |
| `member.removeMember` | mutation | Admin | Remove a member (not Owner) |
| `member.updateRole` | mutation | Protected | Change member role (Owner only) |
| `billing.plans` | query | Protected | List available plans |
| `billing.getSubscription` | query | Protected | Get org subscription status |
| `billing.createCheckoutSession` | mutation | Protected | Start Stripe checkout |
| `billing.createPortalSession` | mutation | Protected | Open Stripe customer portal |
| `apiKey.list` | query | Protected | List organization API keys |
| `apiKey.create` | mutation | Admin | Generate a new API key |
| `apiKey.revoke` | mutation | Admin | Revoke an existing API key |
| `activity.list` | query | Protected | List org activity logs (paginated) |

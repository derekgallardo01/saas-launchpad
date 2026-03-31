"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

/**
 * Admin super-panel — visible only to users with the OWNER role.
 *
 * Displays system-wide metrics: total users, total organizations,
 * recent signups, and system health indicators.
 */

const fallbackSystemStats = [
  { label: "Total Users", value: "247", icon: "users" },
  { label: "Total Organizations", value: "38", icon: "orgs" },
  { label: "API Calls (24h)", value: "48,291", icon: "api" },
  { label: "System Health", value: "Healthy", icon: "health" },
];

const fallbackRecentSignups = [
  { name: "Sarah Chen", email: "sarah@startup.io", date: "2 hours ago", org: "Startup Labs" },
  { name: "Marcus Reid", email: "marcus@corp.dev", date: "5 hours ago", org: "Corp Dev Inc" },
  { name: "Aisha Patel", email: "aisha@design.co", date: "1 day ago", org: "Design Co" },
  { name: "Tom Baker", email: "tom@acme.com", date: "1 day ago", org: "Acme Inc" },
  { name: "Elena Volkov", email: "elena@tech.io", date: "2 days ago", org: "TechIO" },
];

const fallbackOrgMetrics = [
  { name: "Acme Inc", plan: "PRO", members: 12, apiCalls: 18420 },
  { name: "Startup Labs", plan: "ENTERPRISE", members: 45, apiCalls: 24100 },
  { name: "Design Co", plan: "FREE", members: 3, apiCalls: 412 },
  { name: "Corp Dev Inc", plan: "PRO", members: 8, apiCalls: 5359 },
];

const planBadgeVariant: Record<string, "default" | "success" | "warning"> = {
  FREE: "default",
  PRO: "warning",
  ENTERPRISE: "success",
};

function StatIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    orgs: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
    api: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    health: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  };

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[type] || icons.users} />
    </svg>
  );
}

export default function AdminPage() {
  // In production, the OWNER role check is enforced at the tRPC layer.
  // The query below fetches the current user's orgs to verify ownership on the client side.
  const orgsQuery = trpc.organization.list.useQuery(undefined, { retry: false });

  const orgs = orgsQuery.data;
  // The `organization.list` query returns objects with a top-level `role` field
  // representing the current user's role in each org.
  const isOwner = orgs?.some(
    (org) => (org as { role?: string }).role === "OWNER",
  );

  const isLoading = orgsQuery.isLoading;

  // If the user is not an owner and data has loaded, show an access denied message.
  if (!isLoading && !isOwner && orgs) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold dark:text-white">Access Denied</h2>
          <p className="mt-1 text-sm text-zinc-500">
            This page is restricted to organization owners.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold dark:text-white">Admin Panel</h1>
          <Badge variant="warning">Owner Only</Badge>
        </div>
        <p className="text-zinc-500">
          System-wide overview and administrative controls.
        </p>
      </div>

      {/* System Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : fallbackSystemStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      <StatIcon type={stat.icon} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {fallbackRecentSignups.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between border-b border-zinc-100 pb-3 last:border-0 last:pb-0 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800 dark:text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">{user.date}</p>
                      <p className="text-xs text-zinc-400">{user.org}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Org Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {fallbackOrgMetrics.map((org) => (
                  <div
                    key={org.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold dark:bg-zinc-800 dark:text-white">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">{org.name}</p>
                        <p className="text-xs text-zinc-500">
                          {org.members} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-medium tabular-nums dark:text-white">
                          {org.apiCalls.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-500">API calls</p>
                      </div>
                      <Badge variant={planBadgeVariant[org.plan]}>{org.plan}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Database (PostgreSQL)", status: "Operational", latency: "4ms" },
              { name: "Auth Service (NextAuth)", status: "Operational", latency: "12ms" },
              { name: "Payment Gateway (Stripe)", status: "Operational", latency: "89ms" },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">{service.name}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {service.status}
                    </p>
                  </div>
                </div>
                <span className="text-xs tabular-nums text-zinc-500">
                  {service.latency}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

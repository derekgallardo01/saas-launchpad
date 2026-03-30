"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCurrentOrg } from "@/lib/org-context";

const fallbackStats = [
  { label: "Members", value: "5", change: "+2 this month" },
  { label: "API Keys", value: "3", change: "1 expiring soon" },
  { label: "Current Plan", value: "Pro", change: "$29/month" },
  { label: "API Calls", value: "12,459", change: "24% of limit" },
];

const fallbackActivity = [
  { action: "Member invited", detail: "jane@example.com as Admin", time: "2 hours ago" },
  { action: "API key created", detail: "Production API Key", time: "5 hours ago" },
  { action: "Plan upgraded", detail: "Free \u2192 Pro", time: "1 day ago" },
  { action: "Organization created", detail: "Acme Inc", time: "2 days ago" },
];

export default function DashboardPage() {
  const { orgId } = useCurrentOrg();
  const orgsQuery = trpc.organization.list.useQuery(undefined, { retry: false });
  const activityQuery = trpc.activity.list.useQuery(
    { orgId, page: 1, limit: 5 },
    { retry: false },
  );

  const orgs = orgsQuery.data;
  const stats = orgs
    ? [
        { label: "Members", value: String(orgs[0]?._count?.memberships ?? 0), change: "from your org" },
        { label: "API Keys", value: "—", change: "view in API Keys" },
        { label: "Current Plan", value: "Pro", change: "$29/month" },
        { label: "API Calls", value: "12,459", change: "24% of limit" },
      ]
    : fallbackStats;

  const activityItems = activityQuery.data?.items;
  const recentActivity = activityItems
    ? activityItems.map((item) => ({
        action: item.action,
        detail: item.user?.name ?? item.user?.email ?? "",
        time: new Date(item.createdAt).toLocaleDateString(),
      }))
    : fallbackActivity;

  const isLoading = orgsQuery.isLoading || activityQuery.isLoading;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-zinc-500">Welcome back! Here&apos;s an overview of your organization.</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
                  <p className="text-xs text-zinc-500">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))
              : recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                    <div>
                      <p className="font-medium dark:text-white">{item.action}</p>
                      <p className="text-sm text-zinc-500">{item.detail}</p>
                    </div>
                    <Badge variant="outline">{item.time}</Badge>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

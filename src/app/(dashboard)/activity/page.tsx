"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCurrentOrg } from "@/lib/org-context";

const fallbackActivities = [
  { user: "Derek G.", action: "invited jane@example.com as Admin", time: "2 hours ago", icon: "\u{1F464}" },
  { user: "Derek G.", action: "created API key 'Production API Key'", time: "5 hours ago", icon: "\u{1F511}" },
  { user: "Jane Smith", action: "accepted invitation", time: "1 day ago", icon: "\u2705" },
  { user: "Derek G.", action: "upgraded plan from Free to Pro", time: "1 day ago", icon: "\u2B06\uFE0F" },
  { user: "Derek G.", action: "created organization 'Acme Inc'", time: "2 days ago", icon: "\u{1F3E2}" },
  { user: "Derek G.", action: "registered account", time: "2 days ago", icon: "\u{1F389}" },
];

const ACTION_ICONS: Record<string, string> = {
  "org.created": "\u{1F3E2}",
  "org.updated": "\u270F\uFE0F",
  "member.invited": "\u{1F464}",
  "member.removed": "\u274C",
  "member.roleUpdated": "\u{1F6E1}\uFE0F",
  "apiKey.created": "\u{1F511}",
  "apiKey.revoked": "\u{1F6AB}",
};

export default function ActivityPage() {
  const { orgId } = useCurrentOrg();
  const [page, setPage] = useState(1);
  const limit = 20;

  const activityQuery = trpc.activity.list.useQuery(
    { orgId, page, limit },
    { retry: false },
  );

  const queryItems = activityQuery.data?.items;
  const totalPages = activityQuery.data?.pages ?? 1;

  const activities = queryItems
    ? queryItems.map((item) => ({
        user: item.user?.name ?? item.user?.email ?? "Unknown",
        action: item.action,
        time: new Date(item.createdAt).toLocaleDateString(),
        icon: ACTION_ICONS[item.action] ?? "\u{1F4CB}",
      }))
    : fallbackActivities;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Activity Log</h1>
        <p className="text-zinc-500">A complete audit trail of organization actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityQuery.isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 pl-12">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-6">
                {activities.map((item, i) => (
                  <div key={i} className="relative flex items-start gap-4 pl-12">
                    <div className="absolute left-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs dark:bg-zinc-950">{item.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm dark:text-white">
                        <span className="font-medium">{item.user}</span>{" "}{item.action}
                      </p>
                      <p className="text-xs text-zinc-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {queryItems && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

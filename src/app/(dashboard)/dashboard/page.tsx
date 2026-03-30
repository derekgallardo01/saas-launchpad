import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Members", value: "5", change: "+2 this month" },
  { label: "API Keys", value: "3", change: "1 expiring soon" },
  { label: "Current Plan", value: "Pro", change: "$29/month" },
  { label: "API Calls", value: "12,459", change: "24% of limit" },
];

const recentActivity = [
  { action: "Member invited", detail: "jane@example.com as Admin", time: "2 hours ago" },
  { action: "API key created", detail: "Production API Key", time: "5 hours ago" },
  { action: "Plan upgraded", detail: "Free → Pro", time: "1 day ago" },
  { action: "Organization created", detail: "Acme Inc", time: "2 days ago" },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-zinc-500">Welcome back! Here&apos;s an overview of your organization.</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            {recentActivity.map((item, i) => (
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

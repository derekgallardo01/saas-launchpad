import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

const activities = [
  { user: "Derek G.", action: "invited jane@example.com as Admin", time: "2 hours ago", icon: "👤" },
  { user: "Derek G.", action: "created API key 'Production API Key'", time: "5 hours ago", icon: "🔑" },
  { user: "Jane Smith", action: "accepted invitation", time: "1 day ago", icon: "✅" },
  { user: "Derek G.", action: "upgraded plan from Free to Pro", time: "1 day ago", icon: "⬆️" },
  { user: "Derek G.", action: "created organization 'Acme Inc'", time: "2 days ago", icon: "🏢" },
  { user: "Derek G.", action: "registered account", time: "2 days ago", icon: "🎉" },
];

export default function ActivityPage() {
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
        </CardContent>
      </Card>
    </div>
  );
}

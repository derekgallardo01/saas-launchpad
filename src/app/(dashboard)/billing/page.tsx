"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useCurrentOrg } from "@/lib/org-context";

const fallbackPlans = [
  { name: "Free", price: "$0", features: ["Up to 3 members", "1,000 API requests/mo", "Community support"], current: false },
  { name: "Pro", price: "$29", features: ["Up to 20 members", "50,000 API requests/mo", "Priority support", "Custom branding"], current: true },
  { name: "Enterprise", price: "$99", features: ["Unlimited members", "Unlimited API requests", "24/7 support", "SSO", "Audit logs"], current: false },
];

export default function BillingPage() {
  const { orgId } = useCurrentOrg();

  const plansQuery = trpc.billing.plans.useQuery(undefined, { retry: false });
  const subscriptionQuery = trpc.billing.getSubscription.useQuery({ orgId }, { retry: false });

  const currentPlan = subscriptionQuery.data?.plan ?? "PRO";

  const queryPlans = plansQuery.data;
  const plans = queryPlans
    ? queryPlans.map((p) => ({
        name: p.name,
        price: `$${p.price}`,
        features: p.features,
        current: p.slug === currentPlan,
      }))
    : fallbackPlans;

  const currentPlanObj = plans.find((p) => p.current);
  const nextBillingDate = subscriptionQuery.data?.stripeCurrentPeriodEnd
    ? new Date(subscriptionQuery.data.stripeCurrentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "April 30, 2026";

  const isLoading = plansQuery.isLoading || subscriptionQuery.isLoading;

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="mb-1 h-6 w-28" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="mb-2 h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-2">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Billing</h1>
        <p className="text-zinc-500">Manage your subscription and billing details.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {currentPlanObj?.name ?? "Pro"} plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold dark:text-white">{currentPlanObj?.price ?? "$29"}</span>
                <span className="text-zinc-500">/month</span>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-500">Next billing date: {nextBillingDate}</p>
            </div>
            <Button variant="outline">Manage Billing</Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold dark:text-white">Available Plans</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.current ? "ring-2 ring-zinc-900 dark:ring-zinc-50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.current && <Badge>Current</Badge>}
              </CardTitle>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold dark:text-white">{plan.price}</span>
                <span className="ml-1 text-zinc-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.current ? "outline" : "default"} className="w-full" disabled={plan.current}>
                {plan.current ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

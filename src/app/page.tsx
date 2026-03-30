import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Authentication", desc: "Email/password, GitHub, Google OAuth with NextAuth.js. JWT sessions, secure by default.", icon: "🔐" },
  { title: "Multi-Tenancy", desc: "Organizations with role-based access. Owner, Admin, Member roles with granular permissions.", icon: "🏢" },
  { title: "Stripe Billing", desc: "Subscription plans, checkout, customer portal. Webhook-driven state management.", icon: "💳" },
  { title: "API Keys", desc: "Generate, manage, and revoke API keys. SHA-256 hashed storage, expiration support.", icon: "🔑" },
  { title: "Activity Logs", desc: "Automatic audit trail for all organization actions. Paginated, filterable timeline.", icon: "📋" },
  { title: "Dark Mode", desc: "System-aware dark mode with manual toggle. Consistent design across all pages.", icon: "🌙" },
];

const plans = [
  { name: "Free", price: "$0", period: "/month", features: ["Up to 3 members", "1,000 API requests/mo", "Community support"], cta: "Get Started" },
  { name: "Pro", price: "$29", period: "/month", features: ["Up to 20 members", "50,000 API requests/mo", "Priority support", "Custom branding"], cta: "Start Free Trial", popular: true },
  { name: "Enterprise", price: "$99", period: "/month", features: ["Unlimited members", "Unlimited API requests", "24/7 support", "SSO", "Audit logs"], cta: "Contact Sales" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold">SaaS Launchpad</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">Log in</Link>
            <Link href="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mb-4 inline-block rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Open Source SaaS Boilerplate
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
          Launch Your SaaS<br />
          <span className="text-zinc-400">In Days, Not Months</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Production-ready boilerplate with authentication, multi-tenant organizations, Stripe billing, API keys, and activity logs. Built with Next.js, tRPC, Prisma, and TypeScript.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/register"><Button size="lg">Start Building</Button></Link>
          <Button variant="outline" size="lg">View on GitHub</Button>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50 py-24 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold dark:text-white">Everything You Need</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold dark:text-white">{f.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold dark:text-white">Simple Pricing</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-xl border p-8 ${plan.popular ? "border-zinc-900 shadow-lg dark:border-zinc-50" : "border-zinc-200 dark:border-zinc-800"}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-900">Most Popular</span>
                )}
                <h3 className="text-lg font-semibold dark:text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold dark:text-white">{plan.price}</span>
                  <span className="ml-1 text-zinc-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                      <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "default" : "outline"} className="mt-8 w-full">{plan.cta}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
          Built with Next.js, tRPC, Prisma, and Stripe. MIT License.
        </div>
      </footer>
    </div>
  );
}

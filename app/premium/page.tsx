import Link from "next/link";
import {
  activatePremiumMvpBypass,
  createBillingPortalSession,
  createPremiumCheckoutSession,
} from "@/src/billing/actions";
import { env } from "@/src/config/env";
import { getCurrentUserAndPlan } from "@/src/domain/billing/current-user";
import { MarketingShell } from "@/src/components/marketing/marketing-shell";

export const dynamic = "force-dynamic";

type PremiumPageProps = {
  searchParams?: Promise<{
    billing?: string;
  }>;
};

function billingMessage(code: string | undefined): string | null {
  if (!code) {
    return null;
  }

  if (code === "cancelled") {
    return "Checkout was cancelled. You can upgrade any time.";
  }

  if (code === "checkout_failed") {
    return "Unable to start checkout. Please verify Stripe configuration and try again.";
  }

  if (code === "no_customer") {
    return "No active billing profile found yet. Upgrade first to enable subscription management.";
  }

  return null;
}

const comparison = [
  {
    feature: "PDF uploads per course",
    free: "Up to 5",
    premium: "Unlimited",
  },
  {
    feature: "Max file size",
    free: "10 MB",
    premium: "25 MB",
  },
  {
    feature: "Study asset quality",
    free: "Basic",
    premium: "Full AI-powered depth",
  },
  {
    feature: "Practice quiz size",
    free: "5-10 questions",
    premium: "15-25 questions",
  },
  {
    feature: "Flashcards",
    free: "Limited set",
    premium: "Advanced full set",
  },
  {
    feature: "Likely exam focus ranking",
    free: "Top-level",
    premium: "Detailed ranking + reasoning",
  },
  {
    feature: "Processing priority",
    free: "Standard",
    premium: "Faster priority generation",
  },
];

export default async function PremiumPage({ searchParams }: PremiumPageProps) {
  const [{ user, plan }, params] = await Promise.all([
    getCurrentUserAndPlan(),
    searchParams,
  ]);
  const isPremium = Boolean(plan?.isPremium);
  const message = billingMessage(params?.billing);

  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <section className="rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-8 shadow-xl shadow-blue-950/30">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Premium Plan
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Unlock deeper study intelligence with ClassIntel Premium.
          </h1>
          <p className="mt-4 max-w-3xl text-slate-200">
            Premium is designed for students in high-stakes courses who want
            richer, faster, and more complete study outputs from their own
            course materials.
          </p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/50 p-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Pricing
              </p>
              <p className="mt-1 text-4xl font-bold text-cyan-200">$9.99</p>
              <p className="text-sm text-slate-300">per month</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!user ? (
                <Link
                  href="/auth/sign-in?next=/premium"
                  className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Sign In to Upgrade
                </Link>
              ) : isPremium ? (
                <>
                  <form action={createBillingPortalSession}>
                    <button className="rounded-lg border border-cyan-300/60 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-400/20">
                      Manage Subscription
                    </button>
                  </form>
                  <Link
                    href="/dashboard"
                    className="rounded-lg border border-slate-600 px-5 py-3 font-semibold text-white hover:border-slate-400"
                  >
                    Open Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <form action={createPremiumCheckoutSession}>
                    <button className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
                      Upgrade to Premium
                    </button>
                  </form>
                  {!env.STRIPE_SECRET_KEY ? (
                    <form action={activatePremiumMvpBypass}>
                      <button className="rounded-lg border border-amber-400/60 px-5 py-3 font-semibold text-amber-200 hover:bg-amber-500/10">
                        Activate Premium (Local MVP)
                      </button>
                    </form>
                  ) : null}
                </>
              )}
            </div>
          </div>
          {message ? (
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
              {message}
            </p>
          ) : null}
          {isPremium ? (
            <p className="mt-4 inline-flex rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1 text-sm font-semibold text-emerald-200">
              Premium Active
            </p>
          ) : null}
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold">Free vs Premium</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="py-2 pr-4">Feature</th>
                  <th className="py-2 pr-4">Free</th>
                  <th className="py-2 pr-4 text-cyan-200">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-slate-200">{row.feature}</td>
                    <td className="py-2 pr-4 text-slate-400">{row.free}</td>
                    <td className="py-2 pr-4 text-cyan-100">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Future Features: Smart tutoring mode, adaptive review plans, and collaborative study rooms
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

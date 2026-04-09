import Link from "next/link";
import { Logo } from "@/src/components/marketing/logo";
import { getCurrentUserAndPlan } from "@/src/domain/billing/current-user";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/premium", label: "Premium" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const { user, plan } = await getCurrentUserAndPlan();
  const isPremium = Boolean(plan?.isPremium);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Logo compact />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-200 transition hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={user ? "/premium" : "/auth/sign-in"}
          className="rounded-lg border border-cyan-300/60 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-200 hover:bg-cyan-400/20"
        >
          {isPremium ? "Premium" : user ? "Upgrade" : "Get Started"}
        </Link>
      </div>
    </header>
  );
}

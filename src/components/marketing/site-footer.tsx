import Link from "next/link";
import { Logo } from "@/src/components/marketing/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-slate-300">
            ClassIntel helps students in demanding courses focus on high-yield material with professor-aware study intelligence.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <Link href="/premium" className="hover:text-cyan-300">Premium</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-cyan-300">About</Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-cyan-300">How It Works</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-cyan-300">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Built For</h3>
          <p className="mt-4 text-sm text-slate-300">
            Pre-med, engineering, CS, and science students who need a smarter way to prepare for high-stakes exams.
          </p>
        </div>
      </div>
    </footer>
  );
}

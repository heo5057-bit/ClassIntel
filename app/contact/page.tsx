import Link from "next/link";
import { MarketingShell } from "@/src/components/marketing/marketing-shell";

export default function ContactPage() {
  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Let&apos;s bring smarter studying to your campus.
          </h1>
          <p className="mt-4 text-lg text-slate-200">
            Reach out for student organization partnerships, campus adoption, or
            product support.
          </p>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-xl shadow-slate-950/30">
            <h2 className="text-2xl font-semibold">Contact Details</h2>
            <p className="mt-4 text-slate-300">Email: Heo5057@psu.edu</p>
            <p className="mt-2 text-slate-300">Response time: typically within 24 hours</p>
            <p className="mt-2 text-slate-300">Location: United States (remote-first team)</p>
            <div className="mt-6 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm text-cyan-100">
                Ready to start studying smarter? Open your dashboard and begin
                building your first course workspace.
              </p>
              <Link
                href="/auth/sign-in"
                className="mt-3 inline-flex rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Get Started
              </Link>
            </div>
          </article>

          <form className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-xl shadow-slate-950/30">
            <h2 className="text-2xl font-semibold">Send a Message</h2>
            <p className="mt-2 text-sm text-slate-300">We&apos;ll follow up with practical next steps.</p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Email</span>
                <input
                  type="email"
                  placeholder="you@school.edu"
                  className="w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Message</span>
                <textarea
                  rows={5}
                  placeholder="Tell us about your course needs"
                  className="w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 focus:border-cyan-300 focus:outline-none"
                />
              </label>
              <a
                href="mailto:Heo5057@psu.edu?subject=ClassIntel%20Question"
                className="inline-flex rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Send Email
              </a>
            </div>
          </form>
        </section>
      </main>
    </MarketingShell>
  );
}

import Link from "next/link";
import { EmailCaptureForm } from "@/src/components/marketing/email-capture-form";
import { MarketingImage } from "@/src/components/marketing/marketing-image";
import { MarketingShell } from "@/src/components/marketing/marketing-shell";

const highlights = [
  {
    title: "Course-Specific, Not Generic",
    text: "ClassIntel studies your own class files so recommendations match your professor's style instead of broad internet summaries.",
  },
  {
    title: "High-Yield Focus",
    text: "Spend your time on the topics most likely to appear on exams based on repeated signals across your materials.",
  },
  {
    title: "Explainable Rankings",
    text: "Every priority includes a clear reason, so students can trust what to study first and why it matters.",
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-18 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Built for demanding college courses
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Stop guessing what to study. Learn what your professor is most
              likely to test.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200">
              ClassIntel helps students in pre-med, engineering, CS, and
              science courses prioritize high-yield topics, generate targeted
              study guides, and practice with professor-style quizzes.
            </p>
            <p className="mt-4 max-w-2xl text-base text-slate-300">
              Students pay for ClassIntel because it saves hours of low-value
              studying and improves confidence before high-stakes exams.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/#early-access"
                className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Get Early Access Pricing
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-slate-500 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2">
                <p className="text-xl font-semibold text-cyan-200">3x</p>
                <p className="text-xs text-slate-300">Faster topic prioritization</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2">
                <p className="text-xl font-semibold text-cyan-200">Clear</p>
                <p className="text-xs text-slate-300">Evidence behind each ranking</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2">
                <p className="text-xl font-semibold text-cyan-200">Built</p>
                <p className="text-xs text-slate-300">For course-specific outcomes</p>
              </div>
            </div>
          </div>

          {/* TODO: Replace /me-1.jpg with your final homepage hero image. */}
          <MarketingImage
            src="/me-1.jpg"
            alt="Students collaborating with laptops and notes"
            fallbackLabel="Hero image placeholder (replace with /public/me-1.jpg)"
            priority
          />
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-14">
          <div className="mb-5 max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Why ClassIntel outperforms generic study tools
            </h2>
            <p className="mt-2 text-slate-300">
              Generic tools summarize. ClassIntel prioritizes what is most
              likely to show up in your class.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30"
              >
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl items-start gap-10 px-6 py-10 lg:grid-cols-2">
          <div className="space-y-5 lg:pr-4">
            <h2 className="text-3xl font-semibold">Why students pay for ClassIntel</h2>
            <p className="text-slate-200">
              Instead of treating every chapter equally, ClassIntel shows where
              to focus first using professor-specific signals from your own
              course materials.
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="rounded-lg border border-white/10 bg-slate-900/60 p-3">Built for students in hard courses with limited study time and high pressure.</li>
              <li className="rounded-lg border border-white/10 bg-slate-900/60 p-3">Delivers targeted guides and quizzes aligned to your professor&apos;s emphasis patterns.</li>
              <li className="rounded-lg border border-white/10 bg-slate-900/60 p-3">Provides transparent reasoning for every recommendation, so you can trust the plan.</li>
            </ul>
          </div>

          <EmailCaptureForm />
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-20 md:grid-cols-2">
          {/* TODO: Replace /me-2.jpg with your product or materials image. */}
          <MarketingImage
            src="/me-2.jpg"
            alt="Lecture slides and notes spread across a desk"
            fallbackLabel="Materials image placeholder (replace with /public/me-2.jpg)"
            aspectClassName="aspect-[4/3]"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          {/* TODO: Replace /me-3.jpg with your student outcome image. */}
          <MarketingImage
            src="/me-3.jpg"
            alt="Student preparing with quiz practice on laptop"
            fallbackLabel="Outcome image placeholder (replace with /public/me-3.jpg)"
            aspectClassName="aspect-[4/3]"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </section>
      </main>
    </MarketingShell>
  );
}

import { InteractiveDemo } from "@/src/components/marketing/interactive-demo";
import { MarketingShell } from "@/src/components/marketing/marketing-shell";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            How It Works
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            A clear 4-step workflow from raw course files to focused exam prep.
          </h1>
          <p className="mt-5 text-lg text-slate-200">
            ClassIntel converts your materials into ranked priorities, targeted
            study guidance, and realistic practice so each study session is more
            deliberate.
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Step 1</p>
            <h2 className="mt-2 text-xl font-semibold">Upload Materials</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Add lecture slides, notes, review guides, and prior quizzes so
              ClassIntel can model your specific course context.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Step 2</p>
            <h2 className="mt-2 text-xl font-semibold">Analyze Patterns</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              The system detects repeated concepts, structural emphasis, and
              overlap with assessed material across files.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Step 3</p>
            <h2 className="mt-2 text-xl font-semibold">Rank What Matters</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Topics are prioritized by likely impact, with confidence and
              evidence so you know what to study first.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Step 4</p>
            <h2 className="mt-2 text-xl font-semibold">Practice Strategically</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Generate study guides and professor-style quizzes aligned to your
              weak areas and highest-yield concepts.
            </p>
          </article>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-semibold">Analysis Walkthrough</h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            Preview the workflow your workspace runs after uploads: topic
            ranking, study-guide generation, and quiz construction.
          </p>
          <div className="mt-6">
            <InteractiveDemo />
          </div>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Open Dashboard
          </Link>
        </section>
      </main>
    </MarketingShell>
  );
}

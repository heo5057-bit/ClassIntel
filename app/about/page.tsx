import { MarketingImage } from "@/src/components/marketing/marketing-image";
import { MarketingShell } from "@/src/components/marketing/marketing-shell";

export default function AboutPage() {
  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            About ClassIntel
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Built from a simple belief: students should know what matters before
            they burn out studying everything.
          </h1>
          <p className="mt-5 text-lg text-slate-200">
            ClassIntel was created to solve a common problem in demanding
            classes: students work incredibly hard, but still miss the concepts
            their professor emphasizes most.
          </p>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="mt-3 leading-7 text-slate-300">
              Give every student access to the kind of strategic study insight usually available only through expensive tutors or upperclassman notes.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
            <h2 className="text-2xl font-semibold">Who We Serve</h2>
            <p className="mt-3 leading-7 text-slate-300">
              Students in pre-med, engineering, CS, and science programs who need to make every study hour count in rigorous courses.
            </p>
          </article>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-5">
          <article className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
              Founder Story
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Why this exists</h2>
            <p className="mt-4 leading-7 text-slate-300">
              ClassIntel started after watching high-performing students spend
              entire weekends trying to study everything in a course, without a
              clear way to prioritize what would actually impact exam results.
            </p>
            <p className="mt-3 leading-7 text-slate-300">
              We built ClassIntel to turn scattered course materials into a
              strategic game plan that feels personal, transparent, and
              immediately useful.
            </p>
            <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
              We are building this with students, not just for students.
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold">Credibility Focus</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                Recommendations include evidence and confidence level.
              </li>
              <li className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                Designed around real course artifacts, not generic prompts.
              </li>
              <li className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
                Built for repeatable weekly study workflows.
              </li>
            </ul>
          </article>
        </section>

        <section className="mt-12 rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-6 shadow-xl shadow-blue-950/30">
          <h2 className="text-2xl font-semibold">30-Second Pitch Video</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            A quick overview for prospective users, campus partners, and early
            supporters.
          </p>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            {/* TODO: Replace this placeholder embed URL with your real 30-second pitch video link. */}
            <iframe
              title="ClassIntel 30-second pitch video"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              className="h-[320px] w-full bg-slate-950"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="mt-12">
          {/* TODO: Replace /me-1.png with your founder/team photo. */}
          <MarketingImage
            src="/me-1.png"
            alt="ClassIntel team placeholder"
            fallbackLabel="Team photo placeholder (replace with /me-1.png)"
            aspectClassName="aspect-[16/7]"
            sizes="100vw"
          />
        </section>
      </main>
    </MarketingShell>
  );
}

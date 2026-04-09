import Link from "next/link";

export function EmailCaptureForm() {
  return (
    <div
      className="rounded-2xl border border-cyan-300/25 bg-slate-900/85 p-6 shadow-2xl shadow-cyan-900/30 sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
        Live Product
      </p>
      <h3 className="mt-2 text-2xl font-semibold">
        Start using ClassIntel now.
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Create a course workspace, upload your materials, and generate targeted
        study guides, quizzes, and flashcards.
      </p>
      <div className="mt-5">
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg bg-cyan-400 px-5 py-2.5 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
}

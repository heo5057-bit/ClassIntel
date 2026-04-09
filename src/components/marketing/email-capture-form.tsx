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
        Start using Professor Mode in your real courses today.
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Create an account, add a course workspace, upload materials, and
        generate study guides, practice quizzes, flashcards, and quick-review
        summaries.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href="/auth/sign-in"
          className="rounded-lg bg-cyan-400 px-4 py-2.5 text-center font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Sign Up
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-600 px-4 py-2.5 text-center font-semibold text-white transition hover:border-cyan-300"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/src/auth/actions";

type WorkspaceShellProps = {
  courseId: string;
  courseName: string;
  children: ReactNode;
};

const navLinks = [
  { label: "Workspace", suffix: "" },
  { label: "Study Guide", suffix: "/study-guide" },
  { label: "Practice Quiz", suffix: "/practice-quiz" },
  { label: "Flashcards", suffix: "/flashcards" },
  { label: "Quick Review", suffix: "/quick-review" },
];

export function WorkspaceShell({
  courseId,
  courseName,
  children,
}: WorkspaceShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Professor Mode Workspace
              </p>
              <h1 className="mt-2 text-2xl font-bold">{courseName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-slate-500"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-slate-500">
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.suffix || "workspace"}
                href={`/dashboard/courses/${courseId}${link.suffix}`}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-cyan-300/60 hover:text-cyan-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}

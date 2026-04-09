import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/src/components/product/workspace-shell";
import { requireAuthenticatedUser } from "@/src/auth/guards";
import {
  getWorkspaceOverview,
  getWorkspaceStudyAsset,
  parseFlashcardsPayload,
} from "@/src/domain/workspace/workspace-service";
import { runAnalysisAction } from "@/app/dashboard/courses/[courseId]/actions";

export const dynamic = "force-dynamic";

type FlashcardsPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const user = await requireAuthenticatedUser();
  const { courseId } = await params;

  const [workspace, asset] = await Promise.all([
    getWorkspaceOverview({ userId: user.id, courseId }),
    getWorkspaceStudyAsset({
      userId: user.id,
      courseId,
      type: "FLASHCARDS",
    }),
  ]);

  if (!workspace) {
    notFound();
  }

  const cards = asset ? parseFlashcardsPayload(asset.payload) : [];

  return (
    <WorkspaceShell courseId={courseId} courseName={workspace.course.name}>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Flashcards</h2>
            <p className="mt-2 text-sm text-slate-300">
              Topic-organized cards generated from course-specific patterns and
              evidence signals.
            </p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-slate-500"
          >
            Back to Workspace
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-300">
              No flashcards generated yet. Run analysis to build flashcards.
            </p>
            <form action={runAnalysisAction} className="mt-3">
              <input type="hidden" name="courseId" value={courseId} />
              <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                Generate Flashcards
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {cards.map((card, index) => (
              <article
                key={`${card.topic}-${index}`}
                className="rounded-xl border border-slate-700 bg-slate-950/60 p-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  {card.topic}
                </p>
                <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Front
                  </p>
                  <p className="mt-1 text-sm text-slate-100">{card.front}</p>
                </div>
                <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/80 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Back
                  </p>
                  <p className="mt-1 text-sm text-slate-200">{card.back}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </WorkspaceShell>
  );
}

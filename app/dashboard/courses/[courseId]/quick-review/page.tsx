import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/src/components/product/workspace-shell";
import { requireAuthenticatedUser } from "@/src/auth/guards";
import {
  getWorkspaceOverview,
  getWorkspaceStudyAsset,
  parseQuickReviewPayload,
} from "@/src/domain/workspace/workspace-service";
import { runAnalysisAction } from "@/app/dashboard/courses/[courseId]/actions";

export const dynamic = "force-dynamic";

type QuickReviewPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function QuickReviewPage({ params }: QuickReviewPageProps) {
  const user = await requireAuthenticatedUser();
  const { courseId } = await params;

  const [workspace, asset] = await Promise.all([
    getWorkspaceOverview({ userId: user.id, courseId }),
    getWorkspaceStudyAsset({
      userId: user.id,
      courseId,
      type: "CRAM_SHEET",
    }),
  ]);

  if (!workspace) {
    notFound();
  }

  const items = asset ? parseQuickReviewPayload(asset.payload) : [];

  return (
    <WorkspaceShell courseId={courseId} courseName={workspace.course.name}>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Quick Review Summary</h2>
            <p className="mt-2 text-sm text-slate-300">
              Most likely high-yield topics based on observed course patterns.
              Confidence reflects evidence strength, not guaranteed outcomes.
            </p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-slate-500"
          >
            Back to Workspace
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-300">
              No quick review generated yet. Run analysis to generate top exam
              focus areas.
            </p>
            <form action={runAnalysisAction} className="mt-3">
              <input type="hidden" name="courseId" value={courseId} />
              <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                Generate Quick Review
              </button>
            </form>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li
                key={item.topic}
                className="rounded-xl border border-slate-700 bg-slate-950/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{item.topic}</h3>
                  <p className="text-sm text-cyan-200">
                    Confidence {(item.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {item.reasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">How to review:</span>{" "}
                  {item.howToReview}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </WorkspaceShell>
  );
}

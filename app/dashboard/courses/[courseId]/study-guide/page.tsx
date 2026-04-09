import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/src/components/product/workspace-shell";
import { requireAuthenticatedUser } from "@/src/auth/guards";
import {
  getWorkspaceOverview,
  getWorkspaceStudyAsset,
  parseStudyGuidePayload,
} from "@/src/domain/workspace/workspace-service";
import { runAnalysisAction } from "@/app/dashboard/courses/[courseId]/actions";

export const dynamic = "force-dynamic";

type StudyGuidePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function StudyGuidePage({ params }: StudyGuidePageProps) {
  const user = await requireAuthenticatedUser();
  const { courseId } = await params;

  const [workspace, asset] = await Promise.all([
    getWorkspaceOverview({ userId: user.id, courseId }),
    getWorkspaceStudyAsset({
      userId: user.id,
      courseId,
      type: "STUDY_GUIDE",
    }),
  ]);

  if (!workspace) {
    notFound();
  }

  const sections = asset ? parseStudyGuidePayload(asset.payload) : [];

  return (
    <WorkspaceShell courseId={courseId} courseName={workspace.course.name}>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Study Guide</h2>
            <p className="mt-2 text-sm text-slate-300">
              Organized by topic priority, emphasis level, key points, and why
              each topic matters.
            </p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-slate-500"
          >
            Back to Workspace
          </Link>
        </div>

        {sections.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-300">
              No study guide generated yet. Upload materials and run Professor
              Mode analysis first.
            </p>
            <form action={runAnalysisAction} className="mt-3">
              <input type="hidden" name="courseId" value={courseId} />
              <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                Generate Study Guide
              </button>
            </form>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {sections.map((section) => (
              <li
                key={section.topic}
                className="rounded-xl border border-slate-700 bg-slate-950/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{section.topic}</h3>
                  <p className="text-sm text-cyan-200">
                    {section.importance} • {(section.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{section.summary}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Key Points
                </p>
                <ul className="mt-1 space-y-1 text-sm text-slate-200">
                  {section.keyPoints.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Why It Matters
                </p>
                <ul className="mt-1 space-y-1 text-sm text-slate-300">
                  {section.whyItMatters.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </WorkspaceShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/src/components/product/workspace-shell";
import { requireAuthenticatedUser } from "@/src/auth/guards";
import {
  getWorkspaceOverview,
  getWorkspaceStudyAsset,
  parseQuizPayload,
} from "@/src/domain/workspace/workspace-service";
import { runAnalysisAction } from "@/app/dashboard/courses/[courseId]/actions";

export const dynamic = "force-dynamic";

type PracticeQuizPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function PracticeQuizPage({ params }: PracticeQuizPageProps) {
  const user = await requireAuthenticatedUser();
  const { courseId } = await params;

  const [workspace, asset] = await Promise.all([
    getWorkspaceOverview({ userId: user.id, courseId }),
    getWorkspaceStudyAsset({
      userId: user.id,
      courseId,
      type: "PRACTICE_QUIZ",
    }),
  ]);

  if (!workspace) {
    notFound();
  }

  const questions = asset ? parseQuizPayload(asset.payload) : [];

  return (
    <WorkspaceShell courseId={courseId} courseName={workspace.course.name}>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Practice Quiz</h2>
            <p className="mt-2 text-sm text-slate-300">
              Pattern-based questions from uploaded course materials. This helps
              practice likely concepts, not guaranteed exam questions.
            </p>
          </div>
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-slate-500"
          >
            Back to Workspace
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <p className="text-sm text-slate-300">
              No quiz generated yet. Run analysis to produce practice questions.
            </p>
            <form action={runAnalysisAction} className="mt-3">
              <input type="hidden" name="courseId" value={courseId} />
              <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                Generate Quiz
              </button>
            </form>
          </div>
        ) : (
          <ol className="mt-6 space-y-4">
            {questions.map((question, index) => (
              <li
                key={`${question.topic}-${index}`}
                className="rounded-xl border border-slate-700 bg-slate-950/60 p-5"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  {question.type === "multiple_choice"
                    ? "Multiple Choice"
                    : "Short Answer"}{" "}
                  • {question.topic}
                </p>
                <p className="mt-2 font-medium">{index + 1}. {question.prompt}</p>
                {question.choices ? (
                  <ul className="mt-3 space-y-1 text-sm text-slate-300">
                    {question.choices.map((choice, choiceIndex) => (
                      <li key={choice}>
                        {String.fromCharCode(65 + choiceIndex)}. {choice}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/80 p-3">
                  <p className="text-sm font-semibold text-cyan-200">
                    Answer: {question.answer}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {question.explanation}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </WorkspaceShell>
  );
}

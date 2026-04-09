import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/src/components/product/workspace-shell";
import { requireAuthenticatedUser } from "@/src/auth/guards";
import { getWorkspaceOverview } from "@/src/domain/workspace/workspace-service";
import {
  deleteMaterialAction,
  runAnalysisAction,
  uploadMaterialAction,
} from "@/app/dashboard/courses/[courseId]/actions";

export const dynamic = "force-dynamic";

type WorkspacePageProps = {
  params: Promise<{ courseId: string }>;
};

function statusPill(status: string) {
  if (status === "READY") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "ERROR") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-200";
  }

  return "border-amber-500/40 bg-amber-500/10 text-amber-200";
}

export default async function CourseWorkspacePage({ params }: WorkspacePageProps) {
  const user = await requireAuthenticatedUser();
  const { courseId } = await params;

  const workspace = await getWorkspaceOverview({
    userId: user.id,
    courseId,
  });

  if (!workspace) {
    notFound();
  }

  const readyForAssets = workspace.status.readyMaterials > 0;

  return (
    <WorkspaceShell courseId={courseId} courseName={workspace.course.name}>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold">Upload Materials</h2>
          <p className="mt-2 text-sm text-slate-300">
            Add lecture slides, notes, study guides, homework, and past exams.
            Files are stored per course workspace.
          </p>
          <form action={uploadMaterialAction} className="mt-5 space-y-3">
            <input type="hidden" name="courseId" value={courseId} />
            <label className="block text-sm">
              <span className="mb-1 block text-slate-300">Choose file</span>
              <input
                type="file"
                name="material"
                required
                accept=".pdf,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp,.doc,.docx"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </label>
            <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
              Upload Materials
            </button>
          </form>

          <form action={runAnalysisAction} className="mt-4">
            <input type="hidden" name="courseId" value={courseId} />
            <button
              className="w-full rounded-lg border border-cyan-400/70 px-4 py-2 font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!readyForAssets}
            >
              Generate Study Assets
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-400">
            Analysis is pattern-based and does not claim exact exam prediction.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Uploaded Files</h2>
            <p className="text-xs text-slate-400">
              Ready: {workspace.status.readyMaterials} • Processing:{" "}
              {workspace.status.processingMaterials} • Error:{" "}
              {workspace.status.erroredMaterials}
            </p>
          </div>
          {workspace.materials.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
              No files yet. Upload your first course material to start
              extraction and analysis.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {workspace.materials.map((material) => (
                <li
                  key={material.id}
                  className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{material.fileName}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {(material.sizeBytes / 1024).toFixed(1)} KB •{" "}
                        {material.mimeType || "unknown type"}
                      </p>
                      {material.extractionNote ? (
                        <p className="mt-1 text-xs text-slate-400">
                          {material.extractionNote}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${statusPill(material.status)}`}
                      >
                        {material.status}
                      </span>
                      <form action={deleteMaterialAction}>
                        <input type="hidden" name="courseId" value={courseId} />
                        <input type="hidden" name="materialId" value={material.id} />
                        <button className="rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-rose-400 hover:text-rose-200">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Likely Exam Focus Areas</h2>
          <p className="mt-2 text-sm text-slate-300">
            Ranked from repeated concepts, emphasis language, and overlap across
            your uploaded materials.
          </p>
          {workspace.rankedTopics.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
              Run analysis after uploading files to generate ranked focus areas.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {workspace.rankedTopics.slice(0, 8).map((topic) => (
                <li
                  key={topic.title}
                  className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{topic.title}</p>
                    <p className="text-sm text-cyan-200">
                      Confidence {(topic.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{topic.summary}</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-400">
                    {topic.reasons.slice(0, 3).map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-lg font-semibold">Study Outputs</h2>
          <p className="mt-2 text-sm text-slate-300">
            Open generated assets for this course workspace.
          </p>
          <div className="mt-4 space-y-2">
            <Link
              href={`/dashboard/courses/${courseId}/study-guide`}
              className="block rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-cyan-300/70"
            >
              Generate Study Guide
            </Link>
            <Link
              href={`/dashboard/courses/${courseId}/practice-quiz`}
              className="block rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-cyan-300/70"
            >
              Generate Quiz
            </Link>
            <Link
              href={`/dashboard/courses/${courseId}/flashcards`}
              className="block rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-cyan-300/70"
            >
              Review Flashcards
            </Link>
            <Link
              href={`/dashboard/courses/${courseId}/quick-review`}
              className="block rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-cyan-300/70"
            >
              Quick Review Summary
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Last analysis:{" "}
            {workspace.latestAnalysisAt
              ? workspace.latestAnalysisAt.toLocaleString()
              : "Not generated yet"}
          </p>
        </section>
      </div>
    </WorkspaceShell>
  );
}

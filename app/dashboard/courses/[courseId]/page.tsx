import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/src/components/product/workspace-shell";
import {
  GenerateAssetsForm,
  UploadMaterialForm,
} from "@/src/components/product/workspace-forms";
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
  searchParams?: Promise<{
    uploadError?: string;
    uploadSuccess?: string;
    analysisError?: string;
    analysisSuccess?: string;
  }>;
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

function safeText(value: string | null | undefined, fallback: string): string {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function safeDateLabel(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }

  return "Unknown upload time";
}

function decodeMessage(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(value).trim();
    return decoded || null;
  } catch {
    return value.trim() || null;
  }
}

export default async function CourseWorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const user = await requireAuthenticatedUser();
  const { courseId } = await params;
  const query = await searchParams;

  const workspace = await getWorkspaceOverview({
    userId: user.id,
    courseId,
  });
  console.info("CourseWorkspacePage:load", {
    courseId,
    userId: user.id,
    hasWorkspace: Boolean(workspace),
    materialCount: workspace?.materials?.length ?? 0,
  });

  if (!workspace) {
    notFound();
  }

  const readyForAssets = workspace.status.readyMaterials > 0;
  const uploadError = decodeMessage(query?.uploadError);
  const uploadSuccess = decodeMessage(query?.uploadSuccess);
  const analysisError = decodeMessage(query?.analysisError);
  const analysisSuccess = decodeMessage(query?.analysisSuccess);

  return (
    <WorkspaceShell courseId={courseId} courseName={workspace.course.name}>
      {uploadError ? (
        <div className="mb-4 rounded-lg border border-rose-600/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {uploadError}
        </div>
      ) : null}
      {uploadSuccess ? (
        <div className="mb-4 rounded-lg border border-emerald-600/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
          {uploadSuccess}
        </div>
      ) : null}
      {analysisError ? (
        <div className="mb-4 rounded-lg border border-rose-600/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {analysisError}
        </div>
      ) : null}
      {analysisSuccess ? (
        <div className="mb-4 rounded-lg border border-emerald-600/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
          {analysisSuccess}
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold">Upload Materials</h2>
          <p className="mt-2 text-sm text-slate-300">
            Add lecture slides, notes, study guides, homework, and past exams.
            Files are stored per course workspace.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {workspace.plan.isPremium
              ? "Premium: unlimited uploads, larger file size, and priority processing."
              : `Free plan: up to ${workspace.plan.maxUploadsPerCourse ?? "unlimited"} uploads per course.`}
          </p>
          {!workspace.plan.isPremium ? (
            <Link
              href="/premium"
              className="mt-3 inline-flex rounded-md border border-cyan-300/60 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200 hover:bg-cyan-300/20"
            >
              Upgrade to Premium
            </Link>
          ) : (
            <span className="mt-3 inline-flex rounded-md border border-emerald-400/50 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">
              Premium Active
            </span>
          )}
          <UploadMaterialForm
            courseId={courseId}
            maxUploadSizeBytes={workspace.plan.maxUploadSizeBytes}
            action={uploadMaterialAction}
          />

          <GenerateAssetsForm
            courseId={courseId}
            action={runAnalysisAction}
            disabled={!readyForAssets}
          />
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
              {workspace.materials.map((material) => {
                try {
                  const fileName = safeText(material.fileName, "Unnamed file");
                  const mimeType = safeText(material.mimeType, "unknown type");
                  const status = safeText(material.status, "ERROR");
                  const sizeBytes = Number.isFinite(material.sizeBytes)
                    ? material.sizeBytes
                    : 0;
                  const uploadTime = safeDateLabel(material.createdAt);

                  return (
                    <li
                      key={material.id}
                      className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{fileName}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {(sizeBytes / 1024).toFixed(1)} KB • {mimeType}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Uploaded {uploadTime}
                          </p>
                          {material.extractionNote ? (
                            <p className="mt-1 text-xs text-slate-400">
                              {material.extractionNote}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${statusPill(status)}`}
                          >
                            {status}
                          </span>
                          <form action={deleteMaterialAction}>
                            <input type="hidden" name="courseId" value={courseId} />
                            <input
                              type="hidden"
                              name="materialId"
                              value={material.id}
                            />
                            <button className="rounded-md border border-slate-600 px-2.5 py-1 text-xs text-slate-200 hover:border-rose-400 hover:text-rose-200">
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </li>
                  );
                } catch (error) {
                  console.error("CourseWorkspacePage:material_render_failed", {
                    courseId,
                    userId: user.id,
                    materialId: material.id,
                    error,
                  });

                  return (
                    <li
                      key={material.id}
                      className="rounded-lg border border-rose-700/40 bg-rose-950/30 p-4 text-sm text-rose-200"
                    >
                      A file record could not be rendered. Please retry upload or
                      delete this file.
                    </li>
                  );
                }
              })}
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
              {workspace.rankedTopics
                .slice(0, workspace.plan.maxLikelyFocusTopics)
                .map((topic) => (
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
          {!workspace.plan.isPremium &&
          workspace.rankedTopics.length > workspace.plan.maxLikelyFocusTopics ? (
            <p className="mt-3 text-xs text-slate-400">
              Showing top {workspace.plan.maxLikelyFocusTopics} on Free plan.
              <Link href="/premium" className="ml-1 text-cyan-300 hover:text-cyan-200">
                Upgrade to unlock detailed ranking.
              </Link>
            </p>
          ) : null}
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserPlanLimits } from "@/src/domain/billing/subscription-service";
import {
  deleteMaterialFromWorkspace,
  runWorkspaceAnalysis,
  uploadMaterialToWorkspace,
} from "@/src/domain/workspace/workspace-service";
import { createSupabaseServerClient } from "@/src/supabase/server";

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".doc",
  ".docx",
];

function buildCoursePagePath(courseId: string, message?: { type: "error" | "success"; text: string }) {
  if (!message) {
    return `/dashboard/courses/${courseId}`;
  }

  const key = message.type === "error" ? "uploadError" : "uploadSuccess";
  return `/dashboard/courses/${courseId}?${key}=${encodeURIComponent(message.text)}`;
}

function isAllowedFileName(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

export async function uploadMaterialAction(formData: FormData) {
  const user = await requireUser();
  const plan = await getUserPlanLimits(user.id);
  const courseId = String(formData.get("courseId") ?? "").trim();
  const fileValue = formData.get("material");
  console.info("uploadMaterialAction:start", {
    courseId,
    userId: user.id,
    hasFile: fileValue instanceof File,
    fileName: fileValue instanceof File ? fileValue.name : null,
    fileSize: fileValue instanceof File ? fileValue.size : null,
    fileType: fileValue instanceof File ? fileValue.type : null,
  });

  if (!courseId || !(fileValue instanceof File) || fileValue.size === 0) {
    redirect(
      buildCoursePagePath(courseId, {
        type: "error",
        text: "Please choose a file before uploading.",
      }),
    );
  }

  if (!isAllowedFileName(fileValue.name)) {
    redirect(
      buildCoursePagePath(courseId, {
        type: "error",
        text: "Unsupported file type. Please upload PDF, document, text, or image files.",
      }),
    );
  }

  if (fileValue.size > plan.maxUploadSizeBytes) {
    const maxMb = Math.floor(plan.maxUploadSizeBytes / (1024 * 1024));
    redirect(
      buildCoursePagePath(courseId, {
        type: "error",
        text: `This file is too large to upload. Please upload a file under ${maxMb} MB.`,
      }),
    );
  }

  try {
    await uploadMaterialToWorkspace({
      userId: user.id,
      courseId,
      file: fileValue,
    });

    revalidatePath(`/dashboard/courses/${courseId}`);
    console.info("uploadMaterialAction:success", {
      courseId,
      userId: user.id,
      fileName: fileValue.name,
    });
  } catch (error) {
    console.error("Upload failed", {
      courseId,
      userId: user.id,
      fileName: fileValue.name,
      fileSize: fileValue.size,
      fileType: fileValue.type,
      error,
    });
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Upload failed. Please try again.";

    redirect(
      buildCoursePagePath(courseId, {
        type: "error",
        text: message,
      }),
    );
  }

  redirect(
    buildCoursePagePath(courseId, {
      type: "success",
      text: `Uploaded ${fileValue.name} successfully.`,
    }),
  );
}

export async function deleteMaterialAction(formData: FormData) {
  const user = await requireUser();
  const courseId = String(formData.get("courseId") ?? "").trim();
  const materialId = String(formData.get("materialId") ?? "").trim();

  if (!courseId || !materialId) {
    return;
  }

  await deleteMaterialFromWorkspace({
    userId: user.id,
    courseId,
    materialId,
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
}

export async function runAnalysisAction(formData: FormData) {
  const user = await requireUser();
  const courseId = String(formData.get("courseId") ?? "").trim();

  if (!courseId) {
    return;
  }

  try {
    console.info("runAnalysisAction:start", {
      courseId,
      userId: user.id,
    });
    await runWorkspaceAnalysis({
      userId: user.id,
      courseId,
    });

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}/study-guide`);
    revalidatePath(`/dashboard/courses/${courseId}/practice-quiz`);
    revalidatePath(`/dashboard/courses/${courseId}/flashcards`);
    revalidatePath(`/dashboard/courses/${courseId}/quick-review`);
  } catch (error) {
    console.error("runAnalysisAction:failed", {
      courseId,
      userId: user.id,
      error,
    });
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to generate study assets. Please try again.";
    redirect(
      `/dashboard/courses/${courseId}?analysisError=${encodeURIComponent(message)}`,
    );
  }

  redirect(
    `/dashboard/courses/${courseId}?analysisSuccess=${encodeURIComponent(
      "Study assets generated successfully.",
    )}`,
  );
}

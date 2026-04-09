"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteMaterialFromWorkspace,
  runWorkspaceAnalysis,
  uploadMaterialToWorkspace,
} from "@/src/domain/workspace/workspace-service";
import { createSupabaseServerClient } from "@/src/supabase/server";

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
  const courseId = String(formData.get("courseId") ?? "").trim();
  const fileValue = formData.get("material");

  if (!courseId || !(fileValue instanceof File) || fileValue.size === 0) {
    return;
  }

  await uploadMaterialToWorkspace({
    userId: user.id,
    courseId,
    file: fileValue,
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
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

  await runWorkspaceAnalysis({
    userId: user.id,
    courseId,
  });

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}/study-guide`);
  revalidatePath(`/dashboard/courses/${courseId}/practice-quiz`);
  revalidatePath(`/dashboard/courses/${courseId}/flashcards`);
  revalidatePath(`/dashboard/courses/${courseId}/quick-review`);
}

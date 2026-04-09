"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteCourse } from "@/src/domain/course/course-service";
import { createCourse } from "@/src/domain/course/course-service";
import { upsertUserProfile } from "@/src/persistence/user-profile-repository";
import { createSupabaseServerClient } from "@/src/supabase/server";

export async function createCourseAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  await upsertUserProfile({
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? null,
  });

  await createCourse({
    userId: user.id,
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? "") || null,
    term: String(formData.get("term") ?? "") || null,
  });

  revalidatePath("/dashboard");
}

export async function deleteCourseAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const courseId = String(formData.get("courseId") ?? "").trim();
  if (!courseId) {
    return;
  }

  await deleteCourse({
    userId: user.id,
    courseId,
  });

  revalidatePath("/dashboard");
}

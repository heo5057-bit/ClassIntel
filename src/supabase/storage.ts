import { env } from "@/src/config/env";
import { createSupabaseAdminClient } from "@/src/supabase/admin";

export async function uploadCourseMaterialToStorage(input: {
  userId: string;
  courseId: string;
  materialId: string;
  file: File;
}): Promise<{ path: string | null; errorMessage: string | null }> {
  console.info("uploadCourseMaterialToStorage:start", {
    userId: input.userId,
    courseId: input.courseId,
    materialId: input.materialId,
    fileName: input.file.name,
    fileSize: input.file.size,
    fileType: input.file.type,
    bucket: env.SUPABASE_STORAGE_BUCKET,
  });

  const admin = createSupabaseAdminClient();

  if (!admin) {
    console.error("uploadCourseMaterialToStorage:no_admin_client", {
      userId: input.userId,
      courseId: input.courseId,
      materialId: input.materialId,
    });
    return {
      path: null,
      errorMessage:
        "Storage upload skipped because SUPABASE_SERVICE_ROLE_KEY is not configured.",
    };
  }

  const safeFileName = input.file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${input.userId}/${input.courseId}/${input.materialId}-${safeFileName}`;
  const bytes = new Uint8Array(await input.file.arrayBuffer());

  const { error } = await admin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(path, bytes, {
      contentType: input.file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    console.error("uploadCourseMaterialToStorage:upload_failed", {
      userId: input.userId,
      courseId: input.courseId,
      materialId: input.materialId,
      path,
      error: error.message,
    });
    return {
      path: null,
      errorMessage: `Storage upload failed: ${error.message}`,
    };
  }

  return {
    path,
    errorMessage: null,
  };
}

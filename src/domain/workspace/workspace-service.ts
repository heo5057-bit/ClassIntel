import type {
  CourseMaterial,
  Prisma,
  StudyAsset,
  StudyAssetType,
} from "@prisma/client";
import { rankProfessorTopics } from "@/src/analysis/scoring/professor-mode";
import { runProfessorModeProvider } from "@/src/ai/provider/mock-provider";
import { getCourseForUser } from "@/src/domain/course/course-service";
import type {
  Flashcard,
  QuickReviewTopic,
  QuizQuestion,
  StudyGuideSection,
  WorkspaceStatus,
} from "@/src/domain/workspace/types";
import { extractMaterialText } from "@/src/ingestion/parsing/text-extractor";
import {
  createAnalysisRun,
  createMaterial,
  deleteMaterialForCourse,
  getLatestAnalysisRun,
  getStudyAssetByType,
  listMaterialsForCourse,
  listRankedTopics,
  listStudyAssets,
  replaceCourseTopics,
  updateMaterialProcessingState,
  upsertStudyAsset,
} from "@/src/persistence/material-repository";
import { generateStudyAssetsFromTopics } from "@/src/quiz/recommendation/study-assets";
import { uploadCourseMaterialToStorage } from "@/src/supabase/storage";

export type WorkspaceOverview = {
  course: {
    id: string;
    name: string;
    code: string | null;
    term: string | null;
  };
  materials: CourseMaterial[];
  status: WorkspaceStatus;
  rankedTopics: Array<{
    title: string;
    summary: string;
    keyPhrases: string[];
    occurrenceCount: number;
    evidenceCount: number;
    emphasisScore: number;
    confidence: number;
    reasons: string[];
  }>;
  assets: StudyAsset[];
  latestAnalysisAt: Date | null;
};

function getWorkspaceStatus(materials: CourseMaterial[]): WorkspaceStatus {
  const readyMaterials = materials.filter((m) => m.status === "READY").length;
  const processingMaterials = materials.filter(
    (m) => m.status === "UPLOADED" || m.status === "PROCESSING",
  ).length;
  const erroredMaterials = materials.filter((m) => m.status === "ERROR").length;

  return {
    hasMaterials: materials.length > 0,
    readyMaterials,
    processingMaterials,
    erroredMaterials,
  };
}

function asJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function parseAndStoreMaterial(input: {
  materialId: string;
  userId: string;
  file: File;
}): Promise<void> {
  await updateMaterialProcessingState({
    materialId: input.materialId,
    userId: input.userId,
    status: "PROCESSING",
  });

  try {
    const extracted = await extractMaterialText({ file: input.file });
    await updateMaterialProcessingState({
      materialId: input.materialId,
      userId: input.userId,
      status: "READY",
      extractedText: extracted.text || null,
      extractionNote: extracted.note,
      errorMessage: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown extraction failure.";
    console.error("parseAndStoreMaterial:extract_failed", {
      materialId: input.materialId,
      userId: input.userId,
      fileName: input.file.name,
      fileType: input.file.type,
      fileSize: input.file.size,
      error,
    });
    await updateMaterialProcessingState({
      materialId: input.materialId,
      userId: input.userId,
      status: "ERROR",
      errorMessage: message,
    });
  }
}

export async function getWorkspaceOverview(input: {
  userId: string;
  courseId: string;
}): Promise<WorkspaceOverview | null> {
  const course = await getCourseForUser({
    userId: input.userId,
    courseId: input.courseId,
  });

  if (!course) {
    return null;
  }

  let materials: CourseMaterial[] = [];
  let topics: Awaited<ReturnType<typeof listRankedTopics>> = [];
  let assets: StudyAsset[] = [];
  let latestAnalysis: Awaited<ReturnType<typeof getLatestAnalysisRun>> = null;

  try {
    [materials, topics, assets, latestAnalysis] = await Promise.all([
      listMaterialsForCourse({ userId: input.userId, courseId: input.courseId }),
      listRankedTopics({ courseId: input.courseId }),
      listStudyAssets({ userId: input.userId, courseId: input.courseId }),
      getLatestAnalysisRun({ userId: input.userId, courseId: input.courseId }),
    ]);
  } catch (error) {
    console.error("getWorkspaceOverview:query_failed", {
      courseId: input.courseId,
      userId: input.userId,
      error,
    });
  }

  return {
    course: {
      id: course.id,
      name: course.name,
      code: course.code,
      term: course.term,
    },
    materials,
    status: getWorkspaceStatus(materials),
    rankedTopics: topics.map((topic) => ({
      title: topic.title,
      summary: topic.summary,
      keyPhrases: topic.keyPhrases,
      occurrenceCount: topic.occurrenceCount,
      evidenceCount: topic.evidenceCount,
      emphasisScore: topic.emphasisScore,
      confidence: topic.confidence,
      reasons: topic.reasons,
    })),
    assets,
    latestAnalysisAt: latestAnalysis?.createdAt ?? null,
  };
}

export async function uploadMaterialToWorkspace(input: {
  userId: string;
  courseId: string;
  file: File;
}): Promise<void> {
  console.info("uploadMaterialToWorkspace:start", {
    userId: input.userId,
    courseId: input.courseId,
    fileName: input.file.name,
    fileSize: input.file.size,
    fileType: input.file.type,
  });

  const course = await getCourseForUser({
    userId: input.userId,
    courseId: input.courseId,
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  const material = await createMaterial({
    courseId: input.courseId,
    userId: input.userId,
    fileName: input.file.name,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
  });
  console.info("uploadMaterialToWorkspace:material_created", {
    materialId: material.id,
    courseId: input.courseId,
    userId: input.userId,
  });

  const storageUpload = await uploadCourseMaterialToStorage({
    userId: input.userId,
    courseId: input.courseId,
    materialId: material.id,
    file: input.file,
  });
  if (storageUpload.errorMessage) {
    console.error("uploadMaterialToWorkspace:storage_failed", {
      materialId: material.id,
      courseId: input.courseId,
      userId: input.userId,
      error: storageUpload.errorMessage,
    });
  } else {
    console.info("uploadMaterialToWorkspace:storage_success", {
      materialId: material.id,
      path: storageUpload.path,
    });
  }

  await updateMaterialProcessingState({
    materialId: material.id,
    userId: input.userId,
    status: "UPLOADED",
    storagePath: storageUpload.path,
    extractionNote: storageUpload.errorMessage,
  });

  await parseAndStoreMaterial({
    materialId: material.id,
    userId: input.userId,
    file: input.file,
  });
  console.info("uploadMaterialToWorkspace:parse_complete", {
    materialId: material.id,
    courseId: input.courseId,
    userId: input.userId,
  });
}

export async function deleteMaterialFromWorkspace(input: {
  userId: string;
  courseId: string;
  materialId: string;
}): Promise<void> {
  await deleteMaterialForCourse({
    userId: input.userId,
    courseId: input.courseId,
    materialId: input.materialId,
  });
}

export async function runWorkspaceAnalysis(input: {
  userId: string;
  courseId: string;
}): Promise<void> {
  const materials = await listMaterialsForCourse({
    userId: input.userId,
    courseId: input.courseId,
  });

  const rankedTopics = rankProfessorTopics({ materials });
  const providerOutput = await runProfessorModeProvider({ rankedTopics });

  await replaceCourseTopics({
    courseId: input.courseId,
    topics: providerOutput.topics,
  });

  await createAnalysisRun({
    courseId: input.courseId,
    userId: input.userId,
    modelName: providerOutput.modelName,
    sourceMaterialIds: materials.map((material) => material.id),
    totalTopics: providerOutput.topics.length,
    rankedTopics: asJson(providerOutput.topics),
    processingNotes: providerOutput.note,
  });

  const assets = generateStudyAssetsFromTopics({
    rankedTopics: providerOutput.topics,
  });

  await Promise.all([
    upsertStudyAsset({
      courseId: input.courseId,
      userId: input.userId,
      type: "STUDY_GUIDE",
      title: "Generated Study Guide",
      payload: asJson(assets.studyGuide),
    }),
    upsertStudyAsset({
      courseId: input.courseId,
      userId: input.userId,
      type: "PRACTICE_QUIZ",
      title: "Professor-Style Practice Quiz",
      payload: asJson(assets.quiz),
    }),
    upsertStudyAsset({
      courseId: input.courseId,
      userId: input.userId,
      type: "FLASHCARDS",
      title: "Topic Flashcards",
      payload: asJson(assets.flashcards),
    }),
    upsertStudyAsset({
      courseId: input.courseId,
      userId: input.userId,
      type: "CRAM_SHEET",
      title: "Quick Review Priorities",
      payload: asJson(assets.quickReview),
    }),
  ]);
}

export async function getWorkspaceStudyAsset(input: {
  userId: string;
  courseId: string;
  type: StudyAssetType;
}): Promise<StudyAsset | null> {
  return getStudyAssetByType({
    userId: input.userId,
    courseId: input.courseId,
    type: input.type,
  });
}

export function parseStudyGuidePayload(payload: Prisma.JsonValue): StudyGuideSection[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload as unknown as StudyGuideSection[];
}

export function parseQuizPayload(payload: Prisma.JsonValue): QuizQuestion[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload as unknown as QuizQuestion[];
}

export function parseFlashcardsPayload(payload: Prisma.JsonValue): Flashcard[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload as unknown as Flashcard[];
}

export function parseQuickReviewPayload(payload: Prisma.JsonValue): QuickReviewTopic[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload as unknown as QuickReviewTopic[];
}

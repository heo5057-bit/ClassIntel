import type {
  AnalysisRun,
  CourseMaterial,
  ExtractedTopic,
  MaterialStatus,
  Prisma,
  StudyAsset,
  StudyAssetType,
} from "@prisma/client";
import { prisma } from "@/src/persistence/prisma";

export async function createMaterial(input: {
  courseId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath?: string | null;
}): Promise<CourseMaterial> {
  return prisma.courseMaterial.create({
    data: {
      courseId: input.courseId,
      userId: input.userId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath: input.storagePath ?? null,
      status: "UPLOADED",
    },
  });
}

export async function updateMaterialProcessingState(input: {
  materialId: string;
  userId: string;
  status: MaterialStatus;
  storagePath?: string | null;
  extractedText?: string | null;
  extractionNote?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  await prisma.courseMaterial.updateMany({
    where: {
      id: input.materialId,
      userId: input.userId,
    },
    data: {
      status: input.status,
      storagePath: input.storagePath,
      extractedText: input.extractedText,
      extractionNote: input.extractionNote,
      errorMessage: input.errorMessage,
      processedAt: input.status === "READY" || input.status === "ERROR" ? new Date() : null,
    },
  });
}

export async function listMaterialsForCourse(input: {
  courseId: string;
  userId: string;
}): Promise<CourseMaterial[]> {
  return prisma.courseMaterial.findMany({
    where: {
      courseId: input.courseId,
      userId: input.userId,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteMaterialForCourse(input: {
  materialId: string;
  courseId: string;
  userId: string;
}): Promise<void> {
  await prisma.courseMaterial.deleteMany({
    where: {
      id: input.materialId,
      courseId: input.courseId,
      userId: input.userId,
    },
  });
}

export async function replaceCourseTopics(input: {
  courseId: string;
  topics: Array<{
    title: string;
    summary: string;
    keyPhrases: string[];
    occurrenceCount: number;
    evidenceCount: number;
    emphasisScore: number;
    confidence: number;
    reasons: string[];
  }>;
}): Promise<void> {
  await prisma.$transaction([
    prisma.extractedTopic.deleteMany({ where: { courseId: input.courseId } }),
    prisma.extractedTopic.createMany({
      data: input.topics.map((topic) => ({
        courseId: input.courseId,
        title: topic.title,
        summary: topic.summary,
        keyPhrases: topic.keyPhrases,
        occurrenceCount: topic.occurrenceCount,
        evidenceCount: topic.evidenceCount,
        emphasisScore: topic.emphasisScore,
        confidence: topic.confidence,
        reasons: topic.reasons,
      })),
    }),
  ]);
}

export async function createAnalysisRun(input: {
  courseId: string;
  userId: string;
  modelName: string;
  sourceMaterialIds: string[];
  totalTopics: number;
  rankedTopics: Prisma.InputJsonValue;
  processingNotes?: string | null;
}): Promise<AnalysisRun> {
  return prisma.analysisRun.create({
    data: {
      courseId: input.courseId,
      userId: input.userId,
      modelName: input.modelName,
      sourceMaterialIds: input.sourceMaterialIds,
      totalTopics: input.totalTopics,
      rankedTopics: input.rankedTopics,
      processingNotes: input.processingNotes ?? null,
    },
  });
}

export async function getLatestAnalysisRun(input: {
  courseId: string;
  userId: string;
}): Promise<AnalysisRun | null> {
  return prisma.analysisRun.findFirst({
    where: {
      courseId: input.courseId,
      userId: input.userId,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertStudyAsset(input: {
  courseId: string;
  userId: string;
  type: StudyAssetType;
  title: string;
  payload: Prisma.InputJsonValue;
}): Promise<StudyAsset> {
  return prisma.studyAsset.upsert({
    where: {
      courseId_type: {
        courseId: input.courseId,
        type: input.type,
      },
    },
    create: {
      courseId: input.courseId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      payload: input.payload,
    },
    update: {
      title: input.title,
      payload: input.payload,
      userId: input.userId,
    },
  });
}

export async function listStudyAssets(input: {
  courseId: string;
  userId: string;
}): Promise<StudyAsset[]> {
  return prisma.studyAsset.findMany({
    where: {
      courseId: input.courseId,
      userId: input.userId,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getStudyAssetByType(input: {
  courseId: string;
  userId: string;
  type: StudyAssetType;
}): Promise<StudyAsset | null> {
  return prisma.studyAsset.findFirst({
    where: {
      courseId: input.courseId,
      userId: input.userId,
      type: input.type,
    },
  });
}

export async function listRankedTopics(input: {
  courseId: string;
}): Promise<ExtractedTopic[]> {
  return prisma.extractedTopic.findMany({
    where: { courseId: input.courseId },
    orderBy: [{ emphasisScore: "desc" }, { confidence: "desc" }],
  });
}

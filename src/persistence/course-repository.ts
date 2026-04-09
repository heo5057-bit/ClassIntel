import type { Course } from "@prisma/client";
import { prisma } from "@/src/persistence/prisma";

export async function createCourse(input: {
  userId: string;
  name: string;
  code?: string | null;
  term?: string | null;
}): Promise<Course> {
  return prisma.course.create({
    data: {
      userId: input.userId,
      name: input.name,
      code: input.code ?? null,
      term: input.term ?? null,
    },
  });
}

export async function listCoursesForUser(userId: string): Promise<Course[]> {
  return prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseByIdForUser(input: {
  courseId: string;
  userId: string;
}): Promise<Course | null> {
  return prisma.course.findFirst({
    where: {
      id: input.courseId,
      userId: input.userId,
    },
  });
}

export async function deleteCourseByIdForUser(input: {
  courseId: string;
  userId: string;
}): Promise<void> {
  await prisma.course.deleteMany({
    where: {
      id: input.courseId,
      userId: input.userId,
    },
  });
}

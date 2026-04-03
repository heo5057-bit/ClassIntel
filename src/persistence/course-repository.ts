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


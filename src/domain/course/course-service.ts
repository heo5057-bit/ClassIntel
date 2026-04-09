import type { Course } from "@prisma/client";
import {
  createCourse as createCourseRecord,
  deleteCourseByIdForUser,
  getCourseByIdForUser,
  listCoursesForUser,
} from "@/src/persistence/course-repository";

function normalizeOptionalField(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function createCourse(input: {
  userId: string;
  name: string;
  code: string | null;
  term: string | null;
}): Promise<Course> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Course name is required.");
  }

  return createCourseRecord({
    userId: input.userId,
    name,
    code: normalizeOptionalField(input.code),
    term: normalizeOptionalField(input.term),
  });
}

export async function getUserCourses(userId: string): Promise<Course[]> {
  return listCoursesForUser(userId);
}

export async function getCourseForUser(input: {
  userId: string;
  courseId: string;
}): Promise<Course | null> {
  return getCourseByIdForUser({
    userId: input.userId,
    courseId: input.courseId,
  });
}

export async function deleteCourse(input: {
  userId: string;
  courseId: string;
}): Promise<void> {
  await deleteCourseByIdForUser({
    userId: input.userId,
    courseId: input.courseId,
  });
}

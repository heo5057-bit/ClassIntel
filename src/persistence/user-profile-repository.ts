import type { UserProfile } from "@prisma/client";
import { prisma } from "@/src/persistence/prisma";

export async function upsertUserProfile(input: {
  id: string;
  email: string;
  fullName?: string | null;
}): Promise<UserProfile> {
  return prisma.userProfile.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      fullName: input.fullName ?? null,
    },
    update: {
      email: input.email,
      fullName: input.fullName ?? null,
    },
  });
}


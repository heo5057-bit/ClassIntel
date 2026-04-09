import type { SubscriptionStatus } from "@prisma/client";
import {
  findSubscriptionByStripeCustomerId,
  findSubscriptionByStripeSubscriptionId,
  getSubscriptionForUser,
  upsertSubscriptionForUser,
} from "@/src/persistence/subscription-repository";

export type UserPlan = "free" | "premium";

export type PlanLimits = {
  plan: UserPlan;
  isPremium: boolean;
  maxUploadSizeBytes: number;
  maxUploadsPerCourse: number | null;
  maxLikelyFocusTopics: number;
  maxStudyGuideTopics: number;
  maxQuizQuestions: number;
  maxFlashcards: number;
};

const PREMIUM_STATUSES = new Set<SubscriptionStatus>(["ACTIVE", "TRIALING"]);

export function isPremiumStatus(status: SubscriptionStatus): boolean {
  return PREMIUM_STATUSES.has(status);
}

export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  const subscription = await getSubscriptionForUser(userId);
  const isPremium = subscription ? isPremiumStatus(subscription.status) : false;

  if (isPremium) {
    return {
      plan: "premium",
      isPremium: true,
      maxUploadSizeBytes: 25 * 1024 * 1024,
      maxUploadsPerCourse: null,
      maxLikelyFocusTopics: 14,
      maxStudyGuideTopics: 12,
      maxQuizQuestions: 20,
      maxFlashcards: 24,
    };
  }

  return {
    plan: "free",
    isPremium: false,
    maxUploadSizeBytes: 10 * 1024 * 1024,
    maxUploadsPerCourse: 5,
    maxLikelyFocusTopics: 5,
    maxStudyGuideTopics: 6,
    maxQuizQuestions: 8,
    maxFlashcards: 10,
  };
}

export async function syncStripeSubscriptionToUser(input: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  status: SubscriptionStatus;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  return upsertSubscriptionForUser({
    userId: input.userId,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    stripePriceId: input.stripePriceId ?? null,
    status: input.status,
    currentPeriodStart: input.currentPeriodStart ?? null,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
  });
}

export async function findUserIdByStripeReference(input: {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<string | null> {
  if (input.stripeSubscriptionId) {
    const bySub = await findSubscriptionByStripeSubscriptionId(
      input.stripeSubscriptionId,
    );
    if (bySub) {
      return bySub.userId;
    }
  }

  if (input.stripeCustomerId) {
    const byCustomer = await findSubscriptionByStripeCustomerId(
      input.stripeCustomerId,
    );
    if (byCustomer) {
      return byCustomer.userId;
    }
  }

  return null;
}

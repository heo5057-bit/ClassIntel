import type { Subscription, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/src/persistence/prisma";

export async function getSubscriptionForUser(
  userId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { userId },
  });
}

export async function upsertSubscriptionForUser(input: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  status: SubscriptionStatus;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}): Promise<Subscription> {
  return prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      stripePriceId: input.stripePriceId ?? null,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    },
    update: {
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      stripeSubscriptionId: input.stripeSubscriptionId ?? undefined,
      stripePriceId: input.stripePriceId ?? undefined,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
    },
  });
}

export async function findSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { stripeCustomerId },
  });
}

export async function findSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });
}

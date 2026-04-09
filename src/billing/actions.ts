"use server";

import { redirect } from "next/navigation";
import { getUserPlanLimits, syncStripeSubscriptionToUser } from "@/src/domain/billing/subscription-service";
import { upsertUserProfile } from "@/src/persistence/user-profile-repository";
import { getSubscriptionForUser } from "@/src/persistence/subscription-repository";
import { getStripeServerClient } from "@/src/stripe/client";
import { createSupabaseServerClient } from "@/src/supabase/server";
import { env } from "@/src/config/env";

async function requireUser() {
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

  return user;
}

export async function createPremiumCheckoutSession() {
  const user = await requireUser();
  const plan = await getUserPlanLimits(user.id);

  if (plan.isPremium) {
    redirect("/dashboard?billing=already_premium");
  }

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID_PREMIUM_MONTHLY) {
    redirect("/premium?billing=checkout_failed");
  }

  const stripe = getStripeServerClient();
  const existingSubscription = await getSubscriptionForUser(user.id);
  const successUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard?billing=upgrade_success`;
  const cancelUrl = `${env.NEXT_PUBLIC_APP_URL}/premium?billing=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingSubscription?.stripeCustomerId ?? undefined,
    customer_email: existingSubscription?.stripeCustomerId
      ? undefined
      : user.email ?? undefined,
    line_items: [
      {
        price: env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      plan: "premium",
    },
  });

  redirect(session.url ?? "/premium?billing=checkout_failed");
}

export async function createBillingPortalSession() {
  const user = await requireUser();
  if (!env.STRIPE_SECRET_KEY) {
    redirect("/premium?billing=checkout_failed");
  }

  const stripe = getStripeServerClient();
  const subscription = await getSubscriptionForUser(user.id);

  if (!subscription?.stripeCustomerId) {
    redirect("/premium?billing=no_customer");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  redirect(portal.url);
}

export async function activatePremiumMvpBypass() {
  const user = await requireUser();
  await syncStripeSubscriptionToUser({
    userId: user.id,
    status: "ACTIVE",
  });
  redirect("/dashboard?billing=upgrade_success");
}

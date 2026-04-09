import Stripe from "stripe";
import { NextResponse } from "next/server";
import { env } from "@/src/config/env";
import {
  findUserIdByStripeReference,
  syncStripeSubscriptionToUser,
} from "@/src/domain/billing/subscription-service";
import { getStripeServerClient } from "@/src/stripe/client";

function mapStripeStatusToLocal(
  status: Stripe.Subscription.Status,
): "INACTIVE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return "CANCELED";
    default:
      return "INACTIVE";
  }
}

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const stripe = getStripeServerClient();
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid webhook signature", details: String(error) },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        await syncStripeSubscriptionToUser({
          userId,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
          stripePriceId: env.STRIPE_PRICE_ID_PREMIUM_MONTHLY || null,
          status: "ACTIVE",
        });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const userId =
        subscription.metadata?.userId ??
        (await findUserIdByStripeReference({
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : null,
          stripeSubscriptionId: subscription.id,
        }));

      if (userId) {
        const firstItem = subscription.items.data[0];
        const periodStart =
          "current_period_start" in subscription
            ? (subscription as Stripe.Subscription & {
                current_period_start?: number;
              }).current_period_start
            : firstItem?.current_period_start;
        const periodEnd =
          "current_period_end" in subscription
            ? (subscription as Stripe.Subscription & {
                current_period_end?: number;
              }).current_period_end
            : firstItem?.current_period_end;
        await syncStripeSubscriptionToUser({
          userId,
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : null,
          stripeSubscriptionId: subscription.id,
          stripePriceId: firstItem?.price?.id ?? null,
          status: mapStripeStatusToLocal(subscription.status),
          currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
      }
    }
  } catch (error) {
    console.error("stripe_webhook_failed", { eventType: event.type, error });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

import Stripe from "stripe";
import { env } from "@/src/config/env";

let stripeSingleton: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return stripeSingleton;
}

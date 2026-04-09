function getEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = Object.freeze({
  get NEXT_PUBLIC_SUPABASE_URL() {
    return getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return getEnvironmentVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get DATABASE_URL() {
    return getEnvironmentVariable("DATABASE_URL");
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  },
  get SUPABASE_STORAGE_BUCKET() {
    return process.env.SUPABASE_STORAGE_BUCKET ?? "course-materials";
  },
  get STRIPE_SECRET_KEY() {
    return process.env.STRIPE_SECRET_KEY ?? "";
  },
  get STRIPE_WEBHOOK_SECRET() {
    return process.env.STRIPE_WEBHOOK_SECRET ?? "";
  },
  get STRIPE_PRICE_ID_PREMIUM_MONTHLY() {
    return process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY ?? "";
  },
  get NEXT_PUBLIC_APP_URL() {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  },
});

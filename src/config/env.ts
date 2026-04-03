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
  get STRIPE_SECRET_KEY() {
    return process.env.STRIPE_SECRET_KEY ?? "";
  },
  get STRIPE_WEBHOOK_SECRET() {
    return process.env.STRIPE_WEBHOOK_SECRET ?? "";
  },
});

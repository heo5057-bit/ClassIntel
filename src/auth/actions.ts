"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/supabase/server";

function getSafeRedirectPath(value: FormDataEntryValue | null): string {
  const path = String(value ?? "").trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }

  return path;
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  if (!email || !password) {
    redirect("/auth/sign-in?error=missing_credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/auth/sign-in?error=invalid_credentials");
  }

  redirect(redirectTo);
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  if (!email || !password) {
    redirect("/auth/sign-in?error=missing_credentials");
  }

  if (confirmPassword && password !== confirmPassword) {
    redirect("/auth/sign-in?error=password_mismatch");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || undefined,
      },
    },
  });

  if (error) {
    const rawMessage = error.message?.trim();
    const fallbackMessage = "Unable to create account. Please try again.";
    const message = encodeURIComponent(rawMessage || fallbackMessage);
    redirect(`/auth/sign-in?error=signup_failed&signupError=${message}`);
  }

  if (!data.session) {
    redirect("/auth/sign-in?message=check_email");
  }

  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

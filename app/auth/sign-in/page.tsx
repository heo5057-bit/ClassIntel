import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithEmail } from "@/src/auth/actions";
import { CreateAccountForm } from "@/src/components/auth/create-account-form";
import { createSupabaseServerClient } from "@/src/supabase/server";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

const errorMessageByCode: Record<string, string> = {
  missing_credentials: "Please provide an email and password.",
  invalid_credentials: "Invalid email or password.",
  signup_failed: "Sign up failed. Try a different email.",
  password_mismatch: "Passwords do not match.",
};

const noticeMessageByCode: Record<string, string> = {
  check_email: "Check your email to confirm your account, then sign in.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = params?.error ? errorMessageByCode[params.error] : null;
  const noticeMessage = params?.message
    ? noticeMessageByCode[params.message]
    : null;
  const nextPath =
    params?.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Professor Mode
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Start building your course-aware study dashboard.
          </h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Sign in or create an account to add courses, upload materials, and
            generate professor-style study plans.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex w-fit rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col justify-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            {errorMessage ? (
              <p className="mb-4 rounded-md border border-rose-700 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                {errorMessage}
              </p>
            ) : null}
            {noticeMessage ? (
              <p className="mb-4 rounded-md border border-emerald-700 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">
                {noticeMessage}
              </p>
            ) : null}

            <form action={signInWithEmail} className="space-y-4">
              <h2 className="text-lg font-semibold">Sign in</h2>
              <input type="hidden" name="redirectTo" value={nextPath} />
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Password</span>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>
              <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
                Sign in
              </button>
            </form>

            <div className="my-6 h-px bg-slate-800" />

            <CreateAccountForm nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}

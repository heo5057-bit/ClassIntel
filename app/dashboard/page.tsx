import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createBillingPortalSession,
  createPremiumCheckoutSession,
} from "@/src/billing/actions";
import { signOut } from "@/src/auth/actions";
import { getUserPlanLimits } from "@/src/domain/billing/subscription-service";
import { getUserCourses } from "@/src/domain/course/course-service";
import { upsertUserProfile } from "@/src/persistence/user-profile-repository";
import { createSupabaseServerClient } from "@/src/supabase/server";
import { createCourseAction, deleteCourseAction } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{
    billing?: string;
  }>;
};

function billingNotice(code: string | undefined): string | null {
  if (!code) {
    return null;
  }

  if (code === "upgrade_success") {
    return "Premium upgrade successful. Your account now has premium limits.";
  }

  if (code === "already_premium") {
    return "Your subscription is already Premium.";
  }

  return null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
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

  const courses = await getUserCourses(user.id);
  const plan = await getUserPlanLimits(user.id);
  const query = await searchParams;
  const billingMessage = billingNotice(query?.billing);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        {billingMessage ? (
          <p className="mb-4 rounded-lg border border-emerald-600/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
            {billingMessage}
          </p>
        ) : null}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            </h1>
            <p className="mt-2 text-slate-300">
              Build course workspaces, upload materials, and generate
              Professor Mode study outputs.
            </p>
            <p className="mt-2">
              {plan.isPremium ? (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">
                  Premium Plan
                </span>
              ) : (
                <span className="inline-flex rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
                  Free Plan
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
            >
              Product Home
            </Link>
            {plan.isPremium ? (
              <form action={createBillingPortalSession}>
                <button className="rounded-lg border border-cyan-300/50 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-300/10">
                  Manage Subscription
                </button>
              </form>
            ) : (
              <form action={createPremiumCheckoutSession}>
                <button className="rounded-lg border border-cyan-300/70 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-300/20">
                  Upgrade
                </button>
              </form>
            )}
            <form action={signOut}>
              <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-slate-500">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Create Course Workspace</h2>
            <p className="mt-2 text-sm text-slate-400">
              Add each class once. Uploads, analysis, and all study outputs
              are organized per course.
            </p>

            <form action={createCourseAction} className="mt-5 space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Course Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Biology 201"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Course Code</span>
                <input
                  type="text"
                  name="code"
                  placeholder="BIO201"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-300">Term</span>
                <input
                  type="text"
                  name="term"
                  placeholder="Spring 2026"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>
              <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
                Create Course
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Your Course Workspaces</h2>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Live Product Mode
              </p>
            </div>
            {courses.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
                No courses yet. Create your first workspace to upload
                materials and generate study outputs.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {courses.map((course) => (
                  <li
                    key={course.id}
                    className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {course.code ? `Code: ${course.code}` : "No code"}{" "}
                          {course.term ? `• Term: ${course.term}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/courses/${course.id}`}
                          className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                        >
                          Open Workspace
                        </Link>
                        <form action={deleteCourseAction}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <button className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:border-rose-400 hover:text-rose-200">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

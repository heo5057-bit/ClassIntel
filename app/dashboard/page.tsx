import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/src/auth/actions";
import { getUserCourses } from "@/src/domain/course/course-service";
import { upsertUserProfile } from "@/src/persistence/user-profile-repository";
import { createSupabaseServerClient } from "@/src/supabase/server";
import { createCourseAction } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Welcome back{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            </h1>
            <p className="mt-2 text-slate-300">
              Create your first course to start analyzing professor-specific
              materials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-slate-500"
            >
              Home
            </Link>
            <form action={signOut}>
              <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-slate-500">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold">Create Course</h2>
            <p className="mt-2 text-sm text-slate-400">
              Add each class once. Uploads, analysis, and quizzes will attach
              to a course.
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
            <h2 className="text-lg font-semibold">Your Courses</h2>
            {courses.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
                No courses yet. Create one to unlock file upload and analysis.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {courses.map((course) => (
                  <li
                    key={course.id}
                    className="rounded-lg border border-slate-700 bg-slate-950/50 p-4"
                  >
                    <p className="font-medium">{course.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {course.code ? `Code: ${course.code}` : "No code"}{" "}
                      {course.term ? `• Term: ${course.term}` : ""}
                    </p>
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

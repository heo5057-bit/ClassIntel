"use client";

import { useState } from "react";

type FormState = "idle" | "submitted";

export function EmailCaptureForm() {
  const [state, setState] = useState<FormState>("idle");

  return (
    <div
      id="early-access"
      className="rounded-2xl border border-cyan-300/25 bg-slate-900/85 p-6 shadow-2xl shadow-cyan-900/30 sm:p-7"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
        Early Access
      </p>
      <h3 className="mt-2 text-2xl font-semibold">
        Get professor-aware study recommendations before public launch.
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Join the waitlist for priority onboarding, beta pricing, and launch
        updates for ClassIntel.
      </p>

      {state === "submitted" ? (
        <div className="mt-5 rounded-lg border border-emerald-400/35 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          You&apos;re in. We&apos;ll send your early access invite and next
          steps by email.
        </div>
      ) : (
        <form
          className="mt-5 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setState("submitted");
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Name</span>
            <input
              name="name"
              type="text"
              required
              placeholder="Jordan Lee"
              className="w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-slate-300">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="jordan@university.edu"
              className="w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
            />
          </label>

          <button className="sm:col-span-2 rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Reserve My Spot
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { signUpWithEmail } from "@/src/auth/actions";

type CreateAccountFormProps = {
  nextPath: string;
};

export function CreateAccountForm({ nextPath }: CreateAccountFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState("");

  const passwordsMatch = useMemo(() => {
    return password.length === 0 || confirmPassword.length === 0
      ? true
      : password === confirmPassword;
  }, [password, confirmPassword]);

  return (
    <form
      action={signUpWithEmail}
      className="space-y-4"
      onSubmit={(event) => {
        if (password !== confirmPassword) {
          event.preventDefault();
          setSubmitError("Passwords do not match");
          return;
        }

        setSubmitError("");
      }}
    >
      <h2 className="text-lg font-semibold">Create account</h2>
      <input type="hidden" name="redirectTo" value={nextPath} />
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">Full name</span>
        <input
          type="text"
          name="fullName"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        />
      </label>
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
          minLength={6}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">Confirm Password</span>
        <input
          type="password"
          name="confirmPassword"
          minLength={6}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        />
      </label>
      {!passwordsMatch || submitError ? (
        <p className="text-sm text-rose-300">
          {submitError || "Passwords do not match"}
        </p>
      ) : null}
      <button
        disabled={password.length > 0 && confirmPassword.length > 0 && !passwordsMatch}
        className="w-full rounded-lg border border-slate-600 px-4 py-2 font-semibold text-white hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Create account
      </button>
    </form>
  );
}

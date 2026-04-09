"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function UploadSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Uploading..." : "Upload Materials"}
    </button>
  );
}

function GenerateSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full rounded-lg border border-cyan-400/70 px-4 py-2 font-semibold text-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Generating..." : "Generate Study Assets"}
    </button>
  );
}

type UploadMaterialFormProps = {
  courseId: string;
  maxUploadSizeBytes: number;
  action: (formData: FormData) => void | Promise<void>;
};

export function UploadMaterialForm({
  courseId,
  maxUploadSizeBytes,
  action,
}: UploadMaterialFormProps) {
  const [clientError, setClientError] = useState("");
  const maxUploadLabelMb = Math.floor(maxUploadSizeBytes / (1024 * 1024));

  return (
    <form
      action={action}
      className="mt-5 space-y-3"
      onSubmit={(event) => {
        const target = event.currentTarget.elements.namedItem("material");
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        const file = target.files?.[0];
        if (!file) {
          setClientError("");
          return;
        }

        if (file.size > maxUploadSizeBytes) {
          event.preventDefault();
          setClientError(
            `This file is too large to upload. Please upload a file under ${maxUploadLabelMb} MB.`,
          );
          return;
        }

        setClientError("");
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <label className="block text-sm">
        <span className="mb-1 block text-slate-300">Choose file</span>
        <input
          type="file"
          name="material"
          required
          accept=".pdf,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp,.doc,.docx"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-slate-400">Max file size: {maxUploadLabelMb} MB.</p>
      {clientError ? <p className="text-sm text-rose-300">{clientError}</p> : null}
      <UploadSubmitButton />
    </form>
  );
}

type GenerateAssetsFormProps = {
  courseId: string;
  action: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
};

export function GenerateAssetsForm({
  courseId,
  action,
  disabled = false,
}: GenerateAssetsFormProps) {
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="courseId" value={courseId} />
      {disabled ? (
        <button
          disabled
          className="w-full rounded-lg border border-cyan-400/70 px-4 py-2 font-semibold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate Study Assets
        </button>
      ) : (
        <GenerateSubmitButton />
      )}
    </form>
  );
}

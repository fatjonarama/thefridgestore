"use client";

import { useState } from "react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <button
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-black/70"
      />
      <div className="relative w-full max-w-sm border border-white/15 bg-[#141414] p-6">
        <h3 className="font-bold tracking-wide">{title}</h3>
        {description && <p className="mt-2 text-sm text-white/60">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              setSubmitting(true);
              await onConfirm();
              setSubmitting(false);
            }}
            disabled={submitting}
            className={`px-4 py-2 text-sm font-bold tracking-wide disabled:opacity-50 ${
              destructive
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-fridge-orange text-black hover:brightness-110"
            }`}
          >
            {submitting ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function ChipListInput({
  label,
  values,
  onChange,
  placeholder,
  error,
  swatchPreview = false,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  swatchPreview?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const value = draft.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-bold tracking-wide">{label}</span>

      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <li
              key={`${v}-${i}`}
              className="flex items-center gap-2 border border-white/15 bg-white/5 px-2 py-1 text-xs"
            >
              {swatchPreview && HEX_RE.test(v) && (
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: v }}
                />
              )}
              <span>{v}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${v}`}
                className="text-white/40 hover:text-fridge-orange"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder={placeholder}
          className="flex-1 border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
        />
        <button
          type="button"
          onClick={addDraft}
          className="border border-white/15 px-4 text-xs font-bold tracking-wide text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
        >
          ADD
        </button>
      </div>
      {error && <span className="text-xs text-fridge-orange">{error}</span>}
    </div>
  );
}

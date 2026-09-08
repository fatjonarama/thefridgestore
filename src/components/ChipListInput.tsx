"use client";

import { useRef, useState } from "react";

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function ChipListInput({
  label,
  values,
  onChange,
  placeholder,
  error,
  swatchPreview = false,
  imagePreview = false,
  onUpload,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  swatchPreview?: boolean;
  /** Shows a small thumbnail per chip and shortens the displayed URL to its filename. */
  imagePreview?: boolean;
  /** When provided, shows an "Upload" button that picks a local file and adds the returned URL. */
  onUpload?: (file: File) => Promise<string>;
}) {
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addDraft() {
    const value = draft.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setDraft("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUpload) return;
    setUploading(true);
    try {
      const url = await onUpload(file);
      if (!values.includes(url)) onChange([...values, url]);
    } catch {
      // Caller (onUpload) is responsible for surfacing the error to the user.
    } finally {
      setUploading(false);
    }
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
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v} alt="" className="h-8 w-8 shrink-0 border border-white/10 object-cover" />
              )}
              <span className="max-w-[180px] truncate">
                {imagePreview ? v.split("/").pop() : v}
              </span>
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
        {onUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border border-white/15 px-4 text-xs font-bold tracking-wide text-white/70 hover:border-fridge-orange hover:text-fridge-orange disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "UPLOADING…" : "UPLOAD"}
            </button>
          </>
        )}
      </div>
      {error && <span className="text-xs text-fridge-orange">{error}</span>}
    </div>
  );
}

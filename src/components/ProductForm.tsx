"use client";

import { useState } from "react";
import { AUDIENCES, AUDIENCE_LABELS, type Audience } from "@/lib/audience";
import { eurosToCents } from "@/lib/format";
import { slugify } from "@/lib/slugify";
import ChipListInput from "@/components/ChipListInput";
import type { ProductInput } from "@/db/adminMutations";
import type { ProductRow } from "@/db/schema";

export default function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: ProductRow;
  submitLabel: string;
  onSubmit: (values: ProductInput) => void | Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [category, setCategory] = useState(initial?.category ?? "");
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? "");
  const [audience, setAudience] = useState<Audience>(initial?.audience ?? "men");
  const [price, setPrice] = useState(initial ? String(initial.priceCents / 100) : "");
  const [compareAt, setCompareAt] = useState(
    initial?.compareAtCents ? String(initial.compareAtCents / 100) : "",
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [colors, setColors] = useState<string[]>(initial?.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);
  const [stock, setStock] = useState(initial ? String(initial.stock) : "0");
  const [isNew, setIsNew] = useState(initial?.isNew ?? true);
  const [active, setActive] = useState(initial?.active ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const priceCents = eurosToCents(price);
    const stockNum = Number(stock);

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!slug.trim()) nextErrors.slug = "Slug is required.";
    if (!Number.isFinite(priceCents) || priceCents <= 0)
      nextErrors.price = "Enter a price greater than 0.";
    if (sizes.length === 0) nextErrors.sizes = "Add at least one size.";
    if (!description.trim()) nextErrors.description = "Description is required.";
    if (!Number.isFinite(stockNum) || stockNum < 0)
      nextErrors.stock = "Stock must be 0 or greater.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        slug: slugify(slug),
        name: name.trim(),
        category: category.trim(),
        subcategory: subcategory.trim() || undefined,
        audience,
        priceCents,
        compareAtCents: compareAt ? eurosToCents(compareAt) : null,
        description: description.trim(),
        images,
        colors,
        sizes,
        stock: stockNum,
        isNew,
        active,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
      <Field label="Name" error={errors.name}>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="e.g. Blackout 04"
        />
      </Field>

      <Field label="Slug" error={errors.slug}>
        <input
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          className="border border-white/15 bg-transparent px-3 py-3 font-mono text-sm outline-none focus:border-fridge-orange"
          placeholder="blackout-04"
        />
        <span className="text-xs text-white/40">/product/{slug || "…"}</span>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Audience">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            className="border border-white/15 bg-background px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
            placeholder="e.g. Running"
          />
        </Field>
      </div>

      <Field label="Subcategory (optional)">
        <input
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="e.g. Low-top"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (EUR)" error={errors.price}>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
            placeholder="128"
          />
        </Field>

        <Field label="Compare-at price (optional)">
          <input
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            inputMode="decimal"
            className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
            placeholder="150"
          />
        </Field>
      </div>

      <ChipListInput
        label="Sizes (EU)"
        values={sizes}
        onChange={setSizes}
        placeholder="e.g. 42"
        error={errors.sizes}
      />

      <ChipListInput
        label="Colors (hex codes, optional)"
        values={colors}
        onChange={setColors}
        placeholder="#ff5a1f"
        swatchPreview
      />

      <ChipListInput
        label="Image URLs (optional)"
        values={images}
        onChange={setImages}
        placeholder="https://…"
      />

      <Field label="Stock" error={errors.stock}>
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          inputMode="numeric"
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="Low-profile street runner in triple black…"
        />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="accent-fridge-orange"
          />
          Tag as &ldquo;New drop&rdquo;
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-fridge-orange"
          />
          Active (visible on storefront)
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "SAVING…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-bold tracking-wide">{label}</span>
      {children}
      {error && <span className="text-xs text-fridge-orange">{error}</span>}
    </label>
  );
}

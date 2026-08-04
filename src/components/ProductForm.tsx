"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type Category, type Product } from "@/lib/products";

export type ProductFormValues = Omit<Product, "slug">;

const emptyValues: ProductFormValues = {
  name: "",
  price: 0,
  category: "men",
  sizes: [],
  description: "",
  tag: "",
};

export default function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? emptyValues.name);
  const [category, setCategory] = useState<Category>(
    initial?.category ?? emptyValues.category,
  );
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [sizesText, setSizesText] = useState(initial?.sizes.join(", ") ?? "");
  const [description, setDescription] = useState(
    initial?.description ?? emptyValues.description,
  );
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedPrice = Number(price);
    const sizes = sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0)
      nextErrors.price = "Enter a price greater than 0.";
    if (sizes.length === 0) nextErrors.sizes = "Add at least one size.";
    if (!description.trim()) nextErrors.description = "Description is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      price: parsedPrice,
      sizes,
      description: description.trim(),
      tag: tag.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
      <Field label="Name" error={errors.name}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="e.g. Blackout 04"
        />
      </Field>

      <Field label="Category">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="border border-white/15 bg-background px-3 py-3 text-sm outline-none focus:border-fridge-orange"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Price (USD)" error={errors.price}>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="128"
        />
      </Field>

      <Field label="Sizes (comma-separated)" error={errors.sizes}>
        <input
          value={sizesText}
          onChange={(e) => setSizesText(e.target.value)}
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="8, 9, 10, 10.5, 11, 12"
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

      <Field label="Tag (optional)">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
          placeholder="New drop"
        />
      </Field>

      <button
        type="submit"
        className="mt-2 bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
      >
        {submitLabel}
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

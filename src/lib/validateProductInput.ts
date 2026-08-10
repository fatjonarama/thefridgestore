import { BRANDS } from "@/lib/brands";
import type { ProductInput } from "@/db/adminMutations";

export function validateProductInput(
  body: unknown,
): { input: ProductInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || !b.name.trim()) return { error: "Name is required." };
  if (b.audience !== "men" && b.audience !== "women" && b.audience !== "kids") {
    return { error: "Invalid audience." };
  }
  if (typeof b.priceCents !== "number" || !Number.isFinite(b.priceCents) || b.priceCents <= 0) {
    return { error: "Price must be greater than 0." };
  }
  if (!Array.isArray(b.sizes) || b.sizes.length === 0) {
    return { error: "At least one size is required." };
  }
  if (typeof b.description !== "string") return { error: "Description is required." };
  if (typeof b.stock !== "number" || !Number.isFinite(b.stock) || b.stock < 0) {
    return { error: "Stock must be 0 or greater." };
  }

  return {
    input: {
      slug: typeof b.slug === "string" ? b.slug.trim() : "",
      name: b.name.trim(),
      brand: typeof b.brand === "string" && BRANDS.includes(b.brand as (typeof BRANDS)[number]) ? b.brand : "",
      audience: b.audience,
      priceCents: b.priceCents,
      compareAtCents:
        typeof b.compareAtCents === "number" && b.compareAtCents > 0 ? b.compareAtCents : null,
      description: b.description,
      images: Array.isArray(b.images) ? b.images.filter((v) => typeof v === "string") : [],
      colors: Array.isArray(b.colors) ? b.colors.filter((v) => typeof v === "string") : [],
      sizes: b.sizes.filter((v) => typeof v === "string"),
      stock: b.stock,
      isNew: Boolean(b.isNew),
      active: b.active !== false,
    },
  };
}

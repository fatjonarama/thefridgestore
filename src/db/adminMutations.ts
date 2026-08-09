import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import { slugify } from "@/lib/slugify";

// Plain server-only module (no "use server") — these are admin mutations,
// reachable only through the authenticated /api/admin/* route handlers, not
// directly callable from client components as Server Actions.

export type ProductInput = {
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  audience: "men" | "women" | "kids";
  priceCents: number;
  compareAtCents?: number | null;
  description: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  isNew: boolean;
  active: boolean;
};

async function uniqueSlug(desiredSlug: string, ignoreId?: number) {
  const base = slugify(desiredSlug) || "product";
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .limit(1);
    if (existing.length === 0 || existing[0].id === ignoreId) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

function revalidateProductPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function createProduct(input: ProductInput) {
  const slug = await uniqueSlug(input.slug || input.name);
  const [row] = await db
    .insert(products)
    .values({ ...input, slug })
    .returning();
  revalidateProductPaths(slug);
  return row;
}

export async function updateProduct(id: number, input: ProductInput) {
  const slug = await uniqueSlug(input.slug || input.name, id);
  const [row] = await db
    .update(products)
    .set({ ...input, slug })
    .where(eq(products.id, id))
    .returning();
  revalidateProductPaths(slug);
  return row;
}

/** Soft delete: sets active=false rather than removing the row, since
 * order_items can reference a product and hard-deleting would either fail
 * the FK or orphan historical order data. */
export async function softDeleteProduct(id: number) {
  const [row] = await db
    .update(products)
    .set({ active: false })
    .where(eq(products.id, id))
    .returning();
  revalidateProductPaths(row?.slug);
  return row;
}

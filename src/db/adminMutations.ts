import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderItems, orders, products, type OrderStatus } from "@/db/schema";
import { slugify } from "@/lib/slugify";

// Plain server-only module (no "use server") — these are admin mutations,
// reachable only through the authenticated /api/admin/* route handlers, not
// directly callable from client components as Server Actions.

export type ProductInput = {
  slug: string;
  name: string;
  brand: string;
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

async function adjustStockForOrder(orderId: number, direction: 1 | -1) {
  const items = await db
    .select({ productId: orderItems.productId, qty: orderItems.qty })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(products)
      .set({ stock: sql`greatest(${products.stock} + ${direction * item.qty}, 0)` })
      .where(eq(products.id, item.productId));
  }
}

/**
 * Cancelling an order releases its items back into stock; un-cancelling
 * (moving a cancelled order to any other status) takes them out again, so
 * stock stays accurate no matter how an admin flips status back and forth.
 */
export async function updateOrderStatusAdmin(orderId: number, status: OrderStatus) {
  const [existing] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!existing) return null;

  if (existing.status !== "cancelled" && status === "cancelled") {
    await adjustStockForOrder(orderId, 1);
  } else if (existing.status === "cancelled" && status !== "cancelled") {
    await adjustStockForOrder(orderId, -1);
  }

  const [row] = await db.update(orders).set({ status }).where(eq(orders.id, orderId)).returning();
  revalidatePath("/admin/orders");
  revalidatePath("/shop");
  return row;
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { slugify } from "@/lib/slugify";

export type ProductInput = {
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

async function uniqueSlug(name: string, ignoreId?: number) {
  const base = slugify(name) || "product";
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

export async function createProduct(input: ProductInput) {
  const slug = await uniqueSlug(input.name);
  const [row] = await db
    .insert(products)
    .values({ ...input, slug })
    .returning();
  revalidatePath("/");
  revalidatePath("/shop/[category]", "page");
  revalidatePath("/admin/products");
  return row;
}

export async function updateProduct(id: number, input: ProductInput) {
  const slug = await uniqueSlug(input.name, id);
  const [row] = await db
    .update(products)
    .set({ ...input, slug })
    .where(eq(products.id, id))
    .returning();
  revalidatePath("/");
  revalidatePath("/shop/[category]", "page");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/admin/products");
  return row;
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/");
  revalidatePath("/shop/[category]", "page");
  revalidatePath("/admin/products");
}

export async function adjustStock(id: number, stock: number) {
  await db
    .update(products)
    .set({ stock: Math.max(0, stock) })
    .where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export type OrderItemInput = {
  productId: number | null;
  name: string;
  size: string;
  priceCents: number;
  qty: number;
};

export type OrderInput = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: OrderItemInput[];
};

export async function createOrder(input: OrderInput) {
  const totalCents = input.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

  const [order] = await db
    .insert(orders)
    .values({
      customerName: input.customerName,
      phone: input.phone,
      email: input.email || null,
      address: input.address,
      notes: input.notes || null,
      totalCents,
    })
    .returning();

  if (input.items.length > 0) {
    await db.insert(orderItems).values(
      input.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        size: item.size,
        priceCents: item.priceCents,
        qty: item.qty,
      })),
    );
  }

  revalidatePath("/admin/orders");
  return order;
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "confirmed" | "fulfilled" | "cancelled",
) {
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
}

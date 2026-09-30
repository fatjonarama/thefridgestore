"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { SHIPPING_CENTS, type Country } from "@/lib/shipping";

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
  country: Country;
  address: string;
  notes?: string;
  items: OrderItemInput[];
};

export type CreateOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; error: string };

export async function createOrder(input: OrderInput): Promise<CreateOrderResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const productIds = input.items
    .map((item) => item.productId)
    .filter((id): id is number => id !== null);

  const productRows =
    productIds.length > 0
      ? await db.select().from(products).where(inArray(products.id, productIds))
      : [];
  const productById = new Map(productRows.map((p) => [p.id, p]));

  // A product can appear as more than one cart line (same shoe, different
  // sizes) but `stock` tracks total units regardless of size, so quantities
  // are combined per product before checking against it.
  const qtyByProductId = new Map<number, number>();
  for (const item of input.items) {
    if (item.productId === null) continue;
    qtyByProductId.set(item.productId, (qtyByProductId.get(item.productId) ?? 0) + item.qty);
  }

  // Price, name, and stock are never trusted from the client — an item's
  // id is looked up against the real product row so a tampered cart (or a
  // direct call to this action) can't under-price an order or drain stock
  // on an arbitrary product.
  const resolvedItems: { productId: number; name: string; size: string; priceCents: number; qty: number }[] = [];
  for (const item of input.items) {
    const product = item.productId !== null ? productById.get(item.productId) : undefined;
    if (!product || !product.active) {
      return {
        ok: false,
        error: `"${item.name}" is no longer available — please remove it from your cart.`,
      };
    }
    if (item.qty < 1 || !Number.isInteger(item.qty)) {
      return { ok: false, error: `Invalid quantity for "${product.name}".` };
    }
    const totalRequested = qtyByProductId.get(product.id) ?? item.qty;
    if (product.stock < totalRequested) {
      return {
        ok: false,
        error:
          product.stock > 0
            ? `Only ${product.stock} left of "${product.name}" — please adjust the quantity.`
            : `"${product.name}" just sold out — please remove it from your cart.`,
      };
    }
    resolvedItems.push({
      productId: product.id,
      name: product.name,
      size: item.size,
      priceCents: product.priceCents,
      qty: item.qty,
    });
  }

  const subtotalCents = resolvedItems.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  const shippingCents = SHIPPING_CENTS[input.country];
  const totalCents = subtotalCents + shippingCents;
  const currentUser = await getCurrentUser();

  const [order] = await db
    .insert(orders)
    .values({
      userId: currentUser?.id ?? null,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email || currentUser?.email || null,
      country: input.country,
      address: input.address,
      notes: input.notes || null,
      shippingCents,
      totalCents,
    })
    .returning();

  await db.insert(orderItems).values(
    resolvedItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      size: item.size,
      priceCents: item.priceCents,
      qty: item.qty,
    })),
  );

  for (const item of resolvedItems) {
    await db
      .update(products)
      .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)` })
      .where(eq(products.id, item.productId));
  }

  revalidatePath("/admin/orders");
  revalidatePath("/shop");
  return { ok: true, orderId: order.id };
}

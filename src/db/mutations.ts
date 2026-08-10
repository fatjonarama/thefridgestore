"use server";

import { eq, sql } from "drizzle-orm";
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

export async function createOrder(input: OrderInput) {
  const subtotalCents = input.items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
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

    for (const item of input.items) {
      if (!item.productId) continue;
      await db
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${item.qty}, 0)` })
        .where(eq(products.id, item.productId));
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/shop");
  return order;
}

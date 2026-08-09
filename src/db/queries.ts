import { and, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, type OrderItemRow, type OrderRow, type ProductRow } from "@/db/schema";

// "kids" is retired from the storefront (still a valid DB/enum value for
// backward compatibility) — every public-facing query excludes it so any
// legacy row never surfaces to shoppers. Admin queries stay unfiltered.
const notKids = ne(products.audience, "kids");

export async function getActiveProducts(): Promise<ProductRow[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), notKids))
    .orderBy(desc(products.createdAt));
}

export async function getProductBySlug(slug: string): Promise<ProductRow | undefined> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true), notKids))
    .limit(1);
  return rows[0];
}

export async function getFreshDrops(limit = 3): Promise<ProductRow[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.isNew, true), notKids))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getAllProductsAdmin(): Promise<ProductRow[]> {
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductByIdAdmin(id: number): Promise<ProductRow | undefined> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0];
}

export async function getProductBySlugAdmin(slug: string): Promise<ProductRow | undefined> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0];
}

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

export async function getAllOrdersWithItems(): Promise<OrderWithItems[]> {
  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  if (orderRows.length === 0) return [];

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderRows.map((o) => o.id)));

  return orderRows.map((order) => ({
    ...order,
    items: itemRows.filter((item) => item.orderId === order.id),
  }));
}

export async function searchProducts(query: string, limit = 8): Promise<ProductRow[]> {
  const q = `%${query}%`;
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        notKids,
        or(ilike(products.name, q), ilike(products.category, q)),
      ),
    )
    .limit(limit);
}

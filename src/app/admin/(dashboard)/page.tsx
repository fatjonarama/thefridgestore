import Link from "next/link";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { AUDIENCES, AUDIENCE_LABELS } from "@/lib/audience";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const allProducts = await db.select().from(products);
  const pendingOrders = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "pending"));

  const counts = AUDIENCES.map((audience) => ({
    audience,
    count: allProducts.filter((p) => p.audience === audience).length,
  }));

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide">DASHBOARD</h2>
      <p className="mt-2 text-sm text-white/50">Overview of your catalog and orders.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="border border-white/10 p-6">
          <p className="text-xs uppercase tracking-wide text-white/40">
            Total products
          </p>
          <p className="mt-2 font-display text-3xl">{allProducts.length}</p>
        </div>
        {counts.map(({ audience, count }) => (
          <div key={audience} className="border border-white/10 p-6">
            <p className="text-xs uppercase tracking-wide text-white/40">
              {AUDIENCE_LABELS[audience]}
            </p>
            <p className="mt-2 font-display text-3xl">{count}</p>
          </div>
        ))}
        <div className="border border-fridge-orange/50 bg-fridge-orange/10 p-6">
          <p className="text-xs uppercase tracking-wide text-fridge-orange">
            Pending orders
          </p>
          <p className="mt-2 font-display text-3xl text-fridge-orange">
            {pendingOrders[0]?.count ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/orders"
          className="bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
        >
          VIEW ORDERS
        </Link>
        <Link
          href="/admin/products"
          className="border border-white/20 px-6 py-3 text-sm font-bold tracking-wide text-white hover:border-fridge-orange hover:text-fridge-orange"
        >
          MANAGE PRODUCTS
        </Link>
        <Link
          href="/admin/products/new"
          className="border border-white/20 px-6 py-3 text-sm font-bold tracking-wide text-white hover:border-fridge-orange hover:text-fridge-orange"
        >
          + ADD PRODUCT
        </Link>
      </div>
    </div>
  );
}

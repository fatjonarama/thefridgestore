"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/products";

export default function AdminDashboardPage() {
  const { products } = useProducts();

  const counts = CATEGORIES.map((cat) => ({
    category: cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide">DASHBOARD</h2>
      <p className="mt-2 text-sm text-white/50">
        Overview of your catalog. Changes here are stored in this browser.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-white/10 p-6">
          <p className="text-xs uppercase tracking-wide text-white/40">
            Total products
          </p>
          <p className="mt-2 font-display text-3xl">{products.length}</p>
        </div>
        {counts.map(({ category, count }) => (
          <div key={category} className="border border-white/10 p-6">
            <p className="text-xs uppercase tracking-wide text-white/40">
              {CATEGORY_LABELS[category]}
            </p>
            <p className="mt-2 font-display text-3xl">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Link
          href="/admin/products"
          className="bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
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

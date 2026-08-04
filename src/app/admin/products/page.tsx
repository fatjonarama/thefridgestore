"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { CATEGORY_LABELS } from "@/lib/products";

export default function AdminProductsPage() {
  const { products, deleteProduct } = useProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl tracking-wide">PRODUCTS</h2>
        <Link
          href="/admin/products/new"
          className="bg-fridge-orange px-5 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
        >
          + ADD PRODUCT
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No products yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Sizes</th>
                <th className="px-4 py-3 font-normal">Tag</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-white/40">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {CATEGORY_LABELS[product.category]}
                  </td>
                  <td className="px-4 py-3 text-fridge-orange">${product.price}</td>
                  <td className="px-4 py-3 text-white/70">{product.sizes.length}</td>
                  <td className="px-4 py-3 text-white/70">{product.tag ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4 text-xs font-bold tracking-wide">
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        className="text-white/70 hover:text-fridge-orange"
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Delete "${product.name}"? This can't be undone.`)
                          ) {
                            deleteProduct(product.slug);
                          }
                        }}
                        className="text-white/70 hover:text-fridge-orange"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

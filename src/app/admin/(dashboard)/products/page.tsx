import Link from "next/link";
import { getAllProductsAdmin } from "@/db/queries";
import { AUDIENCE_LABELS } from "@/lib/audience";
import { formatCents } from "@/lib/format";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const productsList = await getAllProductsAdmin();

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

      {productsList.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No products yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Audience</th>
                <th className="px-4 py-3 font-normal">Price</th>
                <th className="px-4 py-3 font-normal">Stock</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsList.map((product) => (
                <tr key={product.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-xs text-white/40">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {AUDIENCE_LABELS[product.audience]}
                  </td>
                  <td className="px-4 py-3 text-fridge-orange">
                    {formatCents(product.priceCents)}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {product.stock <= 0 ? (
                      <span className="text-fridge-orange">Out of stock</span>
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs">
                      {product.isNew && (
                        <span className="w-fit bg-fridge-orange px-2 py-0.5 font-bold text-black">
                          NEW DROP
                        </span>
                      )}
                      {!product.active && (
                        <span className="w-fit border border-white/20 px-2 py-0.5 text-white/50">
                          Hidden
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4 text-xs font-bold tracking-wide">
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        className="text-white/70 hover:text-fridge-orange"
                      >
                        EDIT
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
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

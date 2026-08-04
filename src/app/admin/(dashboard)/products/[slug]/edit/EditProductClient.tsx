"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { deleteProduct, updateProduct, type ProductInput } from "@/db/mutations";
import type { ProductRow } from "@/db/schema";

export default function EditProductClient({ product }: { product: ProductRow }) {
  const router = useRouter();

  async function handleSubmit(values: ProductInput) {
    await updateProduct(product.id, values);
    router.push("/admin/products");
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    await deleteProduct(product.id);
    router.push("/admin/products");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl tracking-wide">EDIT PRODUCT</h2>
        <button
          onClick={handleDelete}
          className="border border-white/20 px-4 py-2 text-xs font-bold tracking-wide text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
        >
          DELETE PRODUCT
        </button>
      </div>
      <div className="mt-8">
        <ProductForm initial={product} submitLabel="SAVE CHANGES" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

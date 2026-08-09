"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import { adminFetch } from "@/lib/adminFetch";
import type { ProductInput } from "@/db/adminMutations";
import type { ProductRow } from "@/db/schema";

export default function EditProductClient({ product }: { product: ProductRow }) {
  const router = useRouter();
  const toast = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmit(values: ProductInput) {
    try {
      await adminFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      toast.success(`"${values.name}" saved.`);
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product.");
    }
  }

  async function handleDelete() {
    try {
      await adminFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      toast.success(`"${product.name}" removed from the storefront.`);
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setConfirmingDelete(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl tracking-wide">EDIT PRODUCT</h2>
        <button
          onClick={() => setConfirmingDelete(true)}
          className="border border-white/20 px-4 py-2 text-xs font-bold tracking-wide text-white/70 hover:border-red-500 hover:text-red-400"
        >
          DELETE PRODUCT
        </button>
      </div>
      <div className="mt-8">
        <ProductForm initial={product} submitLabel="SAVE CHANGES" onSubmit={handleSubmit} />
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${product.name}"?`}
        description="This removes it from the storefront immediately. It stays in the database (soft-deleted) so past orders referencing it are unaffected — you can restore it later by editing it and switching Active back on."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

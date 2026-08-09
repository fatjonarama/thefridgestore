"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { useToast } from "@/context/ToastContext";
import { adminFetch } from "@/lib/adminFetch";
import type { ProductInput } from "@/db/adminMutations";

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(values: ProductInput) {
    try {
      await adminFetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success(`"${values.name}" created.`);
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product.");
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide">ADD PRODUCT</h2>
      <div className="mt-8">
        <ProductForm submitLabel="CREATE PRODUCT" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

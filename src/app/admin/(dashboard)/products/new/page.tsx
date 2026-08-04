"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { createProduct, type ProductInput } from "@/db/mutations";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(values: ProductInput) {
    await createProduct(values);
    router.push("/admin/products");
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

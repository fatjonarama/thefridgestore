"use client";

import { useRouter } from "next/navigation";
import ProductForm, { type ProductFormValues } from "@/components/ProductForm";
import { useProducts } from "@/context/ProductsContext";

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useProducts();

  function handleSubmit(values: ProductFormValues) {
    addProduct(values);
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

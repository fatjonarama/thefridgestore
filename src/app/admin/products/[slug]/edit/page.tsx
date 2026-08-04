"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProductForm, { type ProductFormValues } from "@/components/ProductForm";
import { useProducts } from "@/context/ProductsContext";
import { getProductBySlug } from "@/lib/products";

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { products, updateProduct, deleteProduct } = useProducts();
  const product = getProductBySlug(products, slug);

  if (!product) {
    return (
      <div>
        <p className="text-sm text-white/50">Product not found.</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-fridge-orange hover:underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  function handleSubmit(values: ProductFormValues) {
    updateProduct(slug, values);
    router.push("/admin/products");
  }

  const productName = product.name;

  function handleDelete() {
    if (window.confirm(`Delete "${productName}"? This can't be undone.`)) {
      deleteProduct(slug);
      router.push("/admin/products");
    }
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

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { useProducts } from "@/context/ProductsContext";
import { getProductBySlug } from "@/lib/products";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useProducts();
  const product = getProductBySlug(products, slug);

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-16 text-center">
        <p className="text-sm text-white/50">Product not found.</p>
        <Link href="/" className="mt-4 inline-block text-fridge-orange hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <ProductDetail product={product} />
    </main>
  );
}

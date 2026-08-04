"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getProductsByCategory,
  type Category,
} from "@/lib/products";

function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export default function ShopCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { products } = useProducts();

  if (!isCategory(category)) {
    return (
      <main className="mx-auto w-full max-w-7xl px-6 py-16 text-center">
        <p className="text-sm text-white/50">Category not found.</p>
        <Link href="/" className="mt-4 inline-block text-fridge-orange hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  const categoryProducts = getProductsByCategory(products, category);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">
        {CATEGORY_LABELS[category].toUpperCase()}
      </h1>
      <p className="mt-2 text-sm text-white/50">
        {categoryProducts.length}{" "}
        {categoryProducts.length === 1 ? "style" : "styles"}
      </p>
      {categoryProducts.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No products in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

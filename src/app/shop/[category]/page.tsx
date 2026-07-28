import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  CATEGORY_LABELS,
  getProductsByCategory,
  type Category,
} from "@/lib/products";

const CATEGORIES: Category[] = ["men", "women", "kids"];

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export default async function ShopCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const products = getProductsByCategory(category);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">
        {CATEGORY_LABELS[category].toUpperCase()}
      </h1>
      <p className="mt-2 text-sm text-white/50">
        {products.length} {products.length === 1 ? "style" : "styles"}
      </p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </main>
  );
}

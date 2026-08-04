"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import type { ProductRow } from "@/db/schema";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (slugs.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) {
          setProducts([]);
          setLoaded(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/products?slugs=${slugs.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts(data.products);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slugs]);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">WISHLIST</h1>

      {!loaded ? null : products.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-white/50">
            Nothing saved yet. Tap the heart on any pair to add it here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
          >
            BROWSE PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

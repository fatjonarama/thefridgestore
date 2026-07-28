"use client";

import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.slug);

  return (
    <div className="group relative">
      <button
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.slug);
        }}
        className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border text-sm ${
          wishlisted
            ? "border-fridge-orange bg-fridge-orange text-black"
            : "border-white/20 bg-black/60 text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
        }`}
      >
        ♥
      </button>
      <Link href={`/product/${product.slug}`} className="block">
        <Placeholder className="relative aspect-square w-full">
          {product.tag && (
            <span className="absolute left-2 top-2 bg-fridge-orange px-2 py-1 text-[10px] font-bold tracking-wide text-black">
              {product.tag.toUpperCase()}
            </span>
          )}
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] tracking-widest text-white/30">
            PRODUCT PHOTO
          </span>
        </Placeholder>
        <p className="mt-3 text-sm font-bold tracking-wide group-hover:text-fridge-orange">
          {product.name}
        </p>
        <p className="text-sm text-fridge-orange">${product.price}</p>
      </Link>
    </div>
  );
}

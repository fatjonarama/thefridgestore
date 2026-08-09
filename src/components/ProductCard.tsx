"use client";

import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCents } from "@/lib/format";
import type { ProductRow } from "@/db/schema";

export default function ProductCard({ product }: { product: ProductRow }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative transition-transform duration-300 ease-out hover:-translate-y-1">
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          className={`flex h-8 w-8 items-center justify-center border text-sm transition-colors ${
            wishlisted
              ? "border-fridge-orange bg-fridge-orange text-black"
              : "border-white/20 bg-background/60 text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
          }`}
        >
          ♥
        </button>
        {!outOfStock && (
          <button
            aria-label={`Quick add ${product.name} to cart`}
            onClick={(e) => {
              e.preventDefault();
              addToCart(
                {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                },
                product.sizes[0],
              );
            }}
            className="flex h-8 w-8 items-center justify-center border border-white/20 bg-background/60 text-base text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange"
          >
            +
          </button>
        )}
      </div>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden">
          <Placeholder className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
            {product.isNew && (
              <span className="absolute left-2 top-2 bg-fridge-orange px-2 py-1 text-[10px] font-bold tracking-wide text-black">
                NEW DROP
              </span>
            )}
            {outOfStock && (
              <span className="absolute bottom-2 left-2 bg-white/10 px-2 py-1 text-[10px] font-bold tracking-wide text-white/70">
                SOLD OUT
              </span>
            )}
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] tracking-widest text-white/30">
              PRODUCT PHOTO
            </span>
          </Placeholder>
        </div>
        <p className="mt-3 text-sm font-bold tracking-wide transition-colors group-hover:text-fridge-orange">
          {product.name}
        </p>
        <p className="text-sm text-fridge-orange">{formatCents(product.priceCents)}</p>
      </Link>
    </div>
  );
}

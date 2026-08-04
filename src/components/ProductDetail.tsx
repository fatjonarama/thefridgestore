"use client";

import { useState } from "react";
import Placeholder from "@/components/Placeholder";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCents } from "@/lib/format";
import type { ProductRow } from "@/db/schema";

export default function ProductDetail({ product }: { product: ProductRow }) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(product.colors[0] ?? null);
  const [error, setError] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.stock <= 0;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <Placeholder className="relative aspect-square w-full">
        {product.isNew && (
          <span className="absolute left-3 top-3 bg-fridge-orange px-2 py-1 text-[10px] font-bold tracking-wide text-black">
            NEW DROP
          </span>
        )}
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs tracking-widest text-white/30">
          PRODUCT PHOTO
        </span>
      </Placeholder>

      <div>
        <h1 className="font-display text-4xl tracking-wide">{product.name}</h1>
        <div className="mt-2 flex items-baseline gap-3">
          <p className="text-xl text-fridge-orange">{formatCents(product.priceCents)}</p>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <p className="text-sm text-white/40 line-through">
              {formatCents(product.compareAtCents)}
            </p>
          )}
        </div>
        <p className="mt-6 max-w-md text-sm text-white/60">{product.description}</p>

        {product.colors.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-bold tracking-wide">
              COLOR{color ? ` — ${color}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full border-2 ${
                    color === c ? "border-fridge-orange" : "border-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold tracking-wide">SELECT SIZE</p>
            {error && (
              <p className="text-xs text-fridge-orange">Please select a size</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s);
                  setError(false);
                }}
                className={`border py-2 text-sm ${
                  size === s
                    ? "border-fridge-orange bg-fridge-orange text-black"
                    : "border-white/15 text-white/80 hover:border-fridge-orange hover:text-fridge-orange"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            disabled={outOfStock}
            onClick={() => {
              if (!size) {
                setError(true);
                return;
              }
              addToCart(
                {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                },
                size,
              );
            }}
            className="flex-1 bg-fridge-orange py-4 text-sm font-bold tracking-wide text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {outOfStock ? "SOLD OUT" : "ADD TO CART"}
          </button>
          <button
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggleWishlist(product.slug)}
            className={`flex h-[52px] w-[52px] items-center justify-center border text-lg ${
              wishlisted
                ? "border-fridge-orange bg-fridge-orange text-black"
                : "border-white/15 text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
            }`}
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}

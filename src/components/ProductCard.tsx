"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Placeholder from "@/components/Placeholder";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCents } from "@/lib/format";
import type { ProductRow } from "@/db/schema";

const DOUBLE_CLICK_WINDOW_MS = 260;
const HEART_POP_MS = 700;

export default function ProductCard({ product }: { product: ProductRow }) {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.stock <= 0;
  const onSale = product.compareAtCents !== null && product.compareAtCents > product.priceCents;

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heartPop, setHeartPop] = useState(false);

  function handleImageClick(e: React.MouseEvent) {
    e.preventDefault();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      if (!wishlisted) toggleWishlist(product.slug);
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), HEART_POP_MS);
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        router.push(`/product/${product.slug}`);
      }, DOUBLE_CLICK_WINDOW_MS);
    }
  }

  function handleQuickAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
      },
      product.sizes[0],
    );
    window.dispatchEvent(
      new CustomEvent("fridge:add-to-cart", {
        detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      }),
    );
  }

  return (
    <div className="group relative flex flex-col overflow-hidden border border-frost bg-glass transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-fridge-orange md:hover:shadow-[0_20px_45px_-16px_rgba(91,184,232,0.4)]">
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
              : "border-frost bg-background/60 text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
          }`}
        >
          ♥
        </button>
        {!outOfStock && (
          <button
            aria-label={`Quick add ${product.name} to cart`}
            onClick={handleQuickAdd}
            className="flex h-8 w-8 items-center justify-center border border-frost bg-background/60 text-base text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange"
          >
            +
          </button>
        )}
      </div>
      {/* Mouse-only quick interaction (single click navigates, double click
          wishlists); the Link below covers keyboard/screen-reader access. */}
      <div
        aria-hidden="true"
        onClick={handleImageClick}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden"
      >
        <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
          {product.images.length > 0 ? (
            <>
              <Image
                src={product.images[0]}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
              {product.images[1] && (
                <Image
                  src={product.images[1]}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <Placeholder className="absolute inset-0 h-full w-full" />
          )}
          <span className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-500 [background:linear-gradient(135deg,rgba(168,216,240,0.14),transparent_60%)] group-hover:opacity-0" />
          {product.isNew && (
            <span className="absolute left-2 top-2 bg-fridge-orange px-2 py-1 text-[10px] font-bold tracking-wide text-black">
              NEW DROP
            </span>
          )}
          {onSale && !product.isNew && (
            <span className="glass absolute left-2 top-2 border px-2 py-1 text-[10px] font-bold tracking-wide text-fridge-orange">
              SALE
            </span>
          )}
          {outOfStock && (
            <span className="glass absolute bottom-2 left-2 border px-2 py-1 text-[10px] font-bold tracking-wide text-ice-300">
              SOLD OUT
            </span>
          )}
          {product.images.length === 0 && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] tracking-widest text-white/30">
              PRODUCT PHOTO
            </span>
          )}
          {heartPop && (
            <span className="heart-pop pointer-events-none absolute inset-0 flex items-center justify-center text-7xl text-fridge-orange">
              ♥
            </span>
          )}
        </div>
      </div>
      <Link href={`/product/${product.slug}`} className="block px-3 py-3">
        <p className="text-sm font-bold tracking-wide transition-colors group-hover:text-fridge-orange">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-sm text-fridge-orange">{formatCents(product.priceCents)}</p>
          {onSale && (
            <p className="text-xs text-muted line-through">
              {formatCents(product.compareAtCents!)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Placeholder from "@/components/Placeholder";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatCents } from "@/lib/format";
import type { ProductRow } from "@/db/schema";

const SWIPE_THRESHOLD_PX = 40;
const MAX_ZOOM = 3;

function touchDistance(a: React.Touch, b: React.Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export default function ProductDetail({ product }: { product: ProductRow }) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(product.colors[0] ?? null);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.stock <= 0;
  const hasImages = product.images.length > 0;

  const swipeStartX = useRef<number | null>(null);
  const pinchStartDist = useRef<number | null>(null);

  function handleGalleryTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinchStartDist.current = touchDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      swipeStartX.current = e.touches[0].clientX;
    }
  }

  function handleGalleryTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dist = touchDistance(e.touches[0], e.touches[1]);
      setZoomScale(Math.min(MAX_ZOOM, Math.max(1, dist / pinchStartDist.current)));
    }
  }

  function handleGalleryTouchEnd(e: React.TouchEvent) {
    if (pinchStartDist.current !== null && e.touches.length < 2) {
      pinchStartDist.current = null;
      setZoomScale(1);
      return;
    }
    if (swipeStartX.current !== null && e.changedTouches.length > 0) {
      const dx = e.changedTouches[0].clientX - swipeStartX.current;
      swipeStartX.current = null;
      if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
        setActiveImage((i) =>
          dx < 0 ? Math.min(product.images.length - 1, i + 1) : Math.max(0, i - 1),
        );
      }
    }
  }

  function handleAddToCart() {
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
  }

  return (
    <div className="grid gap-10 pb-28 md:grid-cols-2 md:pb-0">
      <div>
        {/* Mobile: full-width swipeable gallery with dots + pinch-to-zoom */}
        <div
          className="relative aspect-square w-full touch-pan-y overflow-hidden md:hidden"
          onTouchStart={handleGalleryTouchStart}
          onTouchMove={handleGalleryTouchMove}
          onTouchEnd={handleGalleryTouchEnd}
        >
          {hasImages ? (
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeImage * 100}%)` }}
            >
              {product.images.map((src, i) => (
                <div key={src} className="relative h-full w-full shrink-0 overflow-hidden">
                  <div
                    className="relative h-full w-full transition-transform duration-200 ease-out"
                    style={{ transform: i === activeImage ? `scale(${zoomScale})` : undefined }}
                  >
                    <Image
                      src={src}
                      alt={i === 0 ? product.name : ""}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Placeholder className="h-full w-full" />
          )}
          {product.isNew && (
            <span className="absolute left-3 top-3 bg-fridge-orange px-2 py-1 text-[10px] font-bold tracking-wide text-black">
              NEW DROP
            </span>
          )}
          {!hasImages && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs tracking-widest text-muted">
              PRODUCT PHOTO
            </span>
          )}
          {product.images.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeImage ? "w-5 bg-fridge-orange" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: unchanged from before this pass. */}
        <div className="relative hidden aspect-square w-full overflow-hidden md:block">
          {hasImages ? (
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <Placeholder className="h-full w-full" />
          )}
          {product.isNew && (
            <span className="absolute left-3 top-3 bg-fridge-orange px-2 py-1 text-[10px] font-bold tracking-wide text-black">
              NEW DROP
            </span>
          )}
          {!hasImages && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs tracking-widest text-muted">
              PRODUCT PHOTO
            </span>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 hidden gap-2 md:flex">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                aria-label={`View photo ${i + 1}`}
                className={`relative h-16 w-16 overflow-hidden border ${
                  i === activeImage ? "border-fridge-orange" : "border-frost"
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-4xl tracking-wide">{product.name}</h1>
        <div className="mt-2 flex items-baseline gap-3">
          <p className="text-xl text-fridge-orange">{formatCents(product.priceCents)}</p>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <p className="text-sm text-muted line-through">
              {formatCents(product.compareAtCents)}
            </p>
          )}
        </div>
        <p className="mt-6 max-w-md text-sm text-body/80">{product.description}</p>

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
                    color === c ? "border-fridge-orange" : "border-frost"
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
                disabled={outOfStock}
                onClick={() => {
                  setSize(s);
                  setError(false);
                }}
                className={`flex h-12 items-center justify-center border text-sm md:h-auto md:py-2 ${
                  outOfStock
                    ? "cursor-not-allowed border-frost text-muted line-through opacity-50"
                    : size === s
                      ? "border-fridge-orange bg-fridge-orange text-black"
                      : "border-frost text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: unchanged from before this pass. */}
        <div className="mt-8 hidden gap-3 md:flex">
          <button
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="btn-frost-primary flex-1 bg-fridge-orange py-4 text-sm font-bold tracking-wide text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {outOfStock ? "SOLD OUT" : "ADD TO CART"}
          </button>
          <button
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggleWishlist(product.slug)}
            className={`flex h-[52px] w-[52px] items-center justify-center border text-lg ${
              wishlisted
                ? "border-fridge-orange bg-fridge-orange text-black"
                : "border-frost text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
            }`}
          >
            ♥
          </button>
        </div>
      </div>

      {/* Mobile: sticky bottom bar, above the iPhone home indicator. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-frost bg-background/95 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:hidden">
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.slug)}
          className={`flex h-12 w-12 shrink-0 items-center justify-center border text-lg ${
            wishlisted
              ? "border-fridge-orange bg-fridge-orange text-black"
              : "border-frost text-ice-300"
          }`}
        >
          ♥
        </button>
        <div className="min-w-0 shrink-0">
          <p className="text-lg font-bold text-fridge-orange">{formatCents(product.priceCents)}</p>
        </div>
        <button
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="btn-frost-primary flex-1 bg-fridge-orange py-3.5 text-sm font-bold tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? "SOLD OUT" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}

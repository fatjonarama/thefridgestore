"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Placeholder from "@/components/Placeholder";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { usePresence } from "@/lib/usePresence";
import { formatCents } from "@/lib/format";
import type { ProductRow } from "@/db/schema";

const DOUBLE_CLICK_WINDOW_MS = 260;
const HEART_POP_MS = 700;
const SHEET_TRANSITION_MS = 300;

export default function ProductCard({ product }: { product: ProductRow }) {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.slug);
  const outOfStock = product.stock <= 0;
  const onSale = product.compareAtCents !== null && product.compareAtCents > product.priceCents;

  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heartPop, setHeartPop] = useState(false);
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false);
  const flyOrigin = useRef({ x: 0, y: 0 });
  const { shouldRender: sheetMounted, visible: sheetVisible } = usePresence(sizeSheetOpen, SHEET_TRANSITION_MS);

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

  function addAndFly(size: string) {
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
      },
      size,
    );
    window.dispatchEvent(
      new CustomEvent("fridge:add-to-cart", { detail: flyOrigin.current }),
    );
  }

  function handleQuickAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    flyOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    // Desktop keeps the original one-tap add (first size); mobile can't
    // add without picking a size, so it opens a sheet instead. This is a
    // real behavior branch (not just styling), so it's read from the
    // viewport at click time rather than duplicated markup.
    if (window.innerWidth < 768 && product.sizes.length > 1) {
      setSizeSheetOpen(true);
      return;
    }
    addAndFly(product.sizes[0]);
  }

  function handleSizePick(size: string) {
    addAndFly(size);
    setSizeSheetOpen(false);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden border border-frost bg-glass transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-fridge-orange md:hover:shadow-[0_20px_45px_-16px_rgba(91,184,232,0.4)]">
      <div className="absolute right-1 top-1 z-10 flex flex-col gap-1 md:right-2 md:top-2 md:gap-2">
        {/* Mobile: 44px tap target around a 36px chip, dark frosted bg,
            outline heart that fills orange only when wishlisted. */}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          className="flex h-11 w-11 items-center justify-center md:hidden"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center border bg-background/80 text-ice-300 transition-colors ${
              wishlisted ? "border-fridge-orange text-fridge-orange" : "border-frost hover:border-fridge-orange hover:text-fridge-orange"
            }`}
          >
            <HeartIcon filled={wishlisted} />
          </span>
        </button>
        {/* Desktop: unchanged from before this pass. */}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          className={`hidden h-8 w-8 items-center justify-center border text-sm transition-colors md:flex ${
            wishlisted
              ? "border-fridge-orange bg-fridge-orange text-black"
              : "border-frost bg-background/60 text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
          }`}
        >
          ♥
        </button>
        {!outOfStock && (
          <>
            <button
              aria-label={`Quick add ${product.name} to cart`}
              onClick={handleQuickAdd}
              className="flex h-11 w-11 items-center justify-center md:hidden"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-frost bg-background/80 text-base text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange">
                +
              </span>
            </button>
            <button
              aria-label={`Quick add ${product.name} to cart`}
              onClick={handleQuickAdd}
              className="hidden h-8 w-8 items-center justify-center border border-frost bg-background/60 text-base text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange md:flex"
            >
              +
            </button>
          </>
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
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 md:hidden [background:linear-gradient(180deg,rgba(10,14,18,0.32)_0%,transparent_28%,transparent_68%,rgba(10,14,18,0.5)_100%)]"
          />
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
        <p className="line-clamp-2 text-sm font-bold tracking-wide transition-colors group-hover:text-fridge-orange md:line-clamp-none">
          {product.name}
        </p>
        <div className="mt-1 flex items-baseline gap-2 md:mt-0">
          <p className="text-sm text-fridge-orange">{formatCents(product.priceCents)}</p>
          {onSale && (
            <p className="text-xs text-muted line-through">
              {formatCents(product.compareAtCents!)}
            </p>
          )}
        </div>
      </Link>

      {sheetMounted && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            aria-label="Close size picker"
            onClick={() => setSizeSheetOpen(false)}
            className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
              sheetVisible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`glass absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-frost p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out ${
              sheetVisible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <span aria-hidden="true" className="mx-auto mb-4 block h-1 w-10 rounded-full bg-white/20" />
            <p className="text-sm font-bold tracking-wide">{product.name}</p>
            <p className="mt-1 text-xs text-muted">SELECT A SIZE</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizePick(size)}
                  className="flex h-12 items-center justify-center border border-frost text-sm font-semibold text-ice-100 transition-colors hover:border-fridge-orange hover:text-fridge-orange"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

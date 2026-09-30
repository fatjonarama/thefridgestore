"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import FridgeGlyph from "@/components/FridgeGlyph";
import { displayName } from "@/lib/displayName";
import type { PublicUser } from "@/lib/auth";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "MEN", href: "/shop?audience=men" },
  { label: "WOMEN", href: "/shop?audience=women" },
];

export default function Header({
  onSearchClick,
  onMenuClick,
  user,
}: {
  onSearchClick: () => void;
  onMenuClick: () => void;
  user: PublicUser | null;
}) {
  const { count, openCart } = useCart();
  const { slugs } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const prevCount = useRef(count);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 8);

      // Hide-on-scroll-down is a small-screen space-saving move — desktop
      // keeps the header pinned regardless of scroll direction.
      if (window.innerWidth < 768) {
        const goingDown = y > lastScrollY.current;
        setHidden(goingDown && y > 80);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > prevCount.current) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 500);
      prevCount.current = count;
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <header
      className={`glass sticky top-0 z-30 pt-[env(safe-area-inset-top)] transition-[background-color,transform] duration-300 ${
        scrolled ? "glass-scrolled" : ""
      } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-[6px] max-[374px]:gap-1 max-[374px]:px-2 sm:px-6 md:py-4">
        <Link href="/" className="flex shrink-0 items-center">
          <span className="whitespace-nowrap font-display text-lg tracking-wide sm:text-2xl">
            THE FR
            <span className="logo-glyph relative mx-[0.06em] inline-block h-[1.5em] w-[0.8em] -translate-y-[0.12em] align-middle text-fridge-orange">
              <FridgeGlyph />
            </span>
            DGE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1 after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:origin-left after:scale-x-0 after:bg-fridge-orange after:transition-transform after:duration-300 after:content-[''] hover:text-fridge-orange hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 max-[374px]:gap-0.5 sm:gap-3">
          <button
            aria-label="Open menu"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center text-ice-300 transition-colors hover:text-fridge-orange max-[374px]:h-10 max-[374px]:w-10 md:hidden"
          >
            <MenuIcon />
          </button>
          <button
            aria-label="Search"
            onClick={onSearchClick}
            className="flex h-11 w-11 items-center justify-center text-ice-300 transition-colors hover:text-fridge-orange max-[374px]:h-10 max-[374px]:w-10 md:h-9 md:w-9 md:border md:border-frost md:hover:border-fridge-orange"
          >
            <SearchIcon />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-11 w-11 items-center justify-center text-ice-300 transition-colors hover:text-fridge-orange max-[374px]:h-10 max-[374px]:w-10 md:h-9 md:w-9 md:border md:border-frost md:hover:border-fridge-orange"
          >
            <HeartIcon />
            {slugs.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-fridge-orange px-1 text-[10px] font-bold text-black md:-right-1.5 md:-top-1.5">
                {slugs.length}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-11 w-11 items-center justify-center text-ice-300 transition-colors hover:text-fridge-orange max-[374px]:h-10 max-[374px]:w-10 sm:hidden"
          >
            <UserIcon />
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="hidden text-xs font-bold tracking-wide text-muted transition-colors hover:text-fridge-orange sm:inline"
            >
              ADMIN
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="hidden h-9 items-center border border-frost px-3 text-xs font-bold tracking-wide text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange sm:flex"
            >
              {displayName(user)}
            </Link>
          ) : (
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-9 w-9 items-center justify-center border border-frost text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange sm:flex"
            >
              <UserIcon />
            </Link>
          )}
          <button
            data-cart-anchor
            aria-label={`Cart (${count})`}
            onClick={openCart}
            className={`relative flex h-11 w-11 items-center justify-center text-ice-300 transition-colors hover:text-fridge-orange max-[374px]:h-10 max-[374px]:w-10 md:hidden ${
              cartPulse ? "ice-crack" : ""
            }`}
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-fridge-orange px-1 text-[10px] font-bold text-black">
                {count}
              </span>
            )}
          </button>
          <button
            data-cart-anchor
            onClick={openCart}
            className={`btn-frost-primary hidden bg-fridge-orange px-3 py-2 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:px-4 md:inline-block ${
              cartPulse ? "ice-crack" : ""
            }`}
          >
            CART ({count})
          </button>
        </div>
      </div>
      <div className="divider-frost" aria-hidden="true" />
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="21" r="1.5" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21.5 7H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

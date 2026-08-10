"use client";

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

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center">
          <span className="whitespace-nowrap font-display text-lg tracking-wide sm:text-2xl">
            THE FR
            <span className="relative mx-[0.06em] inline-block h-[1.5em] w-[0.8em] -translate-y-[0.12em] align-middle text-fridge-orange">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            aria-label="Open menu"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange md:hidden"
          >
            <MenuIcon />
          </button>
          <button
            aria-label="Search"
            onClick={onSearchClick}
            className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange"
          >
            <SearchIcon />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange"
          >
            <HeartIcon />
            {slugs.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-fridge-orange px-1 text-[10px] font-bold text-black">
                {slugs.length}
              </span>
            )}
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="hidden text-xs font-bold tracking-wide text-white/40 transition-colors hover:text-fridge-orange sm:inline"
            >
              ADMIN
            </Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="hidden h-9 items-center border border-white/15 px-3 text-xs font-bold tracking-wide text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange sm:flex"
            >
              {displayName(user)}
            </Link>
          ) : (
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-9 w-9 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange sm:flex"
            >
              <UserIcon />
            </Link>
          )}
          <button
            onClick={openCart}
            className="bg-fridge-orange px-3 py-2 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:px-4"
          >
            CART ({count})
          </button>
        </div>
      </div>
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

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

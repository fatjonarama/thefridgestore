"use client";

import Link from "next/link";
import { usePresence } from "@/lib/usePresence";
import { displayName } from "@/lib/displayName";
import type { PublicUser } from "@/lib/auth";

export default function MobileNav({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: PublicUser | null;
}) {
  const { shouldRender, visible } = usePresence(open, 200);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative ml-auto flex h-full w-72 max-w-[85vw] flex-col border-l border-white/10 bg-background px-6 py-6 transition-transform duration-200 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="self-end text-3xl leading-none text-white/60 hover:text-fridge-orange"
        >
          ×
        </button>
        <nav className="mt-8 flex flex-col gap-6 text-lg font-semibold tracking-wide">
          <Link href="/shop?audience=men" onClick={onClose}>
            MEN
          </Link>
          <Link href="/shop?audience=women" onClick={onClose}>
            WOMEN
          </Link>
          <Link href="/wishlist" onClick={onClose}>
            WISHLIST
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" onClick={onClose} className="text-fridge-orange">
              ADMIN
            </Link>
          )}
          <Link href="/account" onClick={onClose}>
            {user ? displayName(user).toUpperCase() : "SIGN IN"}
          </Link>
        </nav>
      </div>
    </div>
  );
}

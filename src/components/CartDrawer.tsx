"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Placeholder from "@/components/Placeholder";
import { formatCents } from "@/lib/format";
import { usePresence } from "@/lib/usePresence";

export default function CartDrawer() {
  const { lines, isOpen, closeCart, removeLine, setQty, subtotalCents } = useCart();
  const { shouldRender, visible } = usePresence(isOpen, 300);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`glass relative flex h-full w-full max-w-md flex-col border-l transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-frost px-6 py-4">
          <h2 className="frost-text font-display text-xl tracking-wide">YOUR CART</h2>
          <button
            aria-label="Close cart"
            onClick={closeCart}
            className="text-ice-300 transition-colors hover:text-fridge-orange"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-4 pt-16 text-center">
              <span className="empty-flake text-4xl text-ice-300" aria-hidden="true">
                ❄
              </span>
              <div>
                <p className="font-display text-lg tracking-wide">YOUR FRIDGE IS EMPTY</p>
                <p className="mt-1 text-sm text-muted">
                  Nothing&apos;s chilling in here yet.
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="btn-frost-primary mt-2 inline-block bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95"
              >
                SHOP THE DROP
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {lines.map((line) => (
                <li key={`${line.slug}-${line.size}`} className="flex gap-4">
                  <Placeholder className="h-20 w-20 shrink-0" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-bold tracking-wide">{line.name}</p>
                      <button
                        onClick={() => removeLine(line.slug, line.size)}
                        className="text-xs text-muted transition-colors hover:text-fridge-orange"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-muted">Size {line.size}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-frost">
                        <button
                          className="px-2 py-1 text-ice-300 transition-colors hover:text-fridge-orange"
                          onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{line.qty}</span>
                        <button
                          className="px-2 py-1 text-ice-300 transition-colors hover:text-fridge-orange"
                          onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-fridge-orange">
                        {formatCents(line.priceCents * line.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-frost px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-bold">{formatCents(subtotalCents)}</span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            className={`btn-frost-primary mt-4 block w-full bg-fridge-orange py-3 text-center text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 ${
              lines.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            VIEW CART
          </Link>
        </div>
      </div>
    </div>
  );
}

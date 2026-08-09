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
        className={`relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-background transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-xl tracking-wide">YOUR CART</h2>
          <button
            aria-label="Close cart"
            onClick={closeCart}
            className="text-white/60 transition-colors hover:text-fridge-orange"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="mt-8 text-center text-sm text-white/50">
              Your cart is empty.
            </p>
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
                        className="text-xs text-white/40 transition-colors hover:text-fridge-orange"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs text-white/50">Size {line.size}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-white/15">
                        <button
                          className="px-2 py-1 text-white/70 transition-colors hover:text-fridge-orange"
                          onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{line.qty}</span>
                        <button
                          className="px-2 py-1 text-white/70 transition-colors hover:text-fridge-orange"
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

        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Subtotal</span>
            <span className="font-bold">{formatCents(subtotalCents)}</span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            className={`mt-4 block w-full bg-fridge-orange py-3 text-center text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 ${
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

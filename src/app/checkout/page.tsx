"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { lines, subtotal } = useCart();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">CHECKOUT</h1>

      {lines.length === 0 ? (
        <div className="mt-8">
          <p className="text-sm text-white/50">Your cart is empty.</p>
          <Link
            href="/shop/men"
            className="mt-6 inline-block bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
          >
            BROWSE PRODUCTS
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 flex flex-col gap-3 border-b border-white/10 pb-6">
            {lines.map((line) => (
              <li
                key={`${line.slug}-${line.size}`}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {line.name} · Size {line.size} × {line.qty}
                </span>
                <span className="text-fridge-orange">${line.price * line.qty}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>${subtotal}</span>
          </div>
          <p className="mt-8 border border-fridge-orange/50 bg-fridge-orange/10 px-4 py-3 text-sm text-fridge-orange">
            This is a demo store — payment isn&apos;t wired up yet.
          </p>
        </>
      )}
    </main>
  );
}

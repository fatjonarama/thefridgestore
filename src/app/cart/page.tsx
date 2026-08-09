"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Placeholder from "@/components/Placeholder";
import { useCart } from "@/context/CartContext";
import { formatCents } from "@/lib/format";
import { COUNTRIES, SHIPPING_CENTS, type Country } from "@/lib/shipping";
import { createOrder } from "@/db/mutations";

export default function CartPage() {
  const { lines, removeLine, setQty, subtotalCents, clearCart } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<Country | "">("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const shippingCents = country ? SHIPPING_CENTS[country] : null;
  const totalCents = subtotalCents + (shippingCents ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors: Record<string, string> = {};
    if (!customerName.trim()) nextErrors.customerName = "Name is required.";
    if (!phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!country) nextErrors.country = "Select a country.";
    if (!address.trim()) nextErrors.address = "Delivery address is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        country: country as Country,
        address: address.trim(),
        notes: notes.trim() || undefined,
        items: lines.map((line) => ({
          productId: line.productId,
          name: line.name,
          size: line.size,
          priceCents: line.priceCents,
          qty: line.qty,
        })),
      });
      clearCart();
      router.push(`/order/confirmed?phone=${encodeURIComponent(phone.trim())}`);
    } catch {
      setSubmitError("Something went wrong submitting your order. Please try again.");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-4xl tracking-wide">YOUR CART</h1>
        <p className="mt-4 text-sm text-white/50">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
        >
          BROWSE PRODUCTS
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">YOUR CART</h1>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <ul className="flex flex-col gap-6">
          {lines.map((line) => (
            <li key={`${line.slug}-${line.size}`} className="flex gap-4 border-b border-white/10 pb-6">
              <Placeholder className="h-24 w-24 shrink-0" />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <p className="font-bold tracking-wide">{line.name}</p>
                  <button
                    onClick={() => removeLine(line.slug, line.size)}
                    className="text-xs text-white/40 hover:text-fridge-orange"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-white/50">Size {line.size}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-white/15">
                    <button
                      className="px-3 py-1.5 text-white/70 hover:text-fridge-orange"
                      onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{line.qty}</span>
                    <button
                      className="px-3 py-1.5 text-white/70 hover:text-fridge-orange"
                      onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-fridge-orange">
                    {formatCents(line.priceCents * line.qty)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <div className="border border-white/10 p-6">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Subtotal</span>
                <span>{formatCents(subtotalCents)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Shipping</span>
                <span>{shippingCents === null ? "—" : formatCents(shippingCents)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 font-bold">
                <span>Total</span>
                <span>{formatCents(totalCents)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/40">
              No payment now — we&apos;ll follow up to confirm and arrange payment.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Field label="Full name" error={errors.customerName}>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
                />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
                  placeholder="For us to confirm your order"
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
                />
              </Field>
              <Field label="Country" error={errors.country}>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="border border-white/15 bg-background px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c} — shipping {formatCents(SHIPPING_CENTS[c])}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Delivery address" error={errors.address}>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
                />
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Preferred payment method, delivery time, etc."
                  className="border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
                />
              </Field>

              {submitError && (
                <p className="text-xs text-fridge-orange">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-fridge-orange py-3 text-sm font-bold tracking-wide text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "SUBMITTING…" : "SUBMIT ORDER REQUEST"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-white/70">{label}</span>
      {children}
      {error && <span className="text-xs text-fridge-orange">{error}</span>}
    </label>
  );
}

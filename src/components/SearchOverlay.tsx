"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { CATEGORY_LABELS } from "@/lib/products";

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const { products } = useProducts();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category].toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div className="relative mx-auto mt-24 w-full max-w-2xl px-6">
        <div className="border border-white/15 bg-background">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="text-white/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sneakers…"
              className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-white/30"
            />
            <button
              onClick={onClose}
              className="text-xs text-white/40 hover:text-fridge-orange"
            >
              ESC
            </button>
          </div>

          {query.trim() && (
            <ul className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-white/40">
                  No results for &ldquo;{query}&rdquo;
                </li>
              ) : (
                results.map((p) => (
                  <li key={p.slug} className="border-b border-white/5 last:border-0">
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/5"
                    >
                      <span>
                        <span className="text-sm font-bold tracking-wide">
                          {p.name}
                        </span>
                        <span className="ml-2 text-xs text-white/40">
                          {CATEGORY_LABELS[p.category]}
                        </span>
                      </span>
                      <span className="text-sm text-fridge-orange">${p.price}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

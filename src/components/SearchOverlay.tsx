"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/format";
import { AUDIENCE_LABELS } from "@/lib/audience";
import { usePresence } from "@/lib/usePresence";
import type { ProductRow } from "@/db/schema";

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { shouldRender, visible } = usePresence(open, 200);

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!q) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setResults(data.products);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close search"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative mx-auto mt-24 w-full max-w-2xl px-6 transition-all duration-200 ease-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
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

          {query.trim() && !loading && (
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
                          {AUDIENCE_LABELS[p.audience]}
                        </span>
                      </span>
                      <span className="text-sm text-fridge-orange">
                        {formatCents(p.priceCents)}
                      </span>
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

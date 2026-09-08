"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { AUDIENCES, AUDIENCE_LABELS, isAudience, type Audience } from "@/lib/audience";
import type { ProductRow } from "@/db/schema";

type SortOption = "newest" | "price-asc" | "price-desc";

function audienceFromParams(searchParams: URLSearchParams): Audience | "all" {
  const a = searchParams.get("audience");
  return a && isAudience(a) ? a : "all";
}

function isOnSale(p: ProductRow) {
  return p.compareAtCents !== null && p.compareAtCents > p.priceCents;
}

export default function ShopClient({ products }: { products: ProductRow[] }) {
  const searchParams = useSearchParams();
  const urlAudience = audienceFromParams(searchParams);
  const urlSaleOnly = searchParams.get("sale") === "true";

  const [audience, setAudience] = useState<Audience | "all">(urlAudience);
  const [syncedAudience, setSyncedAudience] = useState(urlAudience);
  const [saleOnly, setSaleOnly] = useState(urlSaleOnly);
  const [syncedSaleOnly, setSyncedSaleOnly] = useState(urlSaleOnly);
  const [sizes, setSizes] = useState<Set<string>>(new Set());
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  if (urlAudience !== syncedAudience) {
    setSyncedAudience(urlAudience);
    setAudience(urlAudience);
  }
  if (urlSaleOnly !== syncedSaleOnly) {
    setSyncedSaleOnly(urlSaleOnly);
    setSaleOnly(urlSaleOnly);
  }

  const audienceProducts = useMemo(
    () => (audience === "all" ? products : products.filter((p) => p.audience === audience)),
    [products, audience],
  );

  const availableSizes = useMemo(
    () =>
      Array.from(new Set(audienceProducts.flatMap((p) => p.sizes))).sort(
        (a, b) => Number(a) - Number(b),
      ),
    [audienceProducts],
  );

  const availableBrands = useMemo(
    () =>
      Array.from(new Set(audienceProducts.map((p) => p.brand).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [audienceProducts],
  );

  function toggleSize(value: string) {
    setSizes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function toggleBrand(value: string) {
    setBrands((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const min = minPrice ? Number(minPrice) * 100 : null;
    const max = maxPrice ? Number(maxPrice) * 100 : null;

    let result = audienceProducts.filter((p) => {
      if (saleOnly && !isOnSale(p)) return false;
      if (sizes.size > 0 && !p.sizes.some((s) => sizes.has(s))) return false;
      if (brands.size > 0 && !brands.has(p.brand)) return false;
      if (min !== null && p.priceCents < min) return false;
      if (max !== null && p.priceCents > max) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      if (sort === "price-desc") return b.priceCents - a.priceCents;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [audienceProducts, saleOnly, sizes, brands, minPrice, maxPrice, sort]);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">SHOP</h1>
      <p className="mt-2 text-sm text-white/50">
        {filtered.length} {filtered.length === 1 ? "style" : "styles"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-8">
          <FilterGroup title="Sale">
            <PillButton active={saleOnly} onClick={() => setSaleOnly((v) => !v)}>
              On sale only
            </PillButton>
          </FilterGroup>

          <FilterGroup title="Gender">
            <div className="flex flex-wrap gap-2">
              <PillButton active={audience === "all"} onClick={() => setAudience("all")}>
                All
              </PillButton>
              {AUDIENCES.map((a) => (
                <PillButton key={a} active={audience === a} onClick={() => setAudience(a)}>
                  {AUDIENCE_LABELS[a]}
                </PillButton>
              ))}
            </div>
          </FilterGroup>

          {availableBrands.length > 0 && (
            <FilterGroup title="Brand">
              <div className="flex flex-wrap gap-2">
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={`border px-3 py-1.5 text-xs ${
                      brands.has(b)
                        ? "border-fridge-orange bg-fridge-orange text-black"
                        : "border-white/15 text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          {availableSizes.length > 0 && (
            <FilterGroup title="Size (EU)">
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`border px-3 py-1.5 text-xs ${
                      sizes.has(size)
                        ? "border-fridge-orange bg-fridge-orange text-black"
                        : "border-white/15 text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup title="Price (EUR)">
            <div className="flex items-center gap-2">
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                inputMode="decimal"
                className="w-full border border-white/15 bg-transparent px-2 py-2 text-sm outline-none focus:border-fridge-orange"
              />
              <span className="text-white/30">–</span>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                inputMode="decimal"
                className="w-full border border-white/15 bg-transparent px-2 py-2 text-sm outline-none focus:border-fridge-orange"
              />
            </div>
          </FilterGroup>
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-white/15 bg-background px-3 py-2 text-sm outline-none focus:border-fridge-orange"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-white/40">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">{title}</p>
      {children}
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs font-bold tracking-wide ${
        active
          ? "border-fridge-orange bg-fridge-orange text-black"
          : "border-white/15 text-white/70 hover:border-fridge-orange hover:text-fridge-orange"
      }`}
    >
      {children}
    </button>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { usePresence } from "@/lib/usePresence";
import { AUDIENCES, AUDIENCE_LABELS, isAudience, matchesAudience, type Audience } from "@/lib/audience";
import type { ProductRow } from "@/db/schema";

type SortOption = "newest" | "price-asc" | "price-desc";

const SWIPE_CLOSE_PX = 80;

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
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { shouldRender: sheetMounted, visible: sheetVisible } = usePresence(filterSheetOpen, 300);
  const dragStartY = useRef<number | null>(null);
  const dragDeltaY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (urlAudience !== syncedAudience) {
    setSyncedAudience(urlAudience);
    setAudience(urlAudience);
  }
  if (urlSaleOnly !== syncedSaleOnly) {
    setSyncedSaleOnly(urlSaleOnly);
    setSaleOnly(urlSaleOnly);
  }

  const audienceProducts = useMemo(
    () => (audience === "all" ? products : products.filter((p) => matchesAudience(p.audience, audience))),
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

  const activeFilterCount =
    (saleOnly ? 1 : 0) +
    (audience !== "all" ? 1 : 0) +
    sizes.size +
    brands.size +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  function handleSheetTouchStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
    dragDeltaY.current = 0;
  }

  function handleSheetTouchMove(e: React.TouchEvent) {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    dragDeltaY.current = delta;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }

  function handleSheetTouchEnd() {
    dragStartY.current = null;
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (dragDeltaY.current > SWIPE_CLOSE_PX) setFilterSheetOpen(false);
    dragDeltaY.current = 0;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">SHOP</h1>
      <p className="mt-2 text-sm text-white/50">
        {filtered.length} {filtered.length === 1 ? "style" : "styles"}
      </p>

      <div className="sticky top-14 z-20 -mx-6 mt-4 flex items-center gap-2 border-y border-frost bg-background/95 px-6 py-3 md:hidden">
        <button
          onClick={() => setFilterSheetOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 border border-frost px-4 py-2.5 text-sm font-bold tracking-wide text-ice-100"
        >
          FILTER{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border border-frost bg-background px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden flex-col gap-8 md:flex">
          <FilterPanelContent
            saleOnly={saleOnly}
            setSaleOnly={setSaleOnly}
            audience={audience}
            setAudience={setAudience}
            availableBrands={availableBrands}
            brands={brands}
            toggleBrand={toggleBrand}
            availableSizes={availableSizes}
            sizes={sizes}
            toggleSize={toggleSize}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </aside>

        <div>
          <div className="mb-6 hidden justify-end md:flex">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-frost bg-background px-3 py-2 text-sm outline-none focus:border-fridge-orange"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-6 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {sheetMounted && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setFilterSheetOpen(false)}
            className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
              sheetVisible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={sheetRef}
            className={`glass absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-2xl border-t border-frost transition-transform duration-300 ease-out ${
              sheetVisible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
              className="shrink-0 px-5 pt-4"
            >
              <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-white/20" />
              <div className="mt-3 flex items-center justify-between">
                <p className="font-display text-lg tracking-wide">FILTERS</p>
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  aria-label="Close filters"
                  className="text-ice-300 transition-colors hover:text-fridge-orange"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-8">
                <FilterPanelContent
                  saleOnly={saleOnly}
                  setSaleOnly={setSaleOnly}
                  audience={audience}
                  setAudience={setAudience}
                  availableBrands={availableBrands}
                  brands={brands}
                  toggleBrand={toggleBrand}
                  availableSizes={availableSizes}
                  sizes={sizes}
                  toggleSize={toggleSize}
                  minPrice={minPrice}
                  setMinPrice={setMinPrice}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-frost p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="btn-frost-primary block w-full bg-fridge-orange py-3.5 text-center text-sm font-bold tracking-wide text-black transition-transform duration-200 active:scale-95"
              >
                SHOW {filtered.length} {filtered.length === 1 ? "RESULT" : "RESULTS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterPanelContent({
  saleOnly,
  setSaleOnly,
  audience,
  setAudience,
  availableBrands,
  brands,
  toggleBrand,
  availableSizes,
  sizes,
  toggleSize,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: {
  saleOnly: boolean;
  setSaleOnly: (updater: (v: boolean) => boolean) => void;
  audience: Audience | "all";
  setAudience: (value: Audience | "all") => void;
  availableBrands: string[];
  brands: Set<string>;
  toggleBrand: (value: string) => void;
  availableSizes: string[];
  sizes: Set<string>;
  toggleSize: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
}) {
  return (
    <>
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
                    : "border-frost text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
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
                    : "border-frost text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
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
            className="w-full border border-frost bg-transparent px-2 py-2 text-sm outline-none focus:border-fridge-orange"
          />
          <span className="text-muted">–</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            inputMode="decimal"
            className="w-full border border-frost bg-transparent px-2 py-2 text-sm outline-none focus:border-fridge-orange"
          />
        </div>
      </FilterGroup>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">{title}</p>
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
          : "border-frost text-ice-300 hover:border-fridge-orange hover:text-fridge-orange"
      }`}
    >
      {children}
    </button>
  );
}

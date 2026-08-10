"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import { adminFetch } from "@/lib/adminFetch";
import { AUDIENCE_LABELS, type Audience } from "@/lib/audience";
import { BRANDS } from "@/lib/brands";
import { formatCents } from "@/lib/format";
import type { ProductInput } from "@/db/adminMutations";
import type { ProductRow } from "@/db/schema";

const LOW_STOCK_THRESHOLD = 5;

type SortKey = "price" | "stock" | null;

export default function ProductsTable({ initial }: { initial: ProductRow[] }) {
  const toast = useToast();
  const [products, setProducts] = useState(initial);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<Audience | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingBrandId, setSavingBrandId] = useState<number | null>(null);

  const audiences = useMemo(
    () => Array.from(new Set(products.map((p) => p.audience))) as Audience[],
    [products],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = products.filter((p) => {
      if (audienceFilter !== "all" && p.audience !== audienceFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    });

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = sortKey === "price" ? a.priceCents : a.stock;
        const bv = sortKey === "price" ? b.priceCents : b.stock;
        return sortDir === "asc" ? av - bv : bv - av;
      });
    }

    return result;
  }, [products, search, audienceFilter, sortKey, sortDir]);

  function toggleSort(key: Exclude<SortKey, null>) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleBrandChange(product: ProductRow, brand: string) {
    setSavingBrandId(product.id);
    const values: ProductInput = {
      slug: product.slug,
      name: product.name,
      brand,
      audience: product.audience,
      priceCents: product.priceCents,
      compareAtCents: product.compareAtCents,
      description: product.description,
      images: product.images,
      colors: product.colors,
      sizes: product.sizes,
      stock: product.stock,
      isNew: product.isNew,
      active: product.active,
    };
    try {
      const { product: updated } = await adminFetch<{ product: ProductRow }>(
        `/api/admin/products/${product.id}`,
        { method: "PATCH", body: JSON.stringify(values) },
      );
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      toast.success(`Brand set for "${product.name}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update brand.");
    } finally {
      setSavingBrandId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await adminFetch(`/api/admin/products/${pendingDelete.id}`, { method: "DELETE" });
      setProducts((prev) =>
        prev.map((p) => (p.id === pendingDelete.id ? { ...p, active: false } : p)),
      );
      toast.success(`"${pendingDelete.name}" removed from the storefront.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl tracking-wide">PRODUCTS</h2>
        <Link
          href="/admin/products/new"
          className="bg-fridge-orange px-5 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
        >
          + ADD PRODUCT
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, brand, slug…"
          className="min-w-[240px] flex-1 border border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
        />
        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value as Audience | "all")}
          className="border border-white/15 bg-background px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
        >
          <option value="all">All audiences</option>
          {audiences.map((a) => (
            <option key={a} value={a}>
              {AUDIENCE_LABELS[a]}
            </option>
          ))}
        </select>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No products yet.</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No products match your search/filter.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Brand</th>
                <th className="px-4 py-3 font-normal">Audience</th>
                <SortableHeader
                  label="Price"
                  active={sortKey === "price"}
                  dir={sortDir}
                  onClick={() => toggleSort("price")}
                />
                <SortableHeader
                  label="Stock"
                  active={sortKey === "stock"}
                  dir={sortDir}
                  onClick={() => toggleSort("stock")}
                />
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const lowStock = product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD;
                return (
                  <tr key={product.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt=""
                            className="h-10 w-10 shrink-0 border border-white/10 object-cover"
                          />
                        ) : (
                          <Placeholder className="h-10 w-10 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold">{product.name}</p>
                          <p className="text-xs text-white/40">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={product.brand}
                        onChange={(e) => handleBrandChange(product, e.target.value)}
                        disabled={savingBrandId === product.id}
                        className="border border-white/15 bg-background px-2 py-1.5 text-xs outline-none focus:border-fridge-orange disabled:opacity-50"
                      >
                        <option value="">— No brand —</option>
                        {BRANDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {AUDIENCE_LABELS[product.audience]}
                    </td>
                    <td className="px-4 py-3 text-fridge-orange">
                      {formatCents(product.priceCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock <= 0 ? "text-red-400" : "text-white/70"}>
                        {product.stock}
                      </span>
                      {lowStock && (
                        <span className="ml-2 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                          LOW STOCK
                        </span>
                      )}
                      {product.stock <= 0 && (
                        <span className="ml-2 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                          OUT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        {product.isNew && (
                          <span className="w-fit bg-fridge-orange px-2 py-0.5 font-bold text-black">
                            NEW DROP
                          </span>
                        )}
                        <span
                          className={`w-fit px-2 py-0.5 ${
                            product.active
                              ? "border border-white/20 text-white/60"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {product.active ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-4 text-xs font-bold tracking-wide">
                        <Link
                          href={`/admin/products/${product.slug}/edit`}
                          className="text-white/70 hover:text-fridge-orange"
                        >
                          EDIT
                        </Link>
                        <button
                          onClick={() => setPendingDelete(product)}
                          disabled={deletingId === product.id}
                          className="text-white/70 hover:text-red-400 disabled:opacity-50"
                        >
                          {deletingId === product.id ? "…" : "DELETE"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Delete "${pendingDelete.name}"?` : ""}
        description="This hides it from the storefront immediately. It's soft-deleted, not erased — past orders referencing it are unaffected, and you can restore it any time by editing it."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 font-normal">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 uppercase tracking-wide ${
          active ? "text-fridge-orange" : "text-white/40 hover:text-white/70"
        }`}
      >
        {label}
        <span className="text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
}

"use client";

import { useMemo, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import { adminFetch } from "@/lib/adminFetch";
import { formatCents } from "@/lib/format";
import { formatDateTime } from "@/lib/formatDate";
import type { OrderStatus } from "@/db/schema";
import type { OrderWithItems } from "@/db/queries";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "fulfilled", "cancelled"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-fridge-orange text-fridge-orange",
  confirmed: "border-white/40 text-white",
  fulfilled: "border-white/20 text-white/50",
  cancelled: "border-red-500/40 text-red-400",
};

type DateSort = "newest" | "oldest";

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function OrdersTable({ initial }: { initial: OrderWithItems[] }) {
  const toast = useToast();
  const [orders, setOrders] = useState(initial);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pendingCancel, setPendingCancel] = useState<OrderWithItems | null>(null);

  const stats = useMemo(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const todayCount = orders.filter((o) => isToday(new Date(o.createdAt))).length;
    const revenueCents = orders
      .filter((o) => o.status === "confirmed" || o.status === "fulfilled")
      .reduce((sum, o) => sum + o.totalCents, 0);
    return { pendingCount, todayCount, revenueCents };
  }, [orders]);

  const visible = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    result = [...result].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dateSort === "newest" ? -diff : diff;
    });
    return result;
  }, [orders, statusFilter, dateSort]);

  async function applyStatus(order: OrderWithItems, status: OrderStatus) {
    setUpdatingId(order.id);
    try {
      await adminFetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      toast.success(`Order #${order.id} marked ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleConfirmCancel() {
    if (!pendingCancel) return;
    const order = pendingCancel;
    setPendingCancel(null);
    await applyStatus(order, "cancelled");
  }

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide">ORDERS</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Pending orders" value={String(stats.pendingCount)} />
        <StatTile label="Orders today" value={String(stats.todayCount)} />
        <StatTile
          label="Revenue (confirmed + fulfilled)"
          value={formatCents(stats.revenueCents)}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="border border-white/15 bg-background px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value as DateSort)}
          className="border border-white/15 bg-background px-3 py-2.5 text-sm outline-none focus:border-fridge-orange"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No orders yet.</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No orders match this filter.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {visible.map((order) => {
            const expanded = expandedId === order.id;
            const updating = updatingId === order.id;
            return (
              <div key={order.id} className="border border-white/10">
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <span className="text-xs text-white/40">#{order.id}</span>
                    <span className="font-bold tracking-wide">{order.customerName}</span>
                    <span className="text-sm text-white/50">{order.phone}</span>
                    <span className="text-xs text-white/30">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-fridge-orange">
                      {formatCents(order.totalCents)}
                    </span>
                    <span
                      className={`border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[order.status]}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-white/40">{expanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expanded && (
                  <div
                    className="border-t border-white/10 px-5 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-6">
                      <div className="max-w-md text-sm text-white/60">
                        {order.email && <p>{order.email}</p>}
                        <p className="mt-1">
                          {order.address}, {order.country}
                        </p>
                        {order.notes && (
                          <p className="mt-2 text-xs text-white/40">Notes: {order.notes}</p>
                        )}
                        <p className="mt-2 text-xs text-white/40">
                          Shipping: {formatCents(order.shippingCents)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <label className="flex items-center gap-2 text-xs text-white/50">
                          Status
                          <select
                            value={order.status}
                            disabled={updating}
                            onChange={(e) => {
                              const next = e.target.value as OrderStatus;
                              if (next === "cancelled") {
                                setPendingCancel(order);
                                return;
                              }
                              applyStatus(order, next);
                            }}
                            className={`border bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide outline-none disabled:opacity-50 ${STATUS_STYLES[order.status]}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                        {order.status !== "cancelled" && (
                          <button
                            onClick={() => setPendingCancel(order)}
                            disabled={updating}
                            className="text-xs font-bold tracking-wide text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            CANCEL ORDER
                          </button>
                        )}
                      </div>
                    </div>

                    <ul className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-white/70">
                          <span>
                            {item.name} · Size {item.size} × {item.qty}
                          </span>
                          <span>{formatCents(item.priceCents * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingCancel !== null}
        title={pendingCancel ? `Cancel order #${pendingCancel.id}?` : ""}
        description="This marks the order cancelled and releases its items back into stock. The customer won't be notified automatically — let them know separately if needed."
        confirmLabel="Cancel order"
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 p-5">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatus } from "@/db/mutations";

const STATUSES = ["pending", "confirmed", "fulfilled", "cancelled"] as const;

const STATUS_STYLES: Record<(typeof STATUSES)[number], string> = {
  pending: "border-fridge-orange text-fridge-orange",
  confirmed: "border-white/40 text-white",
  fulfilled: "border-white/20 text-white/50",
  cancelled: "border-white/20 text-white/30",
};

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: (typeof STATUSES)[number];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [updating, setUpdating] = useState(false);

  return (
    <select
      value={current}
      disabled={updating}
      onChange={async (e) => {
        const next = e.target.value as (typeof STATUSES)[number];
        setCurrent(next);
        setUpdating(true);
        await updateOrderStatus(orderId, next);
        router.refresh();
        setUpdating(false);
      }}
      className={`border bg-background px-3 py-1.5 text-xs font-bold uppercase tracking-wide outline-none ${STATUS_STYLES[current]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

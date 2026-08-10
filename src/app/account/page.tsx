import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/db/queries";
import { formatCents } from "@/lib/format";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "border-fridge-orange text-fridge-orange",
  confirmed: "border-white/40 text-white",
  fulfilled: "border-white/20 text-white/50",
  cancelled: "border-white/20 text-white/30",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const orders = await getOrdersForUser(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide">ACCOUNT</h1>
          <p className="mt-2 text-sm text-white/50">
            {user.name ? `${user.name} · ` : ""}
            {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-12 border-t border-white/10 pt-8">
        <h2 className="font-display text-xl tracking-wide">ORDER HISTORY</h2>

        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">No orders yet.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 font-display text-lg text-fridge-orange">
                      {formatCents(order.totalCents)}
                    </p>
                  </div>
                  <span
                    className={`border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                      STATUS_STYLES[order.status] ?? "border-white/20 text-white/50"
                    }`}
                  >
                    {order.status}
                  </span>
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

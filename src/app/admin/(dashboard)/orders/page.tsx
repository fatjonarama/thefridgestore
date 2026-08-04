import { getAllOrdersWithItems } from "@/db/queries";
import { formatCents } from "@/lib/format";
import OrderStatusSelect from "./OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersWithItems();

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide">ORDERS</h2>
      <p className="mt-2 text-sm text-white/50">
        {orders.length} {orders.length === 1 ? "order" : "orders"} total.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-white/40">No orders yet.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-white/10 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold tracking-wide">{order.customerName}</p>
                  <p className="mt-1 text-sm text-white/60">{order.phone}</p>
                  {order.email && <p className="text-sm text-white/60">{order.email}</p>}
                  <p className="mt-2 max-w-md text-sm text-white/50">{order.address}</p>
                  {order.notes && (
                    <p className="mt-2 max-w-md text-xs text-white/40">
                      Notes: {order.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-display text-xl text-fridge-orange">
                    {formatCents(order.totalCents)}
                  </span>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                  <span className="text-xs text-white/30">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
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
          ))}
        </div>
      )}
    </div>
  );
}

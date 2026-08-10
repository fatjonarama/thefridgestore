import { getAllOrdersWithItems } from "@/db/queries";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersWithItems();
  return <OrdersTable initial={orders} />;
}

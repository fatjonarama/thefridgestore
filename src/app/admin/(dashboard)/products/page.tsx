import { getAllProductsAdmin } from "@/db/queries";
import ProductsTable from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();
  return <ProductsTable initial={products} />;
}

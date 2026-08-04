import ShopClient from "@/components/ShopClient";
import { getActiveProducts } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getActiveProducts();
  return <ShopClient products={products} />;
}

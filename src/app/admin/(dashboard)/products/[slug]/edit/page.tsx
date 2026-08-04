import Link from "next/link";
import { getProductBySlugAdmin } from "@/db/queries";
import EditProductClient from "./EditProductClient";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugAdmin(slug);

  if (!product) {
    return (
      <div>
        <p className="text-sm text-white/50">Product not found.</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-fridge-orange hover:underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return <EditProductClient product={product} />;
}

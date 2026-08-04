import { NextResponse } from "next/server";
import { searchProducts } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ products: [] });
  }

  const products = await searchProducts(q);
  return NextResponse.json({ products });
}

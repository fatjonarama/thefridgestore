import { inArray, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get("slugs");

  if (!slugsParam) {
    return NextResponse.json({ products: [] });
  }

  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(inArray(products.slug, slugs), eq(products.active, true)));

  return NextResponse.json({ products: rows });
}

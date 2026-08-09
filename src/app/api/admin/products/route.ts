import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { validateProductInput } from "@/lib/validateProductInput";
import { getAllProductsAdmin } from "@/db/queries";
import { createProduct } from "@/db/adminMutations";

export async function GET() {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await getAllProductsAdmin();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateProductInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const product = await createProduct(result.input);
  return NextResponse.json({ product }, { status: 201 });
}

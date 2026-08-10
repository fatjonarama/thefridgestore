import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/adminAuth";
import { updateOrderStatusAdmin } from "@/db/adminMutations";
import { orderStatusEnum, type OrderStatus } from "@/db/schema";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const VALID_STATUSES = new Set<string>(orderStatusEnum.enumValues);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequestAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) return NextResponse.json({ error: "Invalid order id." }, { status: 400 });

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  const order = await updateOrderStatusAdmin(id, status as OrderStatus);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order });
}

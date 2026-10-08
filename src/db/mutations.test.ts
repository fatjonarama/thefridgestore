import { beforeEach, describe, expect, it, vi } from "vitest";
import { orderItems, orders, type ProductRow } from "@/db/schema";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
}));

let mockProductRows: ProductRow[] = [];
let insertedOrderItems: unknown[] = [];

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(mockProductRows),
      }),
    }),
    insert: (table: unknown) => ({
      values: (vals: unknown) => {
        if (table === orders) {
          return { returning: () => Promise.resolve([{ id: 101 }]) };
        }
        if (table === orderItems) {
          insertedOrderItems = Array.isArray(vals) ? vals : [vals];
          return Promise.resolve(undefined);
        }
        return Promise.resolve(undefined);
      },
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(undefined),
      }),
    }),
  },
}));

function product(overrides: Partial<ProductRow>): ProductRow {
  return {
    id: 1,
    slug: "mock-1",
    name: "Mock Runner",
    brand: "The Fridge",
    audience: "men",
    priceCents: 12000,
    compareAtCents: null,
    description: "",
    images: [],
    colors: [],
    sizes: ["42"],
    stock: 5,
    isNew: false,
    active: true,
    createdAt: new Date(),
    ...overrides,
  } as ProductRow;
}

const baseInput = {
  customerName: "Jane Doe",
  phone: "044000000",
  country: "Kosovo" as const,
  address: "Street 1",
};

describe("createOrder", () => {
  beforeEach(() => {
    mockProductRows = [];
    insertedOrderItems = [];
    vi.clearAllMocks();
  });

  it("rejects an empty cart", async () => {
    const { createOrder } = await import("./mutations");
    const result = await createOrder({ ...baseInput, items: [] });
    expect(result.ok).toBe(false);
  });

  it("rejects an item whose product id doesn't exist (tampered cart)", async () => {
    mockProductRows = [];
    const { createOrder } = await import("./mutations");
    const result = await createOrder({
      ...baseInput,
      items: [{ productId: 999, name: "Fake Shoe", size: "42", priceCents: 1, qty: 1 }],
    });
    expect(result.ok).toBe(false);
  });

  it("ignores a client-supplied price and uses the real product price instead", async () => {
    mockProductRows = [product({ id: 1, priceCents: 12000, stock: 5 })];
    const { createOrder } = await import("./mutations");
    const result = await createOrder({
      ...baseInput,
      // Client claims this shoe costs 1 cent -- must not be trusted.
      items: [{ productId: 1, name: "Mock Runner", size: "42", priceCents: 1, qty: 1 }],
    });
    expect(result.ok).toBe(true);
    expect(insertedOrderItems).toHaveLength(1);
    expect((insertedOrderItems[0] as { priceCents: number }).priceCents).toBe(12000);
  });

  it("rejects an inactive (delisted) product", async () => {
    mockProductRows = [product({ id: 1, active: false })];
    const { createOrder } = await import("./mutations");
    const result = await createOrder({
      ...baseInput,
      items: [{ productId: 1, name: "Mock Runner", size: "42", priceCents: 12000, qty: 1 }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a quantity that exceeds stock", async () => {
    mockProductRows = [product({ id: 1, stock: 2 })];
    const { createOrder } = await import("./mutations");
    const result = await createOrder({
      ...baseInput,
      items: [{ productId: 1, name: "Mock Runner", size: "42", priceCents: 12000, qty: 3 }],
    });
    expect(result.ok).toBe(false);
  });

  it("combines quantities for the same product across sizes before checking stock", async () => {
    // Same shoe, two sizes, 3 + 3 = 6 requested against only 5 in stock.
    mockProductRows = [product({ id: 1, stock: 5 })];
    const { createOrder } = await import("./mutations");
    const result = await createOrder({
      ...baseInput,
      items: [
        { productId: 1, name: "Mock Runner", size: "41", priceCents: 12000, qty: 3 },
        { productId: 1, name: "Mock Runner", size: "42", priceCents: 12000, qty: 3 },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it("succeeds with a valid, in-stock order and returns an order id", async () => {
    mockProductRows = [product({ id: 1, priceCents: 12000, stock: 5 })];
    const { createOrder } = await import("./mutations");
    const result = await createOrder({
      ...baseInput,
      items: [{ productId: 1, name: "Mock Runner", size: "42", priceCents: 12000, qty: 2 }],
    });
    expect(result).toEqual({ ok: true, orderId: 101 });
  });
});

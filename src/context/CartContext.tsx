"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { createLocalStore } from "@/lib/localStore";

export type CartProduct = {
  id: number;
  slug: string;
  name: string;
  priceCents: number;
};

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  size: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: CartProduct, size: string, qty?: number) => void;
  removeLine: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const cartStore = createLocalStore<CartLine[]>("fridge-cart", []);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((product: CartProduct, size: string, qty = 1) => {
    cartStore.setValue((prev) => {
      const existing = prev.find(
        (l) => l.slug === product.slug && l.size === size,
      );
      if (existing) {
        return prev.map((l) =>
          l.slug === product.slug && l.size === size
            ? { ...l, qty: l.qty + qty }
            : l,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          size,
          qty,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeLine = useCallback((slug: string, size: string) => {
    cartStore.setValue((prev) =>
      prev.filter((l) => !(l.slug === slug && l.size === size)),
    );
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    cartStore.setValue((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.size === size))
        : prev.map((l) =>
            l.slug === slug && l.size === size ? { ...l, qty } : l,
          ),
    );
  }, []);

  const clearCart = useCallback(() => {
    cartStore.setValue([]);
  }, []);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotalCents = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.priceCents, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart,
      removeLine,
      setQty,
      clearCart,
      count,
      subtotalCents,
    }),
    [lines, isOpen, addToCart, removeLine, setQty, clearCart, count, subtotalCents],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

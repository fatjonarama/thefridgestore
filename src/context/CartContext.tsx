"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Product } from "@/lib/products";
import { createLocalStore } from "@/lib/localStore";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  size: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string, qty?: number) => void;
  removeLine: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  count: number;
  subtotal: number;
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

  const addToCart = useCallback((product: Product, size: string, qty = 1) => {
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
        { slug: product.slug, name: product.name, price: product.price, size, qty },
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

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.price, 0),
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
      count,
      subtotal,
    }),
    [lines, isOpen, addToCart, removeLine, setQty, count, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

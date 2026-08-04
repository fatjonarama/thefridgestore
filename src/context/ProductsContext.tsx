"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createLocalStore } from "@/lib/localStore";
import { SEED_PRODUCTS, uniqueSlug, type Product } from "@/lib/products";

type ProductsContextValue = {
  products: Product[];
  addProduct: (input: Omit<Product, "slug">) => Product;
  updateProduct: (slug: string, input: Omit<Product, "slug">) => Product;
  deleteProduct: (slug: string) => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);
const productsStore = createLocalStore<Product[]>("fridge-products", SEED_PRODUCTS);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const products = useSyncExternalStore(
    productsStore.subscribe,
    productsStore.getSnapshot,
    productsStore.getServerSnapshot,
  );

  const addProduct = useCallback((input: Omit<Product, "slug">) => {
    let created!: Product;
    productsStore.setValue((prev) => {
      const slug = uniqueSlug(prev, input.name);
      created = { ...input, slug };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateProduct = useCallback((slug: string, input: Omit<Product, "slug">) => {
    let updated!: Product;
    productsStore.setValue((prev) => {
      const newSlug = uniqueSlug(prev, input.name, slug);
      updated = { ...input, slug: newSlug };
      return prev.map((p) => (p.slug === slug ? updated : p));
    });
    return updated;
  }, []);

  const deleteProduct = useCallback((slug: string) => {
    productsStore.setValue((prev) => prev.filter((p) => p.slug !== slug));
  }, []);

  const value = useMemo(
    () => ({ products, addProduct, updateProduct, deleteProduct }),
    [products, addProduct, updateProduct, deleteProduct],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}

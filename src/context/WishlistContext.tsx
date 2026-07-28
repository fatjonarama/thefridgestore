"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createLocalStore } from "@/lib/localStore";

type WishlistContextValue = {
  slugs: string[];
  isWishlisted: (slug: string) => boolean;
  toggleWishlist: (slug: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const wishlistStore = createLocalStore<string[]>("fridge-wishlist", []);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const slugs = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot,
  );

  const toggleWishlist = useCallback((slug: string) => {
    wishlistStore.setValue((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  const isWishlisted = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs],
  );

  const value = useMemo(
    () => ({ slugs, isWishlisted, toggleWishlist }),
    [slugs, isWishlisted, toggleWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

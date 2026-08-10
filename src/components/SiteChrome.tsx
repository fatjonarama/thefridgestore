"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import type { PublicUser } from "@/lib/auth";

export default function SiteChrome({ user }: { user: PublicUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Header onSearchClick={() => setSearchOpen(true)} user={user} />
      <CartDrawer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

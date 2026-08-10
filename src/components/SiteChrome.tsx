"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import MobileNav from "@/components/MobileNav";
import SearchOverlay from "@/components/SearchOverlay";
import TickerBar from "@/components/TickerBar";
import type { PublicUser } from "@/lib/auth";

export default function SiteChrome({ user }: { user: PublicUser | null }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <TickerBar />
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onMenuClick={() => setMenuOpen(true)}
        user={user}
      />
      <CartDrawer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
    </>
  );
}

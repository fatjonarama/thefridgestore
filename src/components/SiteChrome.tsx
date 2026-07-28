"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";

export default function SiteChrome() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Header onSearchClick={() => setSearchOpen(true)} />
      <CartDrawer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

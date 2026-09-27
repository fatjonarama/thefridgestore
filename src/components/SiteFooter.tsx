"use client";

import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer>
      <div className="divider-frost" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-muted">
        © {new Date().getFullYear()} The Fridge. All rights reserved.
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-white/40">
        <span>© {new Date().getFullYear()} The Fridge. All rights reserved.</span>
        <Link href="/admin" className="hover:text-fridge-orange">
          Admin
        </Link>
      </div>
    </footer>
  );
}

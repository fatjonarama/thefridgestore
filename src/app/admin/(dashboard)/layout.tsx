"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/admin/login/actions";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="flex-1">
      <div className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="bg-fridge-orange px-2 py-1 text-xs font-bold tracking-wide text-black">
              ADMIN
            </span>
            <h1 className="font-display text-xl tracking-wide">CONTROL PANEL</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <Link href="/" className="hover:text-fridge-orange">
              ← Back to store
            </Link>
            <button
              onClick={async () => {
                await logoutAdmin();
                router.push("/admin/login");
                router.refresh();
              }}
              className="hover:text-fridge-orange"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-7xl gap-6 px-6 text-sm font-semibold tracking-wide">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 py-3 ${
                  active
                    ? "border-fridge-orange text-fridge-orange"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mx-auto w-full max-w-7xl px-6 py-10">{children}</div>
    </main>
  );
}

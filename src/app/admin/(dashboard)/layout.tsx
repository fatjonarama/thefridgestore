"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/context/ToastContext";

const NAV = [
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <ToastProvider>
      <main className="flex min-h-screen flex-1 flex-col md:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] md:flex">
          <Link href="/" className="block border-b border-white/10 px-5 py-5">
            <p className="font-display text-lg tracking-wide">THE FRIDGE</p>
            <p className="text-[11px] uppercase tracking-wide text-white/40">Admin</p>
          </Link>
          <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm font-semibold">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 transition-colors ${
                    active
                      ? "bg-fridge-orange text-black"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-col gap-1 border-t border-white/10 px-3 py-4 text-sm">
            <Link href="/" className="px-3 py-2 text-white/50 hover:text-white">
              ← Back to store
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-left text-white/50 hover:text-white"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Top bar + tabs (mobile) */}
        <div className="border-b border-white/10 bg-[#0d0d0d] md:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/">
              <p className="font-display text-base tracking-wide">THE FRIDGE</p>
              <p className="text-[10px] uppercase tracking-wide text-white/40">Admin</p>
            </Link>
            <button onClick={handleLogout} className="text-xs text-white/50 hover:text-white">
              Log out
            </button>
          </div>
          <nav className="flex gap-6 overflow-x-auto px-4 text-sm font-semibold">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap border-b-2 py-3 ${
                    active
                      ? "border-fridge-orange text-fridge-orange"
                      : "border-transparent text-white/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 px-6 py-8 md:px-10">{children}</div>
      </main>
    </ToastProvider>
  );
}

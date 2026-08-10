"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="border border-white/15 px-4 py-2 text-xs font-bold tracking-wide text-white/70 transition-colors hover:border-fridge-orange hover:text-fridge-orange disabled:opacity-50"
    >
      {loading ? "…" : "LOG OUT"}
    </button>
  );
}

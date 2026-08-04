"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdmin } from "./actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await loginAdmin(password);
    if (result.success) {
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } else {
      setError(result.error ?? "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <span className="mx-auto flex h-10 w-10 items-center justify-center bg-fridge-orange text-lg font-display text-black">
        F
      </span>
      <h1 className="mt-6 text-center font-display text-3xl tracking-wide">
        ADMIN ACCESS
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
        />
        {error && <p className="text-xs text-fridge-orange">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-fridge-orange py-3 text-sm font-bold tracking-wide text-black hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "CHECKING…" : "ENTER"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

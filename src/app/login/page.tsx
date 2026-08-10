"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Mode = "signin" | "signup";

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "signin") {
        await postJson("/api/auth/login", { email, password });
      } else {
        await postJson("/api/auth/signup", { email, password, name });
      }
      router.push(searchParams.get("next") || "/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center px-6 py-16">
      <div className="flex gap-6 border-b border-white/10">
        <button
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
          className={`pb-3 text-sm font-bold tracking-wide ${
            mode === "signin"
              ? "border-b-2 border-fridge-orange text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          SIGN IN
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          className={`pb-3 text-sm font-bold tracking-wide ${
            mode === "signup"
              ? "border-b-2 border-fridge-orange text-white"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          CREATE ACCOUNT
        </button>
      </div>

      <p className="mt-6 text-sm text-white/50">
        {mode === "signin"
          ? "Access your orders and saved details."
          : "Create an account to track your orders."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === "signup" && (
          <label className="flex flex-col gap-2 text-sm">
            Name (optional)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
              placeholder="Jane Doe"
            />
          </label>
        )}
        <label className="flex flex-col gap-2 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Password
          <input
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="border border-fridge-orange/50 bg-fridge-orange/10 px-3 py-2 text-xs text-fridge-orange">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-fridge-orange py-3 text-sm font-bold tracking-wide text-black hover:brightness-110 disabled:opacity-50"
        >
          {submitting
            ? "PLEASE WAIT…"
            : mode === "signin"
              ? "SIGN IN"
              : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="mt-6 text-xs text-white/40">
        <Link href="/" className="text-fridge-orange hover:underline">
          ← Back to store
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

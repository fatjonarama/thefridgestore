"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl tracking-wide">SIGN IN</h1>
      <p className="mt-2 text-sm text-white/50">
        Access your orders, wishlist, and drops calendar.
      </p>

      {submitted ? (
        <p className="mt-8 border border-fridge-orange/50 bg-fridge-orange/10 px-4 py-3 text-sm text-fridge-orange">
          This is a demo store — accounts aren&apos;t wired up yet.
        </p>
      ) : (
        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              type="email"
              required
              className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              type="password"
              required
              className="border border-white/15 bg-transparent px-3 py-3 text-sm outline-none focus:border-fridge-orange"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            className="mt-2 bg-fridge-orange py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
          >
            SIGN IN
          </button>
        </form>
      )}

      <p className="mt-6 text-xs text-white/40">
        Don&apos;t have an account?{" "}
        <Link href="/account" className="text-fridge-orange hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}

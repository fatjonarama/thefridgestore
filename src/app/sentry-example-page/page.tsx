"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

// Temporary verification page. Delete once Sentry setup is confirmed working
// (both buttons should produce an issue in the Sentry dashboard).
export default function SentryExamplePage() {
  const [status, setStatus] = useState<string | null>(null);

  function throwClientError() {
    try {
      throw new Error("Sentry client-side test error");
    } catch (err) {
      Sentry.captureException(err);
      setStatus("Error thrown and sent to Sentry. Check the Issues tab in a few seconds.");
    }
  }

  async function triggerServerError() {
    setStatus("Calling the server route…");
    try {
      const res = await fetch("/api/sentry-example-api");
      setStatus(
        res.ok
          ? "Unexpected: the route didn't error."
          : `Server route responded with ${res.status}, as expected. Check the Issues tab in a few seconds.`,
      );
    } catch {
      setStatus("Request failed outright — check the Issues tab anyway.");
    }
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-24 text-center">
      <h1 className="font-display text-2xl tracking-wide">Sentry setup check</h1>
      <p className="text-sm text-white/60">
        Click each button once, then check the Issues feed in your Sentry dashboard.
        Delete this page afterward — it&apos;s only for verifying the setup.
      </p>
      <button
        onClick={throwClientError}
        className="mt-4 bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
      >
        Throw a client-side error
      </button>
      <button
        onClick={triggerServerError}
        className="border border-frost px-6 py-3 text-sm font-bold tracking-wide text-ice-300"
      >
        Trigger a server-side error
      </button>
      {status && <p className="mt-4 text-sm text-fridge-orange">{status}</p>}
    </main>
  );
}

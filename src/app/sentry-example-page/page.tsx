"use client";

import * as Sentry from "@sentry/nextjs";

// Temporary verification page. Delete once Sentry setup is confirmed working
// (both buttons should produce an issue in the Sentry dashboard).
export default function SentryExamplePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-24 text-center">
      <h1 className="font-display text-2xl tracking-wide">Sentry setup check</h1>
      <p className="text-sm text-white/60">
        Click each button once, then check the Issues feed in your Sentry dashboard.
        Delete this page afterward — it&apos;s only for verifying the setup.
      </p>
      <button
        onClick={() => {
          throw new Error("Sentry client-side test error");
        }}
        className="mt-4 bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
      >
        Throw a client-side error
      </button>
      <button
        onClick={async () => {
          const res = await fetch("/api/sentry-example-api");
          if (!res.ok) {
            Sentry.captureMessage("Sentry server-side test error — route responded with an error, as expected.");
          }
        }}
        className="border border-frost px-6 py-3 text-sm font-bold tracking-wide text-ice-300"
      >
        Trigger a server-side error
      </button>
    </main>
  );
}

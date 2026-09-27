"use client";

import { useEffect, useState } from "react";
import FridgeGlyph from "@/components/FridgeGlyph";

const SESSION_KEY = "fridge-intro-seen";
const AUTO_CLOSE_MS = 1100;

export default function FridgeIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = true;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || reducedMotion) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    // One-time sync from an external, browser-only source (sessionStorage +
    // matchMedia) that isn't knowable during SSR/first paint — not a derived
    // render value, so this can't be computed outside an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);

    const timer = setTimeout(() => setShow(false), AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [show]);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Skip intro"
      onClick={() => setShow(false)}
      className="fixed inset-0 z-[200] block h-full w-full cursor-pointer overflow-hidden text-left"
    >
      <span className="intro-door-left absolute inset-y-0 left-0 block w-1/2 border-r border-white/5 bg-[linear-gradient(120deg,#0a0e12,#141b22)]" />
      <span className="intro-door-right absolute inset-y-0 right-0 block w-1/2 border-l border-white/5 bg-[linear-gradient(240deg,#0a0e12,#141b22)]" />

      <span className="intro-light pointer-events-none absolute inset-y-0 left-1/2 block w-40 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(91,184,232,0.55),transparent)] blur-xl" />
      <span className="intro-fog pointer-events-none absolute left-1/2 top-1/2 block h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,246,255,0.5),transparent)] blur-2xl" />

      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="block h-16 w-10 text-fridge-orange opacity-90">
          <FridgeGlyph />
        </span>
      </span>

      <span className="pointer-events-none absolute bottom-6 right-6 text-xs font-bold tracking-wide text-white/40">
        SKIP
      </span>
    </button>
  );
}

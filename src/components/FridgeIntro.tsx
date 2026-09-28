"use client";

import { useEffect, useState } from "react";
import FridgeGlyph from "@/components/FridgeGlyph";

const SESSION_KEY = "fridge-intro-seen";

// Single source of truth for pacing. Every animated element's keyframes in
// globals.css share one duration (--intro-total) and use percentage stops
// computed from these phase boundaries, so nudging TOTAL_MS rescales the
// whole sequence proportionally. Changing an individual phase (HOLD_MS,
// OPEN_END_MS, FOG_START_MS) independently of TOTAL_MS means updating the
// matching keyframe percentages in globals.css too (% = ms / TOTAL_MS).
const INTRO_TIMING = {
  HOLD_MS: 500, // 0 – 0.5s: closed door holds, faint light builds behind the seam
  OPEN_END_MS: 1600, // 0.5 – 1.6s: door splits open (ease-out glide)
  FOG_START_MS: 1200, // 1.2 – 2.5s: fog rolls out + fades as the hero settles in
  TOTAL_MS: 2500, // full lifecycle before auto-unmount
};

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

    const timer = setTimeout(() => setShow(false), INTRO_TIMING.TOTAL_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function skip() {
      setShow(false);
    }
    window.addEventListener("keydown", skip);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Skip intro"
      onClick={() => setShow(false)}
      style={{ "--intro-total": `${INTRO_TIMING.TOTAL_MS}ms` } as React.CSSProperties}
      className="fixed inset-0 z-[200] block h-full w-full cursor-pointer overflow-hidden text-left"
    >
      <span className="intro-door-left absolute inset-y-0 left-0 block w-1/2 border-r border-white/5 bg-[linear-gradient(120deg,#0a0e12,#141b22)]" />
      <span className="intro-door-right absolute inset-y-0 right-0 block w-1/2 border-l border-white/5 bg-[linear-gradient(240deg,#0a0e12,#141b22)]" />

      <span className="intro-light-leak pointer-events-none absolute inset-y-0 left-1/2 block w-20 -translate-x-1/2">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ice-100" />
        <span className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(91,184,232,0.6),transparent)] blur-xl" />
      </span>

      <span className="intro-fog pointer-events-none absolute left-1/2 top-1/2 block h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,246,255,0.5),transparent)] blur-2xl" />

      <span className="intro-glyph pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="block h-16 w-10 text-fridge-orange">
          <FridgeGlyph />
        </span>
      </span>

      <span className="pointer-events-none absolute bottom-5 right-5 border border-white/15 bg-black/30 px-3 py-1.5 text-[11px] font-bold tracking-wide text-white/70">
        SKIP
      </span>
    </button>
  );
}

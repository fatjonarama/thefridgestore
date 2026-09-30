"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Audience } from "@/lib/audience";

const TAP_OPEN_MS = 220;

export default function FridgeDoor({
  audience,
  side,
  label,
}: {
  audience: Audience;
  side: "left" | "right";
  label: string;
}) {
  const router = useRouter();
  const mobileRef = useRef<HTMLAnchorElement>(null);
  const [mobileInView, setMobileInView] = useState(false);
  const [tapOpen, setTapOpen] = useState(false);

  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMobileInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const doorOrigin = side === "left" ? "origin-left" : "origin-right";
  const handleSide = side === "left" ? "right-3" : "left-3";
  const lightSide = side === "left" ? "right-0" : "left-0";
  const href = `/shop?audience=${audience}`;

  function handleMobileTap(e: React.MouseEvent) {
    e.preventDefault();
    if (tapOpen) return; // already animating, ignore repeat taps
    setTapOpen(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push(href), reducedMotion ? 0 : TAP_OPEN_MS);
  }

  return (
    <>
      <Link
        href={href}
        className={`fridge-door fridge-door-${side} group relative h-[380px] [perspective:1600px]`}
      >
        <span className="absolute inset-0 rounded-2xl border border-frost bg-[radial-gradient(80%_60%_at_50%_100%,rgba(91,184,232,0.22),var(--surface)_75%)]" />

        <span className={`fridge-door-panel glass absolute inset-0 rounded-2xl border border-frost ${doorOrigin}`}>
          <span className="ice-grain pointer-events-none absolute inset-0 rounded-2xl" />

          <span className="pointer-events-none absolute right-4 top-3 font-mono text-[10px] tracking-wide text-ice-500">
            −4°C
          </span>

          <span
            className={`fridge-door-handle pointer-events-none absolute inset-y-10 ${handleSide} w-1.5 rounded-full bg-[linear-gradient(90deg,#7c8a97,#eef3f6,#7c8a97)]`}
          />
          <span
            className={`fridge-door-light pointer-events-none absolute inset-y-0 ${lightSide} w-24 bg-[radial-gradient(closest-side,rgba(91,184,232,0.55),transparent)]`}
          />
          <span
            className={`fridge-door-fog pointer-events-none absolute bottom-6 ${lightSide} h-24 w-24 rounded-full bg-[radial-gradient(closest-side,rgba(234,246,255,0.45),transparent)] blur-xl`}
          />

          <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="relative inline-block">
              <span className="fridge-door-label font-display text-3xl tracking-wide text-ice-100">
                {label.toUpperCase()}
              </span>
              <span className="fridge-door-open-label absolute inset-0 font-display text-3xl tracking-wide text-fridge-orange">
                OPEN →
              </span>
            </span>
          </span>
        </span>
      </Link>

      <Link
        ref={mobileRef}
        href={href}
        onClick={handleMobileTap}
        aria-label={label}
        className={`fridge-door-mobile group relative block min-h-[300px] overflow-hidden rounded-2xl border border-frost bg-glass p-3 ${
          mobileInView ? "in-view" : ""
        } ${tapOpen ? "tap-open" : ""}`}
      >
        <span className="ice-grain pointer-events-none absolute inset-0" />

        <span
          className={`fridge-door-mobile-handle pointer-events-none absolute bottom-4 top-9 ${handleSide} w-1.5 rounded-full bg-[linear-gradient(90deg,#7c8a97,#eef3f6,#7c8a97)]`}
        />
        <span
          className={`fridge-door-mobile-light glow-pulse pointer-events-none absolute inset-y-0 ${lightSide} w-14 opacity-40 bg-[radial-gradient(closest-side,rgba(91,184,232,0.5),transparent)]`}
        />

        <span className="relative flex min-h-[264px] flex-col items-center justify-center text-center">
          <span className="fridge-door-mobile-word font-display text-2xl tracking-wide">
            {label.toUpperCase()}
          </span>
        </span>
      </Link>
    </>
  );
}

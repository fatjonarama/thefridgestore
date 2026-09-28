"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ProductRow } from "@/db/schema";
import type { Audience } from "@/lib/audience";

export default function FridgeDoor({
  audience,
  side,
  label,
  count,
  products,
}: {
  audience: Audience;
  side: "left" | "right";
  label: string;
  count: number;
  products: ProductRow[];
}) {
  const mobileRef = useRef<HTMLAnchorElement>(null);
  const [mobileInView, setMobileInView] = useState(false);

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

  const shelfProducts = products.slice(0, 4);
  const pairsLabel = `${count} ${count === 1 ? "PAIR" : "PAIRS"} INSIDE`;
  const doorOrigin = side === "left" ? "origin-left" : "origin-right";
  const handleSide = side === "left" ? "right-3" : "left-3";
  const lightSide = side === "left" ? "right-0" : "left-0";

  return (
    <>
      <Link
        href={`/shop?audience=${audience}`}
        className={`fridge-door fridge-door-${side} group relative hidden h-[480px] [perspective:1600px] md:block`}
      >
        <span className="absolute inset-0 overflow-hidden rounded-2xl border border-frost bg-[radial-gradient(80%_60%_at_50%_100%,rgba(91,184,232,0.22),var(--surface)_75%)]">
          <span className="absolute inset-x-6 bottom-[38%] h-px bg-white/10" />
          <span className="absolute inset-x-6 bottom-[16%] h-px bg-white/10" />
          <span className="absolute inset-0 flex items-end justify-center gap-4 p-6">
            {shelfProducts.length === 0 ? (
              <span className="pb-10 text-xs font-semibold tracking-wide text-white/30">
                RESTOCKING SOON
              </span>
            ) : (
              shelfProducts.map((p, i) => (
                <span
                  key={p.slug}
                  className="fridge-door-shelf-item relative h-24 w-16 shrink-0 sm:h-28 sm:w-20"
                  style={{ "--shelf-delay": `${i * 70}ms` } as React.CSSProperties}
                >
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
                    />
                  ) : null}
                </span>
              ))
            )}
          </span>
        </span>

        <span className={`fridge-door-panel glass absolute inset-0 rounded-2xl border border-frost ${doorOrigin}`}>
          <span className="ice-grain pointer-events-none absolute inset-0 rounded-2xl" />

          <span className="pointer-events-none absolute right-4 top-4 font-mono text-[11px] tracking-wide text-ice-500">
            −4°C
          </span>

          <span
            className={`fridge-door-handle pointer-events-none absolute inset-y-14 ${handleSide} w-1.5 rounded-full bg-[linear-gradient(90deg,#7c8a97,#eef3f6,#7c8a97)]`}
          />
          <span
            className={`fridge-door-light pointer-events-none absolute inset-y-0 ${lightSide} w-28 bg-[radial-gradient(closest-side,rgba(91,184,232,0.55),transparent)]`}
          />
          <span
            className={`fridge-door-fog pointer-events-none absolute bottom-6 ${lightSide} h-28 w-28 rounded-full bg-[radial-gradient(closest-side,rgba(234,246,255,0.45),transparent)] blur-xl`}
          />

          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="relative inline-block">
              <span className="fridge-door-label font-display text-4xl tracking-wide text-ice-100">
                {label.toUpperCase()}
              </span>
              <span className="fridge-door-open-label absolute inset-0 font-display text-4xl tracking-wide text-fridge-orange">
                OPEN →
              </span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-ice-300">{pairsLabel}</span>
          </span>
        </span>
      </Link>

      <Link
        ref={mobileRef}
        href={`/shop?audience=${audience}`}
        className={`fridge-door-mobile group relative block min-h-[220px] overflow-hidden rounded-2xl border border-frost bg-glass p-6 md:hidden ${
          mobileInView ? "in-view" : ""
        }`}
      >
        <span className="ice-grain pointer-events-none absolute inset-0" />
        {shelfProducts[0]?.images[0] ? (
          <span className="fridge-door-mobile-product pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2">
            <img
              src={shelfProducts[0].images[0]}
              alt=""
              className="h-28 w-28 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]"
            />
          </span>
        ) : null}
        <span className="relative flex min-h-[172px] flex-col items-center justify-center gap-2 text-center">
          <span className="fridge-door-mobile-word font-display text-4xl tracking-wide">
            {label.toUpperCase()}
          </span>
          <span className="text-xs font-semibold tracking-wide text-ice-300">{pairsLabel}</span>
        </span>
      </Link>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CyclingHero from "@/components/CyclingHero";

const SLIDE_MS = 6000;
const SLIDE_COUNT = 2;

export default function HeroCarousel() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % SLIDE_COUNT), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="grid">
        <div
          className={`col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:transition-none ${
            slide === 0 ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <CyclingHero />
        </div>
        <div
          className={`col-start-1 row-start-1 flex min-h-[420px] flex-col items-center justify-center text-center transition-opacity duration-500 motion-reduce:transition-none ${
            slide === 1 ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <h2 className="font-display text-4xl tracking-wide sm:text-5xl">
            SUPER <span className="text-fridge-orange">SALE</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
            The sale has started — grab your pair before sizes run out.
          </p>
          <Link
            href="/shop?sale=true"
            className="mt-8 inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:hover:scale-[1.03]"
          >
            SHOP THE SALE
          </Link>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setSlide(i)}
            className={`h-1.5 w-8 transition-colors ${
              slide === i ? "bg-fridge-orange" : "bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import CyclingHero from "@/components/CyclingHero";

export default function HeroCarousel() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2"
      >
        <div
          className="cold-light absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(45% 18% at 50% 20%, rgba(91,184,232,0.24), transparent)",
          }}
        />
      </div>

      <CyclingHero />
    </div>
  );
}

"use client";

import CyclingHero from "@/components/CyclingHero";
import SnowParticles from "@/components/SnowParticles";

export default function HeroCarousel() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[34rem] w-screen -translate-x-1/2 overflow-hidden"
      >
        <div className="cold-light absolute inset-x-0 top-0 h-72 opacity-70 [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_100%)] [background:radial-gradient(50%_100%_at_50%_0%,rgba(91,184,232,0.26),rgba(91,184,232,0.1)_45%,transparent_75%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_100%)]" />
        <div className="fog-layer-a absolute -inset-x-10 bottom-0 h-40 rounded-[100%] bg-[radial-gradient(closest-side,rgba(168,216,240,0.14),transparent)] blur-2xl" />
        <div className="fog-layer-b absolute -inset-x-10 bottom-6 h-28 rounded-[100%] bg-[radial-gradient(closest-side,rgba(234,246,255,0.1),transparent)] blur-2xl" />
        <SnowParticles />
      </div>

      <CyclingHero />
    </div>
  );
}

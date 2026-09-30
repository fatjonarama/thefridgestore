"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroLine from "@/components/HeroLine";

type Phrase = {
  lines: string[];
  accentIndex: number;
};

const PHRASES: Phrase[] = [
  { lines: ["COLD.", "FRESH.", "YOURS."], accentIndex: 1 },
  { lines: ["LIMITED SIZES.", "DON'T", "SLEEP."], accentIndex: 2 },
];

const LETTER_STAGGER_MS = 30;
const LINE_PAUSE_MS = 150;
const LETTER_DURATION_MS = 500;
const CYCLE_MS = 3600;
const GLITCH_DURATION_MS = 180;
const SWIPE_THRESHOLD_PX = 40;

function lineStartDelays(lines: string[]) {
  const delays: number[] = [];
  let delay = 0;
  for (const line of lines) {
    delays.push(delay);
    delay += line.length * LETTER_STAGGER_MS + LINE_PAUSE_MS;
  }
  return delays;
}

export default function CyclingHero() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    setIndex((i) => (dx < 0 ? (i + 1) % PHRASES.length : (i - 1 + PHRASES.length) % PHRASES.length));
  }

  const phrase = PHRASES[index];
  const delays = lineStartDelays(phrase.lines);
  const accentLine = phrase.lines[phrase.accentIndex];
  const accentDelay = delays[phrase.accentIndex];
  const glitchDelay = accentDelay + accentLine.length * LETTER_STAGGER_MS + LETTER_DURATION_MS;
  const lastLine = phrase.lines.length - 1;
  const settleDelay = delays[lastLine] + phrase.lines[lastLine].length * LETTER_STAGGER_MS + LETTER_DURATION_MS;
  const pulseDelay = Math.max(glitchDelay + GLITCH_DURATION_MS, settleDelay) + 100;

  return (
    <div className="relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="relative">
        <h1
          key={index}
          className="frost-text font-display text-[clamp(2rem,8vw,4.5rem)] leading-[1.08] tracking-wide md:text-7xl"
        >
          {phrase.lines.map((line, i) => (
            <HeroLine
              key={i}
              text={line}
              startDelay={delays[i]}
              className={i === phrase.accentIndex ? "text-fridge-orange" : undefined}
              fx={i === phrase.accentIndex ? { glitchDelay, pulseDelay } : undefined}
            />
          ))}
        </h1>
        <div
          className="hero-in mt-10 flex flex-wrap items-center gap-4"
          style={{ "--hero-delay": "1350ms" } as React.CSSProperties}
        >
          <Link
            href="/shop"
            className="btn-frost-primary inline-flex h-14 items-center justify-center bg-fridge-orange px-8 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:hover:scale-[1.03] md:inline-block md:h-auto md:py-4"
          >
            SHOP THE DROP
          </Link>
          <Link
            href="/shop?sale=true"
            className="glass inline-flex h-14 items-center gap-1.5 border px-5 text-xs font-bold text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange md:h-auto md:py-3 md:tracking-wide"
          >
            <span aria-hidden="true">❄</span>
            −50°C
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-2 md:hidden">
          {PHRASES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show phrase ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-fridge-orange" : "w-2.5 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

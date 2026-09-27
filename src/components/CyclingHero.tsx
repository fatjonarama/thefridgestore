"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  const phrase = PHRASES[index];
  const delays = lineStartDelays(phrase.lines);
  const accentLine = phrase.lines[phrase.accentIndex];
  const accentDelay = delays[phrase.accentIndex];
  const glitchDelay = accentDelay + accentLine.length * LETTER_STAGGER_MS + LETTER_DURATION_MS;
  const lastLine = phrase.lines.length - 1;
  const settleDelay = delays[lastLine] + phrase.lines[lastLine].length * LETTER_STAGGER_MS + LETTER_DURATION_MS;
  const pulseDelay = Math.max(glitchDelay + GLITCH_DURATION_MS, settleDelay) + 100;

  return (
    <div className="relative overflow-hidden">
      <div className="relative">
        <h1
          key={index}
          className="frost-text font-display text-6xl leading-[1.08] tracking-wide sm:text-7xl"
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
            className="btn-frost-primary inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:hover:scale-[1.03]"
          >
            SHOP THE DROP
          </Link>
          <Link
            href="/shop?sale=true"
            className="glass inline-flex items-center gap-1.5 border px-5 py-3 text-xs font-bold tracking-wide text-ice-300 transition-colors hover:border-fridge-orange hover:text-fridge-orange"
          >
            <span aria-hidden="true">❄</span>
            SALE
          </Link>
        </div>
      </div>
    </div>
  );
}

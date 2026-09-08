"use client";

import { useEffect, useRef } from "react";

type Segment = { x1: number; y1: number; x2: number; y2: number; gen: number };

function generateBranches(
  x0: number,
  y0: number,
  angle0: number,
  len0: number,
  maxDepth: number,
): Segment[] {
  const segments: Segment[] = [];
  function recurse(x: number, y: number, angle: number, length: number, depth: number, gen: number) {
    if (depth <= 0 || length < 3) return;
    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    segments.push({ x1: x, y1: y, x2, y2, gen });
    const branchCount = Math.random() < 0.6 ? 2 : 1;
    for (let i = 0; i < branchCount; i++) {
      recurse(x2, y2, angle + (Math.random() - 0.5) * 1.05, length * 0.74, depth - 1, gen + 1);
    }
  }
  recurse(x0, y0, angle0, len0, maxDepth, 0);
  return segments;
}

function buildFrost(w: number, h: number): Segment[] {
  const seeds = [
    { x: 0, y: h * 0.15, angle: 0.15 },
    { x: 0, y: h * 0.85, angle: -0.15 },
    { x: w, y: h * 0.25, angle: Math.PI - 0.2 },
    { x: w, y: h * 0.75, angle: Math.PI + 0.2 },
    { x: w * 0.5, y: 0, angle: Math.PI / 2 },
  ];
  let all: Segment[] = [];
  for (const s of seeds) {
    all = all.concat(generateBranches(s.x, s.y, s.angle, w * 0.09, 8));
  }
  all.sort((a, b) => a.gen - b.gen);
  return all;
}

const GROW_MS = 4200;
const HOLD_MS = 14000;

export default function FrostCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let segments: Segment[] = [];
    let maxGen = 0;

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      segments = buildFrost(w, h);
      maxGen = segments.reduce((m, s) => Math.max(m, s.gen), 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function drawStatic() {
      for (const s of segments) {
        ctx!.strokeStyle = `rgba(245,245,245,${(Math.pow(0.87, s.gen) * 0.5).toFixed(3)})`;
        ctx!.lineWidth = Math.max(0.6, 1.6 - s.gen * 0.12);
        ctx!.beginPath();
        ctx!.moveTo(s.x1, s.y1);
        ctx!.lineTo(s.x2, s.y2);
        ctx!.stroke();
      }
    }

    if (prefersReduced) {
      drawStatic();
      return () => window.removeEventListener("resize", resize);
    }

    const startTime = performance.now();
    let rafId: number;

    function draw(now: number) {
      const elapsed = now - startTime;
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      ctx!.clearRect(0, 0, w, h);

      const cycle = elapsed % (GROW_MS + HOLD_MS);
      const growProgress = Math.min(1, cycle / GROW_MS);
      const visibleGen = growProgress * maxGen;

      if (cycle < 40 && elapsed > GROW_MS + HOLD_MS - 1) {
        segments = buildFrost(w, h);
        maxGen = segments.reduce((m, s) => Math.max(m, s.gen), 0);
      }

      for (const s of segments) {
        if (s.gen > visibleGen) continue;
        const age = visibleGen - s.gen;
        const fadeIn = Math.min(1, age * 3);
        const baseOpacity = Math.pow(0.87, s.gen) * 0.5 * fadeIn;
        ctx!.strokeStyle = `rgba(245,245,245,${baseOpacity.toFixed(3)})`;
        ctx!.lineWidth = Math.max(0.6, 1.6 - s.gen * 0.12);
        ctx!.beginPath();
        ctx!.moveTo(s.x1, s.y1);
        ctx!.lineTo(s.x2, s.y2);
        ctx!.stroke();
        if (s.gen === Math.floor(visibleGen) && fadeIn > 0.6) {
          ctx!.fillStyle = `rgba(255,90,31,${(0.5 * fadeIn).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(s.x2, s.y2, 1.6, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

"use client";

import { useEffect, useRef } from "react";

const MAX_PARTICLES = 40;
const MAX_PARTICLES_MOBILE = 16;

export default function SnowParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    function resize() {
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.max(1, width * dpr);
      canvas!.height = Math.max(1, height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const count = width < 480 ? MAX_PARTICLES_MOBILE : MAX_PARTICLES;
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.5,
      speed: 5 + Math.random() * 9,
      drift: (Math.random() - 0.5) * 5,
      opacity: 0.15 + Math.random() * 0.35,
    }));

    let raf = 0;
    let running = true;
    let isInView = true;
    let last = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!running) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += p.speed * dt;
        p.x += p.drift * dt;
        if (p.y > height) {
          p.y = -4;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(234, 246, 255, ${p.opacity})`;
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    raf = requestAnimationFrame(frame);

    function syncRunning() {
      running = isInView && document.visibilityState === "visible";
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        syncRunning();
      },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    document.addEventListener("visibilitychange", syncRunning);

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncRunning);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

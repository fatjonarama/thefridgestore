"use client";

import { useEffect, useRef } from "react";

type FlyDetail = { x: number; y: number };

export default function FlyToCart() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleFly(e: Event) {
      const detail = (e as CustomEvent<FlyDetail>).detail;
      const root = rootRef.current;
      if (!detail || !root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Two cart controls exist (compact icon on mobile, wide button on
      // desktop) and only one is ever laid out at a time — pick whichever
      // has an offsetParent (i.e. isn't display:none).
      const anchors = document.querySelectorAll<HTMLElement>("[data-cart-anchor]");
      const target = [...anchors].find((el) => el.offsetParent !== null) ?? anchors[0];
      if (!target) return;
      const targetRect = target.getBoundingClientRect();

      const ghost = document.createElement("span");
      ghost.textContent = "❄";
      ghost.setAttribute("aria-hidden", "true");
      Object.assign(ghost.style, {
        position: "fixed",
        left: "0",
        top: "0",
        fontSize: "20px",
        color: "#ff5a1f",
        pointerEvents: "none",
        willChange: "transform, opacity",
        transform: `translate(${detail.x}px, ${detail.y}px) scale(1)`,
        opacity: "1",
        transition: "transform 0.6s cubic-bezier(0.3,0,0.4,1), opacity 0.6s ease-in",
      });
      root.appendChild(ghost);

      requestAnimationFrame(() => {
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;
        ghost.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.3)`;
        ghost.style.opacity = "0";
      });

      setTimeout(() => ghost.remove(), 650);
    }

    window.addEventListener("fridge:add-to-cart", handleFly);
    return () => window.removeEventListener("fridge:add-to-cart", handleFly);
  }, []);

  return <div ref={rootRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]" />;
}

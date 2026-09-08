"use client";

import { useRef, useState } from "react";
import Placeholder from "@/components/Placeholder";

const SLIDE_COUNT = 4;

export default function HeroSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, startScroll: 0, dragging: false });
  const [active, setActive] = useState(0);

  function onPointerDown(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { startX: e.clientX, startScroll: track.scrollLeft, dragging: true };
    track.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const track = trackRef.current;
    if (!track || !drag.current.dragging) return;
    track.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
  }

  function endDrag() {
    drag.current.dragging = false;
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  }

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onScroll={onScroll}
        className="hide-scrollbar flex aspect-square w-full snap-x snap-mandatory overflow-x-auto border-2 border-fridge-orange cursor-grab active:cursor-grabbing"
      >
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <Placeholder key={i} className="stripe-drift h-full w-full flex-none snap-center" />
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 w-6 transition-colors ${
              active === i ? "bg-fridge-orange" : "bg-white/15 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

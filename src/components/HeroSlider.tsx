"use client";

import { useRef, useState } from "react";

// Temporary stand-ins (random keyword-matched photos) until real product
// photography is uploaded — swap these src values for real image URLs.
const SLIDES = [
  "https://loremflickr.com/900/900/sneakers,shoes?random=1",
  "https://loremflickr.com/900/900/sneakers,streetwear?random=2",
  "https://loremflickr.com/900/900/sneakers,shoes?random=3",
  "https://loremflickr.com/900/900/sneakers,trainers?random=4",
];

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
        className="hero-slider-fade hide-scrollbar flex aspect-square w-full snap-x snap-mandatory overflow-x-auto cursor-grab active:cursor-grabbing"
      >
        {SLIDES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            draggable={false}
            className="h-full w-full flex-none snap-center object-cover"
          />
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
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

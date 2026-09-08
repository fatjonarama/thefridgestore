type Orb = {
  top: string;
  left: string;
  size: number;
  opacity: number;
  blur: number;
  variant: "a" | "b";
  duration: number;
  delay: number;
};

const ORBS: Orb[] = [
  { top: "8%", left: "6%", size: 380, opacity: 0.16, blur: 110, variant: "a", duration: 34, delay: 0 },
  { top: "62%", left: "82%", size: 300, opacity: 0.18, blur: 95, variant: "b", duration: 40, delay: 4 },
  { top: "22%", left: "72%", size: 250, opacity: 0.14, blur: 80, variant: "a", duration: 46, delay: 8 },
  { top: "78%", left: "14%", size: 340, opacity: 0.15, blur: 100, variant: "b", duration: 38, delay: 2 },
  { top: "45%", left: "42%", size: 270, opacity: 0.12, blur: 90, variant: "a", duration: 50, delay: 6 },
  { top: "5%", left: "48%", size: 220, opacity: 0.13, blur: 75, variant: "b", duration: 44, delay: 10 },
];

export default function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={`ambient-blob-${orb.variant} absolute rounded-full bg-fridge-orange`}
          style={
            {
              top: orb.top,
              left: orb.left,
              width: orb.size,
              height: orb.size,
              opacity: orb.opacity,
              filter: `blur(${orb.blur}px)`,
              "--drift-duration": `${orb.duration}s`,
              "--drift-delay": `${orb.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

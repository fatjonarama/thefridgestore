const LETTER_STAGGER_MS = 30;

export default function HeroLine({
  text,
  startDelay,
  className,
  fx,
}: {
  text: string;
  startDelay: number;
  className?: string;
  /** Extra "landing" effects (glitch + idle pulse) for the accent line only. */
  fx?: { glitchDelay: number; pulseDelay: number };
}) {
  const style = fx
    ? ({
        "--glitch-delay": `${fx.glitchDelay}ms`,
        "--pulse-delay": `${fx.pulseDelay}ms`,
      } as React.CSSProperties)
    : undefined;

  return (
    <span
      className={`hero-letters block ${fx ? "hero-line-fresh-fx " : ""}${className ?? ""}`}
      style={style}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="hero-letter inline-block"
          style={{ "--letter-delay": `${startDelay + i * LETTER_STAGGER_MS}ms` } as React.CSSProperties}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

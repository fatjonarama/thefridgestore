const MESSAGES = [
  "NEW DROPS EVERY FRIDAY",
  "STRAIGHT OUT THE FRIDGE",
  "LIMITED SIZES — DON'T SLEEP",
];

// Repeated so a single group is comfortably wider than any real viewport —
// the seamless -50% loop only works if a group never runs out of content
// before the animation resets, otherwise wide screens see a blank gap.
const REPEAT_COUNT = 8;
const REPEATED_MESSAGES = Array.from({ length: REPEAT_COUNT }).flatMap(() => MESSAGES);

function TickerGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden}>
      {REPEATED_MESSAGES.map((msg, i) => (
        <span key={i} className="flex items-center gap-10 text-xs font-bold tracking-wide">
          {msg}
          <span className="text-black/40">•</span>
        </span>
      ))}
    </div>
  );
}

export default function TickerBar() {
  return (
    <div className="ticker-bar overflow-hidden bg-fridge-orange py-2 text-black">
      <div className="marquee-track flex w-max">
        <TickerGroup />
        <TickerGroup hidden />
      </div>
    </div>
  );
}

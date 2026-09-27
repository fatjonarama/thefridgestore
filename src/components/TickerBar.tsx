const MESSAGES = [
  "THE SALE HAS STARTED",
  "STRAIGHT OUT THE FRIDGE",
  "LIMITED SIZES — DON'T SLEEP",
  "WORLDWIDE DELIVERY",
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
        <span key={i} className="flex items-center gap-10 text-xs font-bold tracking-wide text-ice-300">
          {msg}
          <span className="text-fridge-orange" aria-hidden="true">
            ❄
          </span>
        </span>
      ))}
    </div>
  );
}

export default function TickerBar() {
  return (
    <div className="ticker-bar overflow-hidden border-b border-frost bg-surface py-2">
      <div className="marquee-track flex w-max">
        <TickerGroup />
        <TickerGroup hidden />
      </div>
    </div>
  );
}

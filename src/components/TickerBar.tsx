const MESSAGES = [
  "NEW DROPS EVERY FRIDAY",
  "FREE LOCAL DELIVERY",
  "LIMITED SIZES — DON'T SLEEP",
];

function TickerGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden}>
      {MESSAGES.map((msg, i) => (
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

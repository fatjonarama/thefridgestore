const NAV_LINKS = ["MEN", "WOMEN", "KIDS"];

const CATEGORIES = ["MEN", "WOMEN", "KIDS"];

const DROPS = [
  { name: "Blackout 04", price: "$128" },
  { name: "Curb Runner", price: "$152" },
  { name: "Deep Freeze", price: "$135" },
];

function Placeholder({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-[repeating-linear-gradient(45deg,#1a1a1a,#1a1a1a_10px,#111_10px,#111_20px)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-fridge-orange text-sm font-display text-black">
              F
            </span>
            <span className="font-display text-xl tracking-wide">
              THE FRIDGE
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#" className="hover:text-fridge-orange">
                {link}
              </a>
            ))}
          </nav>
          <button className="bg-fridge-orange px-4 py-2 text-sm font-bold tracking-wide text-black">
            CART (0)
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-display text-6xl leading-[0.95] tracking-wide sm:text-7xl">
              COLD.
              <br />
              <span className="text-fridge-orange">FRESH.</span>
              <br />
              YOURS.
            </h1>
            <p className="mt-6 max-w-md text-white/60">
              Street-ready kicks built for the pavement. New drops land every
              Friday — get in before they&apos;re gone.
            </p>
            <button className="mt-8 bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black hover:brightness-110">
              SHOP THE DROP
            </button>
          </div>
          <Placeholder className="relative aspect-square w-full border-2 border-fridge-orange">
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs tracking-widest text-white/40">
              HERO SNEAKER SHOT
            </span>
          </Placeholder>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="font-display text-2xl tracking-wide">SHOP BY</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <a key={cat} href="#" className="group block">
                <Placeholder className="aspect-[4/3] w-full" />
                <p className="mt-3 text-sm font-bold tracking-wide group-hover:text-fridge-orange">
                  {cat}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="font-display text-2xl tracking-wide">FRESH DROPS</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {DROPS.map((drop) => (
              <a key={drop.name} href="#" className="group block">
                <Placeholder className="relative aspect-square w-full">
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[10px] tracking-widest text-white/30">
                    PRODUCT PHOTO
                  </span>
                </Placeholder>
                <p className="mt-3 text-sm font-bold tracking-wide group-hover:text-fridge-orange">
                  {drop.name}
                </p>
                <p className="text-sm text-fridge-orange">{drop.price}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-white/40">
          © {new Date().getFullYear()} The Fridge. All rights reserved.
        </div>
      </footer>
    </>
  );
}

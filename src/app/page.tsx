import Link from "next/link";
import HeroLine from "@/components/HeroLine";
import HeroSlider from "@/components/HeroSlider";
import Placeholder from "@/components/Placeholder";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getFreshDrops } from "@/db/queries";
import { AUDIENCES, AUDIENCE_LABELS } from "@/lib/audience";

export const dynamic = "force-dynamic";

export default async function Home() {
  const freshDrops = await getFreshDrops(3);

  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-6xl leading-[0.95] tracking-wide sm:text-7xl">
            <HeroLine text="COLD." startDelay={0} />
            <HeroLine
              text="FRESH."
              startDelay={300}
              className="text-fridge-orange"
              fx={{ glitchDelay: 950, pulseDelay: 1400 }}
            />
            <HeroLine text="YOURS." startDelay={650} />
          </h1>
          <p
            className="hero-in mt-6 max-w-md text-white/60"
            style={{ "--hero-delay": "1350ms" } as React.CSSProperties}
          >
            Street-ready kicks built for the pavement. New drops land every
            Friday — get in before they&apos;re gone.
          </p>
          <Link
            href="/shop"
            className="hero-in mt-8 inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:hover:scale-[1.03]"
            style={{ "--hero-delay": "1500ms" } as React.CSSProperties}
          >
            SHOP THE DROP
          </Link>
        </div>
        <div
          className="hero-in relative"
          style={{ "--hero-delay": "180ms" } as React.CSSProperties}
        >
          <div className="glow-pulse pointer-events-none absolute -inset-8 -z-10 rounded-full bg-fridge-orange/20 blur-3xl" />
          <HeroSlider />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-2xl tracking-wide">SHOP BY</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience} delay={i * 100}>
              <Link href={`/shop?audience=${audience}`} className="group block">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <Placeholder className="stripe-drift h-full w-full transition-transform duration-500 ease-out group-hover:scale-105" />
                </div>
                <p className="mt-3 text-sm font-bold tracking-wide transition-colors group-hover:text-fridge-orange">
                  {AUDIENCE_LABELS[audience].toUpperCase()}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-2xl tracking-wide">FRESH DROPS</h2>
        {freshDrops.length === 0 ? (
          <p className="mt-6 text-sm text-white/40">No drops tagged yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {freshDrops.map((product, i) => (
              <Reveal key={product.slug} delay={i * 100}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

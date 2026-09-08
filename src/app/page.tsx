import Link from "next/link";
import CyclingHero from "@/components/CyclingHero";
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
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <CyclingHero />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="font-display text-4xl tracking-wide sm:text-5xl">
          SUPER <span className="text-fridge-orange">SALE</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
          The sale has started — grab your pair before sizes run out.
        </p>
        <Link
          href="/shop?sale=true"
          className="mt-8 inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95 sm:hover:scale-[1.03]"
        >
          SHOP THE SALE
        </Link>
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

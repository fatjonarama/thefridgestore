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
      <section className="mx-auto max-w-7xl px-6 py-16">
        <CyclingHero />
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

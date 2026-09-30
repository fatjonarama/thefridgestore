import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import FridgeDoor from "@/components/FridgeDoor";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getActiveProducts } from "@/db/queries";
import { AUDIENCE_LABELS } from "@/lib/audience";

export const dynamic = "force-dynamic";

export default async function Home() {
  const activeProducts = await getActiveProducts();
  const freshDrops = activeProducts.filter((p) => p.isNew);

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-7xl flex-col justify-center px-6 pb-12 pt-16 md:block md:min-h-0 md:pb-20 md:pt-24">
        <HeroCarousel />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <h2 className="font-display text-2xl tracking-wide">SHOP BY</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6">
          <FridgeDoor audience="men" side="left" label={AUDIENCE_LABELS.men} />
          <FridgeDoor audience="women" side="right" label={AUDIENCE_LABELS.women} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-wide">FRESH DROPS</h2>
          <Link
            href="/shop"
            className="text-xs font-bold tracking-wide text-ice-300 transition-colors hover:text-fridge-orange md:hidden"
          >
            SEE ALL
          </Link>
        </div>
        {freshDrops.length === 0 ? (
          <p className="mt-6 text-sm text-white/40">No drops tagged yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
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

import HeroCarousel from "@/components/HeroCarousel";
import FridgeDoor from "@/components/FridgeDoor";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getActiveProducts } from "@/db/queries";
import { AUDIENCE_LABELS } from "@/lib/audience";

export const dynamic = "force-dynamic";

export default async function Home() {
  const activeProducts = await getActiveProducts();
  const freshDrops = activeProducts.filter((p) => p.isNew).slice(0, 3);
  const menProducts = activeProducts.filter((p) => p.audience === "men");
  const womenProducts = activeProducts.filter((p) => p.audience === "women");

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-20 md:pt-24">
        <HeroCarousel />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-2xl tracking-wide">SHOP BY</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FridgeDoor
            audience="men"
            side="left"
            label={AUDIENCE_LABELS.men}
            count={menProducts.length}
            products={menProducts}
          />
          <FridgeDoor
            audience="women"
            side="right"
            label={AUDIENCE_LABELS.women}
            count={womenProducts.length}
            products={womenProducts}
          />
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

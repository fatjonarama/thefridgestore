import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getFreshDrops } from "@/db/queries";
import { AUDIENCES, AUDIENCE_LABELS, type Audience } from "@/lib/audience";

export const dynamic = "force-dynamic";

const AUDIENCE_IMAGES: Partial<Record<Audience, string>> = {
  men: "/shop-by/men.webp",
  women: "/shop-by/women.png",
};

export default async function Home() {
  const freshDrops = await getFreshDrops(3);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pb-20 md:pt-24">
        <HeroCarousel />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-2xl tracking-wide">SHOP BY</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience} delay={i * 100}>
              <Link href={`/shop?audience=${audience}`} className="group block">
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-frost bg-glass">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 [background:radial-gradient(60%_60%_at_50%_100%,rgba(91,184,232,0.18),transparent_70%)]"
                  />
                  <Image
                    src={AUDIENCE_IMAGES[audience] ?? ""}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-contain object-bottom p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
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

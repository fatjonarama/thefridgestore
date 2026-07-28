import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABELS, PRODUCTS, type Category } from "@/lib/products";

const CATEGORIES: Category[] = ["men", "women", "kids"];
const FRESH_DROPS = PRODUCTS.filter((p) => p.tag === "New drop").slice(0, 3);

export default function Home() {
  return (
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
          <Link
            href="/shop/men"
            className="mt-8 inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black hover:brightness-110"
          >
            SHOP THE DROP
          </Link>
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
            <Link key={cat} href={`/shop/${cat}`} className="group block">
              <Placeholder className="aspect-[4/3] w-full" />
              <p className="mt-3 text-sm font-bold tracking-wide group-hover:text-fridge-orange">
                {CATEGORY_LABELS[cat].toUpperCase()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-display text-2xl tracking-wide">FRESH DROPS</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FRESH_DROPS.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

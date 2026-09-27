import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="melt-icon text-6xl" aria-hidden="true">
        🧊
      </span>
      <h1 className="frost-text mt-6 font-display text-4xl tracking-wide sm:text-5xl">
        THIS ITEM MELTED.
      </h1>
      <p className="mt-4 max-w-sm text-sm text-muted">
        The page you&apos;re looking for isn&apos;t in the fridge anymore.
      </p>
      <Link
        href="/"
        className="btn-frost-primary mt-8 inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black transition-transform duration-200 hover:brightness-110 active:scale-95"
      >
        BACK TO THE FRIDGE
      </Link>
    </main>
  );
}

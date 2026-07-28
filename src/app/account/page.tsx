import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl tracking-wide">ACCOUNT</h1>
      <p className="mt-2 text-sm text-white/50">
        Sign in to view your orders and saved details.
      </p>

      <Link
        href="/login"
        className="mt-6 inline-block bg-fridge-orange px-6 py-3 text-sm font-bold tracking-wide text-black hover:brightness-110"
      >
        SIGN IN
      </Link>

      <div className="mt-12 border-t border-white/10 pt-8">
        <h2 className="font-display text-xl tracking-wide">ORDER HISTORY</h2>
        <p className="mt-3 text-sm text-white/40">
          No orders yet — sign in to see your order history here.
        </p>
      </div>
    </main>
  );
}

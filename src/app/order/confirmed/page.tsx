import Link from "next/link";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-fridge-orange text-2xl text-fridge-orange">
        ✓
      </div>
      <h1 className="mt-6 font-display text-4xl tracking-wide">
        WE&apos;VE GOT YOUR ORDER
      </h1>
      <p className="mt-4 text-white/60">
        {phone
          ? `We'll reach out on ${phone} to confirm and arrange payment.`
          : "We'll reach out shortly to confirm and arrange payment."}
      </p>
      <p className="mt-2 text-sm text-white/40">
        Payment is arranged directly with us — cash on delivery, bank transfer, or
        WhatsApp — nothing is charged online.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-fridge-orange px-8 py-4 text-sm font-bold tracking-wide text-black hover:brightness-110"
      >
        BACK TO SHOP
      </Link>
    </main>
  );
}

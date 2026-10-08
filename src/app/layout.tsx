import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AmbientGlow from "@/components/AmbientGlow";
import FridgeIntro from "@/components/FridgeIntro";
import SiteChrome from "@/components/SiteChrome";
import SiteFooter from "@/components/SiteFooter";
import SnowParticles from "@/components/SnowParticles";
import { getCurrentUser } from "@/lib/auth";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thefridge.store"),
  title: "The Fridge — Cold. Fresh. Yours.",
  description: "Street-ready kicks built for the pavement.",
  openGraph: {
    title: "The Fridge — Cold. Fresh. Yours.",
    description: "Street-ready kicks built for the pavement.",
    url: "https://thefridge.store",
    siteName: "The Fridge",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Fridge — Cold. Fresh. Yours.",
    description: "Street-ready kicks built for the pavement.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <FridgeIntro />
        <div aria-hidden="true" className="ice-texture" />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <SnowParticles />
        </div>
        <AmbientGlow />
        <CartProvider>
          <WishlistProvider>
            <SiteChrome user={user} />
            {children}
            <SiteFooter />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

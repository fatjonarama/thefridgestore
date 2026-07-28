import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import SiteChrome from "@/components/SiteChrome";

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
  title: "The Fridge — Cold. Fresh. Yours.",
  description: "Street-ready kicks built for the pavement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-black text-white antialiased">
        <CartProvider>
          <WishlistProvider>
            <SiteChrome />
            {children}
            <footer className="border-t border-white/10">
              <div className="mx-auto max-w-7xl px-6 py-8 text-xs text-white/40">
                © {new Date().getFullYear()} The Fridge. All rights reserved.
              </div>
            </footer>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

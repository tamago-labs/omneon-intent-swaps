import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const SoraFont = Sora({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Ethereum to SUI Cross-Chain Swaps | Powered by OKX DEX API",
  description:
    "Fast, low-cost cross-chain swaps between Ethereum and SUI. Powered by OKX DEX API and SUI’s native bridge with AI-powered intent resolution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={SoraFont.className}>
        <Providers>
          {/* Content */}
          <div className={`relative z-20  mx-auto px-4 py-6 min-h-screen flex flex-col`}>
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

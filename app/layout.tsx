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
  title: "Omneon.xyz | Omni Intent DEX across 4 chains",
  description: "Omneon is an AI-powered intent-based cross-chain DEX supporting swaps across Ethereum, SUI, and more. Powered by OKX’s aggregated liquidity and native bridging, it enables faster, cheaper execution with intelligent routing.",
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

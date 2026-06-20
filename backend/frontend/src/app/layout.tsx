import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CVision AI — Your Career Deserves a Brilliant Mind",
  description:
    "Choose an AI personality, upload your CV, and get insights that actually land interviews. Meet Scouty, Nova, Blaze, Sage, and Echo.",
  keywords: [
    "CV analyzer",
    "AI resume",
    "job search",
    "ATS optimization",
    "career coaching",
  ],
  openGraph: {
    title: "CVision AI — Your Career Deserves a Brilliant Mind",
    description:
      "Five AI personalities. One brilliant CV analysis. Find your match.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} antialiased bg-[#07070A] text-[#F4F4F6]`}
      >
        {children}
      </body>
    </html>
  );
}

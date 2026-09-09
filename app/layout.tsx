import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muhammad Mohsin Shahzad | Full Stack & AI Developer in Kabirwala, Pakistan",
  description: "Official portfolio of Muhammad Mohsin Shahzad, Full Stack and AI Developer from Kabirwala, Khanewal. Specializing in MERN stack, Python, Next.js, and modern web solutions.",
  keywords: ["Muhammad Mohsin Shahzad", "Full Stack Developer Kabirwala", "AI Developer Pakistan", "MERN Stack Developer Khanewal", "Next.js Developer"],
  authors: [{ name: "Muhammad Mohsin Shahzad" }],
  openGraph: {
    title: "Muhammad Mohsin Shahzad | Full Stack & AI Developer",
    description: "Explore portfolio of Muhammad Mohsin Shahzad - Expert in MERN, Python, Next.js & AI Web Applications.",
    url: "https://mohsin-portfolio.vercel.app",
    siteName: "Muhammad Mohsin Portfolio",
    images: [
      {
        url: "/og-image.png", // اپنی پورٹ فولیو کی بینر امیج کو public فولڈر میں اس نام سے رکھیں
        width: 1200,
        height: 630,
        alt: "Muhammad Mohsin Shahzad - Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Mohsin Shahzad | Full Stack & AI Developer",
    description: "Explore portfolio of Muhammad Mohsin Shahzad - Expert in MERN, Python, Next.js & AI Web Applications.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
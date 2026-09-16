import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Development Services | Full-Stack & Next.js Developer",
  description: "Professional website development services for modern web apps, SaaS, and custom platforms. Fast, SEO-ready & scalable.",
  keywords: [
    "web development services",
    "website development service",
    "website development services near me",
    "Next.js Developer",
    "Full Stack Developer",
    "Muhammad Mohsin Shahzad"
  ],
  authors: [{ name: "Muhammad Mohsin Shahzad" }],
  metadataBase: new URL("https://mohsinshahzad.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Web Development Services | Full-Stack & Next.js Developer",
    description: "Professional website development services for modern web apps, SaaS, and custom platforms. Fast, SEO-ready & scalable.",
    url: "https://mohsinshahzad.vercel.app",
    siteName: "Muhammad Mohsin Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Web Development Services - Muhammad Mohsin Shahzad",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Development Services | Full-Stack & Next.js Developer",
    description: "Professional website development services for modern web apps, SaaS, and custom platforms. Fast, SEO-ready & scalable.",
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
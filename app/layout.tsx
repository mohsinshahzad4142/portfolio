import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Development Services | Full-Stack & Next.js Developer",
  description: "Professional website development services for modern web apps, SaaS, and custom platforms. Fast, SEO-ready & scalable.",
  keywords: ["web development services", "website development service", "website development services near me"],
  metadataBase: new URL("https://mohsinshahzad.vercel.app"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

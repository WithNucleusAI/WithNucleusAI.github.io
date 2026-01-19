import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";
import { Outfit } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";

const outfit = Outfit({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://withnucleus.ai"),
  title: "Nucleus AI - General Intelligence",
  description: "Building the next generation of General Intelligence.",
  openGraph: {
    title: "Nucleus AI",
    description: "Building the next generation of General Intelligence.",
    url: "https://withnucleus.ai",
    siteName: "Nucleus AI",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <header>
          <div className="logo-container">
            <Link href="/" className="logo">
              <Image src="/logo.png" alt="Nucleus AI Logo" width={40} height={40} className="logo-img" />
              <span className="logo-text">Nucleus AI</span>
              {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
                <span style={{
                  fontSize: "0.8rem",
                  background: "#ff4444",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  marginLeft: "8px",
                  fontWeight: "bold",
                  verticalAlign: "middle"
                }}>
                  DEV
                </span>
              )}
            </Link>
          </div>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
          </nav>
        </header>
        <main>{children}</main>
        <div id="email">contact@withnucleus.ai</div>
        <ScrollToTop />
      </body>
    </html>
  );
}

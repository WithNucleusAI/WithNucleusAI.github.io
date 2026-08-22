import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Inter_Tight, Inconsolata } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-base",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-code",
});

export const viewport: Viewport = {
  themeColor: "#0e100f",
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
        url: "/logo.webp",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${interTight.variable} ${inconsolata.variable} text-white bg-black flex flex-col items-center text-center min-h-screen m-0 p-0 overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <TopNav />
          <main className="flex-1 flex flex-col w-full sm:pt-28">{children}</main>
          <Footer />
          <ScrollToTop />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

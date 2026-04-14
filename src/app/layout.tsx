import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { IBM_Plex_Mono, Inconsolata } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-base",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-code",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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
      <body className={`${plexMono.variable} ${inconsolata.variable} text-black dark:text-white bg-white dark:bg-black flex flex-col items-center text-center min-h-screen m-0 p-0 overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <TopNav />
          <main className="flex-1 flex flex-col w-full sm:pt-28">{children}</main>
          <Footer />
          <ScrollToTop />
          <ThemeToggle />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

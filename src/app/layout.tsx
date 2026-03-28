import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IBM_Plex_Mono, Inconsolata, Playfair_Display } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import MuteButton from "@/components/MuteButton";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import ThemeColorSync from "@/components/ThemeColorSync";

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${plexMono.variable} ${inconsolata.variable} ${playfair.variable} text-[rgb(10,10,10)] dark:text-gray-100 bg-white dark:bg-black flex flex-col items-center text-center min-h-screen m-0 p-0 overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorSync />
          <audio id="bg-music" loop preload="none" src="/music.wav" />
          <TopNav />
          <main className="flex-1 flex flex-col w-full sm:pt-28">{children}</main>
          <Footer />
          <ScrollToTop />
          <ThemeToggle />
          <MuteButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IBM_Plex_Mono, Inconsolata } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import NavBar from "@/components/NavBar";

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
      <body className={`${plexMono.variable} ${inconsolata.variable} text-black bg-white flex flex-col items-center text-center min-h-screen w-full m-0 p-0 overflow-x-hidden`}>
        <NavBar />
        <main className="flex-1 flex mt-20 flex-col w-full relative z-10">{children}</main>
        <div id="email" className="fixed bottom-[30px] text-base text-black/50 font-normal opacity-0 tracking-widest z-10">contact@withnucleus.ai</div>
        <ScrollToTop />
      </body>
    </html>
  );
}

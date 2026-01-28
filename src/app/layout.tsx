import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";
import {Courier_Prime as  Outfit } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";

const outfit = Outfit({ subsets: ["latin"] , weight: ["400", "700"] }

);

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
      <body className={`${outfit.className} text-[rgb(10,10,10)] bg-white flex flex-col items-center text-center min-h-screen m-0 p-0 overflow-x-hidden`}>
        <header className="relative w-full px-4 py-4 sm:px-8 sm:py-6 flex justify-between items-center box-border z-50 bg-transparent">
          <div className="logo-container">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-inherit font-bold text-lg sm:text-xl transition-opacity duration-200 hover:opacity-80">
              <Image src="/logo.png" alt="Nucleus AI Logo" width={40} height={40} className="invert w-8 h-8 sm:w-10 sm:h-10" />
              <span className="tracking-tight hidden sm:inline">Nucleus AI</span>
              {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
                <span className="text-[0.7rem] sm:text-[0.8rem] bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-2 font-bold align-middle">
                  DEV
                </span>
              )}
            </Link>
          </div>
          <nav className="flex gap-4 sm:gap-8">
            <Link href="/" className="no-underline text-[#555] font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black">Home</Link>
            <Link href="/blog" className="no-underline text-[#555] font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black">Blogs</Link>
          </nav>
        </header>
        <main className="flex-1 flex flex-col w-full">{children}</main>
        <div id="email" className="fixed bottom-[30px] text-base text-[#666] font-normal opacity-0 tracking-widest">contact@withnucleus.ai</div>
        <ScrollToTop />
      </body>
    </html>
  );
}

"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TopNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isBlogIndex = pathname === "/blog";
  const isBlogPost = pathname.startsWith("/blog/") && pathname.split("/").filter(Boolean).length >= 2;

  const slug = isBlogPost ? pathname.split("/").filter(Boolean)[1] : "";
  const pageTitle = isHome ? "NucleusAI" : isBlogIndex ? "Blogs" : isBlogPost ? titleFromSlug(slug) : "NucleusAI";
  const backHref = isBlogPost ? "/blog" : "/";

  return (
    <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl px-4 py-2 sm:px-6 sm:py-2 flex justify-between items-center box-border z-50 rounded-4xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-gray-900/50 backdrop-blur-md">
      <div className="logo-container min-w-0">
        {isHome ? (
          <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-inherit font-bold text-lg sm:text-xl transition-opacity duration-200 hover:opacity-80">
            <Image src="/logo.png" alt="Nucleus AI Logo" width={40} height={40} className="invert dark:invert-0 w-8 h-8 sm:w-10 sm:h-10" />
            <span className="tracking-tight hidden sm:inline">{pageTitle}</span>
            {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
              <span className="text-[0.7rem] sm:text-[0.8rem] bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-2 font-bold align-middle">
                DEV
              </span>
            )}
          </Link>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4">
           <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-inherit font-bold text-lg sm:text-xl transition-opacity duration-200 hover:opacity-80">
            <Image src="/logo.png" alt="Nucleus AI Logo" width={40} height={40} className="invert dark:invert-0 w-8 h-8 sm:w-9 sm:h-9" /></Link>
             <Link href={backHref} aria-label="Go back" className="no-underline text-[#555] dark:text-gray-400 font-medium text-lg sm:text-xl leading-none transition-colors duration-200 hover:text-black dark:hover:text-white">
              <ArrowLeft size={20}  />
            </Link>
            <span className="tracking-tight font-bold text-base sm:text-lg truncate max-w-[48vw] sm:max-w-lg">
              {pageTitle}
            </span>
          </div>
        )}
      </div>

      <nav className="flex gap-4 sm:gap-8">
        <Link href="/" className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Home</Link>
        <Link href="/blog" className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Blogs</Link>
      </nav>
    </header>
  );
}
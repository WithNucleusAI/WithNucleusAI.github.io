"use client";

import Image from "next/image";
import Link from "next/link";

export default function TopNav() {
  return (
    <header className=" top-3 w-full px-4 py-2 sm:px-6 sm:py-2 flex justify-between items-center box-border z-50  ">
      <div className="logo-container min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-inherit font-bold text-lg sm:text-xl transition-opacity duration-200 hover:opacity-80">
            <Image src="/logo.png" alt="Nucleus AI Logo" width={40} height={40} className="invert dark:invert-0 w-8 h-8 sm:w-10 sm:h-10" />
            <span className="tracking-tight hidden sm:inline">NucleusAI</span>
            {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
              <span className="text-[0.7rem] sm:text-[0.8rem] bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-2 font-bold align-middle">
                DEV
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="flex gap-4 sm:gap-8">
        <Link href="/" className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Home</Link>
        <Link href="/blog" className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Blogs</Link>
      </nav>
    </header>
  );
}
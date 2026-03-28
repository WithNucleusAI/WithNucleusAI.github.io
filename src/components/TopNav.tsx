"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getIntroPlayed, setIntroPlayed } from "./IntroOverlay";
import { fadeInAudio, fadeOutAudio } from "@/lib/audio";

export default function TopNav() {
  const pathname = usePathname();
  const [introDone, setIntroDone] = useState(() => getIntroPlayed());
  
  const isVisible = useMemo(() => {
    if (typeof window !== "undefined") {
      return pathname !== "/" || introDone;
    }
    return pathname !== "/";
  }, [pathname, introDone]);

  useEffect(() => {
    const handleIntroDone = () => setIntroDone(true);
    window.addEventListener('intro-done', handleIntroDone);
    
    if (pathname === '/') {
        if (introDone) {
            fadeInAudio();
        }
    } else {
        setIntroPlayed(); // Automatically skip intro if user visits any other page first
      fadeOutAudio();
    }

    return () => window.removeEventListener('intro-done', handleIntroDone);
  }, [pathname, introDone]);

  return (
    <header className={`absolute inset-x-0 top-0 w-full bg-transparent px-4 py-2 pt-[max(env(safe-area-inset-top),0.5rem)] sm:px-6 sm:py-2 flex justify-between items-center box-border z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="logo-container min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-inherit font-bold text-lg sm:text-xl transition-opacity duration-200 hover:opacity-80">
            <Image src="/logo.png" alt="Nucleus AI Logo" width={40} height={40} className="invert dark:invert-0 w-8 h-8 sm:w-10 sm:h-10" />
            <span className="tracking-tight hidden sm:inline">Nucleus AI</span>
            {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
              <span className="text-[0.7rem] sm:text-[0.8rem] bg-[#ff4444] text-white px-1.5 py-0.5 rounded ml-2 font-bold align-middle">
                DEV
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="flex gap-4 font-semibold sm:gap-8">
        {pathname !== '/' && <Link href="/" className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Home</Link>}
        {pathname !== '/blog' && <Link href="/blog" className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Blogs</Link>}
        {pathname !== '/image' && <Link href="/image"  className="no-underline text-[#555] dark:text-gray-400 font-medium text-sm sm:text-base transition-colors duration-200 hover:text-black dark:hover:text-white">Image</Link>}
      </nav>
    </header>
  );
}
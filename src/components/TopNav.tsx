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
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-2xl px-5 py-2.5 rounded-2xl border border-black/8 dark:border-[rgba(79,124,255,0.08)] bg-white/70 dark:bg-[rgba(8,8,16,0.7)] shadow-lg shadow-black/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center gap-6 sm:gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="logo-container min-w-0">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 no-underline text-inherit transition-all duration-300 hover:opacity-90 group">
          <div className="relative">
            <Image src="/logo.webp" alt="Nucleus AI Logo" width={40} height={40}
              className="invert dark:invert-0 w-7 h-7 sm:w-8 sm:h-8 relative z-10 dark:drop-shadow-[0_0_8px_rgba(79,124,255,0.3)] group-hover:dark:drop-shadow-[0_0_12px_rgba(79,124,255,0.5)] transition-all duration-300"
            />
          </div>
          <span className="tracking-[0.08em] hidden sm:inline text-sm font-extralight text-gray-800 dark:text-[rgba(255,255,255,0.7)]">Nucleus AI</span>
          {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev") && (
            <span className="text-[0.6rem] bg-[rgba(79,124,255,0.15)] text-[var(--accent)] px-1.5 py-0.5 rounded ml-1 font-medium align-middle tracking-wider border border-[rgba(79,124,255,0.2)]">
              DEV
            </span>
          )}
        </Link>
      </div>

      <nav className="flex gap-5 sm:gap-6">
        {pathname !== '/' && <Link href="/" className="link-underline no-underline text-gray-500 dark:text-[rgba(255,255,255,0.4)] font-light text-xs sm:text-sm tracking-[0.1em] transition-colors duration-300 hover:text-[var(--accent)] hover:dark:text-[var(--accent)]">Home</Link>}
        {pathname !== '/blog' && <Link href="/blog" className="link-underline no-underline text-gray-500 dark:text-[rgba(255,255,255,0.4)] font-light text-xs sm:text-sm tracking-[0.1em] transition-colors duration-300 hover:text-[var(--accent)] hover:dark:text-[var(--accent)]">Blogs</Link>}
        {pathname !== '/image' && <Link href="/image" className="link-underline no-underline text-gray-500 dark:text-[rgba(255,255,255,0.4)] font-light text-xs sm:text-sm tracking-[0.1em] transition-colors duration-300 hover:text-[var(--accent)] hover:dark:text-[var(--accent)]">Image</Link>}
      </nav>
    </header>
  );
}
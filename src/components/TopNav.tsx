"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getIntroPlayed, setIntroPlayed } from "./IntroOverlay";

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

    if (pathname !== '/') {
      setIntroPlayed();
    }

    return () => window.removeEventListener('intro-done', handleIntroDone);
  }, [pathname, introDone]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-black/6 dark:border-white/6 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="flex items-center justify-between px-5 py-2.5 sm:px-8 sm:py-3 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 no-underline transition-opacity duration-300 hover:opacity-60">
          <Image src="/logo.webp" alt="Nucleus AI" width={40} height={40}
            className="invert dark:invert-0 w-6 h-6 sm:w-7 sm:h-7"
          />
          <span className="text-sm sm:text-base font-semibold text-black dark:text-white tracking-[0.06em]">Nucleus</span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          {[
            { href: '/', label: 'Home' },
            { href: '/blog', label: 'Blog' },
            { href: '/image', label: 'Image' },
          ].filter(item => item.href !== pathname).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] sm:text-xs tracking-[0.04em] text-black/35 dark:text-white/35 transition-colors duration-200 hover:text-black dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

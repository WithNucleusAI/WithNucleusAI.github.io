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

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/image', label: 'Image' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Mac-style menu bar — flat, full-width, no blur, just a solid bar */}
      <div className="bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/[0.08] dark:border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-[7px] sm:px-6 sm:py-[9px]">
          {/* Logo mark */}
          <Link href="/" className="flex items-center gap-2 no-underline transition-opacity duration-200 hover:opacity-60">
            <Image src="/logo.webp" alt="Nucleus" width={40} height={40}
              className="invert dark:invert-0 w-[18px] h-[18px] sm:w-5 sm:h-5"
            />
            <span className="text-[13px] sm:text-sm font-semibold text-black dark:text-white tracking-[0.04em]">Nucleus</span>
          </Link>

          {/* Menu items — Mac-style: inline, compact, monospace */}
          <nav className="flex items-center">
            {navItems.map((item, i) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] sm:text-[12px] px-2.5 sm:px-3 py-1 transition-colors duration-150 ${
                    isActive
                      ? "text-black dark:text-white font-medium"
                      : "text-black/40 dark:text-white/35 hover:text-black/80 dark:hover:text-white/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

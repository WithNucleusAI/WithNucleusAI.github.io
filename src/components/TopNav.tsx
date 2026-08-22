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

  // Discipline taxonomy — each destination wears its own hue
  const navItems = [
    { href: '/', label: 'Home', activeClass: 'text-white' },
    { href: '/blog', label: 'Blog', activeClass: 'text-pink' },
    { href: '/image', label: 'Image', activeClass: 'text-orangey' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-just-black/90 backdrop-blur-sm border-b border-surface-25">
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
          <Link href="/" className="flex items-center gap-2 no-underline transition-opacity duration-200 hover:opacity-70">
            <Image src="/logo.webp" alt="Nucleus" width={40} height={40}
              className="w-5 h-5"
            />
            <span className="text-base font-semibold text-white tracking-[-0.01em]">Nucleus</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[14px] sm:text-[15px] px-2.5 sm:px-3 py-1.5 transition-colors duration-150 ${
                    isActive
                      ? `${item.activeClass} font-medium`
                      : "text-surface-50 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="mailto:contact@withnucleus.ai"
              className="pill-btn pill-btn--sm ml-2 hidden sm:inline-flex"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

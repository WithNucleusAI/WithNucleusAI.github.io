"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getIntroPlayed, setIntroPlayed } from "./IntroOverlay";

export default function TopNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return pathname !== "/" || getIntroPlayed();
    }
    return pathname !== "/";
  });

  useEffect(() => {
    const handleIntroDone = () => setIsVisible(true);
    window.addEventListener('intro-done', handleIntroDone);
    
    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    
    const windowAny = window as any;
    if (windowAny.__audioFadeInterval) {
        clearInterval(windowAny.__audioFadeInterval);
        windowAny.__audioFadeInterval = null;
    }

    if (pathname === '/') {
        setIsVisible(getIntroPlayed());
        if (audio && getIntroPlayed()) {
            audio.volume = 0.5;
            if (audio.paused) {
                audio.play().catch(e => console.error("Audio resume failed:", e));
            }
        }
    } else {
        setIsVisible(true);
        setIntroPlayed(); // Automatically skip intro if user visits any other page first
        if (audio && !audio.paused) {
            const steps = 20;
            const stepTime = 50; // 50ms * 20 steps = 1000ms
            const volumeStep = audio.volume / steps;

            windowAny.__audioFadeInterval = setInterval(() => {
                if (audio.volume - volumeStep > 0.01) {
                    audio.volume -= volumeStep;
                } else {
                    audio.pause();
                    audio.volume = 0.5; // Reset for next time
                    clearInterval(windowAny.__audioFadeInterval);
                    windowAny.__audioFadeInterval = null;
                }
            }, stepTime);
        }
    }

    return () => window.removeEventListener('intro-done', handleIntroDone);
  }, [pathname]);

  return (
    <header className={`top-3 w-full px-4 py-2 sm:px-6 sm:py-2 flex justify-between items-center box-border z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
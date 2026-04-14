"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { getIntroPlayed } from "./IntroOverlay";
import { useFooterAwareBottomOffset } from "@/lib/useFooterAwareBottom";

export default function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const bottomOffset = useFooterAwareBottomOffset(24, 10);
    const pathname = usePathname();
    const [isVisible, setIsVisible] = React.useState(() => {
        if (typeof window !== "undefined") {
            return pathname !== "/" || getIntroPlayed();
        }
        return pathname !== "/";
    });

    React.useEffect(() => {
        setMounted(true);
        const handleIntroDone = () => setIsVisible(true);
        window.addEventListener('intro-done', handleIntroDone);

        if (pathname === '/') {
            setIsVisible(getIntroPlayed());
        } else {
            setIsVisible(true);
        }

        return () => window.removeEventListener('intro-done', handleIntroDone);
    }, [pathname]);

    if (!mounted) return null;
    if (pathname === '/image') return null;

    const currentTheme = theme === "system" ? systemTheme : theme;

    return (
        <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className={`fixed left-5 sm:left-7 z-50 text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-all duration-300 cursor-pointer ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ bottom: `${bottomOffset}px` }}
        >
            {currentTheme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    );
}

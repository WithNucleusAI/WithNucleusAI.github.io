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
    const bottomOffset = useFooterAwareBottomOffset(30, 10);
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

    if (!mounted) {
        return null;
    }

    const currentTheme = theme === "system" ? systemTheme : theme;

    // Hide on image page — forced dark only
    if (pathname === '/image') return null;

    return (
        <div
            className={`fixed left-7.5 max-md:left-3.75 z-50 transition-all duration-1000 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
            style={{ bottom: `${bottomOffset}px` }}
        >
            <button
                className="mac-btn mac-btn--circle"
                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
            >
                {currentTheme === "dark" ? (
                    <Sun className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                    <Moon className="h-5 w-5 md:h-6 md:w-6" />
                )}
            </button>
        </div>
    );
}

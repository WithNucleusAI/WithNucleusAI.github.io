"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { getIntroPlayed } from "./IntroOverlay";

export default function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
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

    return (
        <div className={`fixed bottom-[30px] left-[30px] max-md:bottom-[10px] max-md:left-[15px] z-[50] transition-all duration-1000 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
            <button className="btn btn--circle" onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
                <div className="btn__content">
                    {currentTheme === "dark" ? (
                        <Sun className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                        <Moon className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                </div>
                <svg className="btn__fill-layer" viewBox="0 0 60 60">
                    <circle className="btn__fill-circle" fill="#FFFFFF" cx="30" cy="30" r="29" />
                </svg>
                <svg className="btn__border-layer" viewBox="0 0 60 60">
                    <path className="btn__border-path btn__border-path--left" d="M30,59 A29,29 0 0,1 30,1" />
                    <path className="btn__border-path btn__border-path--right" d="M30,59 A29,29 0 0,0 30,1" />
                </svg>
            </button>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useFooterAwareBottomOffset } from "@/lib/useFooterAwareBottom";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const bottomOffset = useFooterAwareBottomOffset(24, 10);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.scrollY > 200);
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className={`fixed right-5 sm:right-7 z-50 text-[11px] tracking-[0.1em] text-black/25 dark:text-white/25 hover:text-black dark:hover:text-white transition-all duration-300 cursor-pointer ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ bottom: `${bottomOffset}px` }}
        >
            &uarr; Top
        </button>
    );
}

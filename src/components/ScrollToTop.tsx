"use client";

import { useState, useEffect } from "react";
import { useFooterAwareBottomOffset } from "@/lib/useFooterAwareBottom";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const bottomOffset = useFooterAwareBottomOffset(30, 10);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 100);
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div
            className={`fixed right-7.5 max-md:right-3.75 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            style={{ bottom: `${bottomOffset}px` }}
        >
            <button
                className="mac-btn mac-btn--circle"
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg
                    className="h-5 w-5 md:h-6 md:w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 19V5" />
                    <polyline points="5 12 12 5 19 12" />
                </svg>
            </button>
        </div>
    );
}

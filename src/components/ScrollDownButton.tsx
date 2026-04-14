"use client";

import { useEffect, useState } from "react";

export default function ScrollDownButton() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY < window.innerHeight * 0.3);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = () => {
        const target = document.getElementById("intro-section") || document.getElementById("blog-section");
        target?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <button
            onClick={handleClick}
            aria-label="Scroll down"
            className={`absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-700 cursor-pointer ${visible ? "opacity-20 hover:opacity-40" : "opacity-0 pointer-events-none"}`}
        >
            <svg className="w-4 h-4 text-black dark:text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M8 2V14M2 8l6 6 6-6" />
            </svg>
        </button>
    );
}

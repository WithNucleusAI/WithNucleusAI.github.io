"use client";

import { useEffect, useState } from "react";

export default function ScrollDownButton() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY < window.innerHeight * 0.5);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleClick = () => {
        const target = document.getElementById("intro-section") || document.getElementById("blog-section");
        target?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className={`fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-500 ${visible ? "opacity-40 hover:opacity-70" : "opacity-0 pointer-events-none"}`}>
            <button onClick={handleClick} aria-label="Scroll down" className="cursor-pointer">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5V19" />
                    <polyline points="19 12 12 19 5 12" />
                </svg>
            </button>
        </div>
    );
}

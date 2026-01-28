"use client";

import { useState, useEffect } from "react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <div className={`fixed bottom-[30px] right-[30px] md:bottom-[30px] md:right-[30px] max-md:bottom-[10px] max-md:right-[15px] z-[50] transition-all duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <button onClick={scrollToTop} aria-label="Scroll to top" className="bg-white/20 backdrop-blur-xl text-black border border-black/10 rounded-full w-10 h-10 text-sm md:w-12 md:h-12 md:text-base cursor-pointer shadow-md transition-all duration-200 flex justify-center items-center hover:scale-110 hover:bg-white/95 hover:shadow-lg">
                ↑
            </button>
        </div>
    );
}

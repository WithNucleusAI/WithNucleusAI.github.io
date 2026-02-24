"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

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
        <div className={`fixed bottom-[30px] right-[30px] max-md:bottom-[10px] max-md:right-[15px] z-[50] transition-all duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <button onClick={scrollToTop} aria-label="Scroll to top" className="flex justify-center items-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-sm transition-all duration-200 text-[#666] dark:text-gray-300 rounded-full w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 hover:shadow-lg pointer-events-auto">
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
            </button>
        </div>
    );
}

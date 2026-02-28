"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollDownButton() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY < 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToBlogs = () => {
        document.getElementById("blog-section")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToBlogs}
            aria-label="Scroll down to blogs"
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-opacity duration-300 z-10 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <ChevronDown className="w-8 h-8 text-gray-600 dark:text-gray-300" />
        </button>
    );
}

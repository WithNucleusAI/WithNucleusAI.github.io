"use client";

import { ChevronDown } from "lucide-react";

export default function ScrollDownButton() {
    const scrollToBlogs = () => {
        const blogSection = document.getElementById("blog-section");
        if (blogSection) {
            blogSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <button
            onClick={scrollToBlogs}
            className="absolute bottom-8 animate-bounce p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Scroll down to blogs"
        >
            <ChevronDown className="w-8 h-8 text-gray-600 dark:text-gray-300" />
        </button>
    );
}

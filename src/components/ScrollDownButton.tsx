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
            className="absolute bottom-12 animate-bounce p-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-white/20 transition-all duration-300"
            aria-label="Scroll down to blogs"
        >
            <ChevronDown className="w-6 h-6 text-white" />
        </button>
    );
}

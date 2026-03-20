"use client";

import { useEffect, useState } from "react";

export default function ImagePageScrollButton() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const vh = window.innerHeight;
            // Hide when scrolled past gallery section
            setVisible(window.scrollY < vh * 6);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleScroll = () => {
        const vh = window.innerHeight;
        const currentY = window.scrollY;
        
        // Scroll to next section based on current position
        if (currentY < vh * 1.5) {
            document.getElementById("image-technical")?.scrollIntoView({ behavior: "smooth" });
        } else if (currentY < vh * 3) {
            document.getElementById("image-graphs")?.scrollIntoView({ behavior: "smooth" });
        } else if (currentY < vh * 4.5) {
            document.getElementById("image-gallery")?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
            <button className="btn btn--circle" onClick={handleScroll} aria-label="Scroll down">
                <div className="btn__content">
                    <svg
                        className="h-5 w-5 md:h-6 md:w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 5V19" />
                        <polyline points="19 12 12 19 5 12" />
                    </svg>
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

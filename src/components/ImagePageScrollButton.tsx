"use client";

import { useEffect, useState } from "react";

export default function ImagePageScrollButton() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const updateVisibility = () => {
            const gallerySection = document.getElementById("image-gallery");

            if (!gallerySection) {
                setVisible(true);
                return;
            }

            const galleryTopInViewport = gallerySection.getBoundingClientRect().top;
            // Hide once the gallery section reaches the viewport.
            setVisible(galleryTopInViewport > window.innerHeight * 0.2);
        };

        window.addEventListener("scroll", updateVisibility, { passive: true });
        window.addEventListener("resize", updateVisibility);
        updateVisibility();

        return () => {
            window.removeEventListener("scroll", updateVisibility);
            window.removeEventListener("resize", updateVisibility);
        };
    }, []);

    const handleScroll = () => {
        const heroSection = document.getElementById("image-hero");
        const blogSection = document.getElementById("image-blog");
        const gallerySection = document.getElementById("image-gallery");

        if (!heroSection || !blogSection || !gallerySection) {
            return;
        }

        const sections = [heroSection, blogSection, gallerySection];
        const anchorY = window.innerHeight * 0.35;
        let currentSectionIndex = 0;

        sections.forEach((section, index) => {
            const top = section.getBoundingClientRect().top;
            if (top <= anchorY) {
                currentSectionIndex = index;
            }
        });

        const nextSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
        const nextSection = sections[nextSectionIndex];

        if (nextSection.id !== "image-gallery" || visible) {
            nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
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

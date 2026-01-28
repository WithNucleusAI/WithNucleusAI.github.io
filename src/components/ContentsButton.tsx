"use client";

import { useState, useEffect } from "react";
import TableOfContents from "./TableOfContents";

interface ContentsButtonProps {
    content: string;
}

export default function ContentsButton({ content }: ContentsButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleToggle = () => {
        setIsOpen(!isOpen);
        // Prevent body scroll when overlay is open
        document.body.style.overflow = !isOpen ? "hidden" : "";
    };

    const handleClose = () => {
        setIsOpen(false);
        document.body.style.overflow = "";
    };

    const handleLinkClick = () => {
        // Close overlay when a TOC link is clicked
        handleClose();
    };

    return (
        <>
            {/* Floating Contents Button - Mobile Only */}
            <div className={`contents-button ${isVisible ? "visible" : ""}`}>
                <button onClick={handleToggle} aria-label="Toggle table of contents">
                    {isOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Blur Overlay with TOC - Mobile Only */}
            <div
                className={`toc-overlay ${isOpen ? "open" : ""}`}
                onClick={handleClose}
            >
                <div
                    className="toc-overlay-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="toc-overlay-close" onClick={handleClose} aria-label="Close">
                        ✕
                    </button>
                    <div onClick={handleLinkClick}>
                        <TableOfContents content={content} />
                    </div>
                </div>
            </div>
        </>
    );
}

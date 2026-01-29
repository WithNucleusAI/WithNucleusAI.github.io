"use client";

import React, { useEffect, useState } from "react";
import TOCOverlay from "./TOCOverlay";

export default function TableOfContents({
    content,
    onNavigate,
}: {
    content: string;
    onNavigate?: () => void;
}) {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [isHovered, setIsHovered] = useState(false);
    const isManualNavigation = React.useRef(false);
    const scrollTimeout = React.useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        // Extract headings from markdown content
        const regex = /^(#{2,3})\s+(.*)$/gm;
        let match;
        const extractedHeadings = [];

        while ((match = regex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
            extractedHeadings.push({ id, text, level });
        }

        setHeadings(extractedHeadings);
        // Set first heading as active by default
        if (extractedHeadings.length > 0) {
            setActiveId(extractedHeadings[0].id);
        }
    }, [content]);

    const handleHeadingClick = (id: string) => {
        setActiveId(id);
        isManualNavigation.current = true;

        if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
        }

        // Re-enable observer after scroll animation finishes (approx 1000ms safe buffer)
        scrollTimeout.current = setTimeout(() => {
            isManualNavigation.current = false;
        }, 1000);
    };

    useEffect(() => {
        // Track active heading based on scroll position
        const observer = new IntersectionObserver(
            (entries) => {
                if (isManualNavigation.current) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-100px 0px -66%",
                threshold: 0,
            }
        );

        const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
        elements.forEach((el) => el && observer.observe(el));

        return () => {
            elements.forEach((el) => el && observer.unobserve(el));
        };
    }, [headings]);

    if (headings.length === 0) return null;

    const getDashWidth = (level: number) => {
        return level === 2 ? "w-8" : "w-5";
    };

    return (
        <div
            className="toc-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* TOC Text Overlay - slides in from right */}
            <TOCOverlay
                headings={headings}
                activeId={activeId}
                isVisible={isHovered}
                onNavigate={onNavigate}
                onHeadingClick={handleHeadingClick}
            />

            {/* Dashes navigation - always visible */}
            <nav className="toc-dashes">
                <ul className="toc-dashes-list">
                    {headings.map((heading) => {
                        const isActive = activeId === heading.id;

                        return (
                            <li
                                key={heading.id}
                                className={`toc-dash-item ${heading.level === 3 ? "indent" : ""}`}
                            >
                                <a
                                    href={`#${heading.id}`}
                                    className="toc-dash-link"
                                    onClick={() => {
                                        handleHeadingClick(heading.id);
                                        if (onNavigate) onNavigate();
                                    }}
                                    aria-label={heading.text}
                                >
                                    <div
                                        className={`toc-dash ${getDashWidth(heading.level)} ${isActive ? "active" : ""
                                            }`}
                                    />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

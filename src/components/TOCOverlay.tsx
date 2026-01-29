"use client";

import React from "react";

interface TOCOverlayProps {
    headings: { id: string; text: string; level: number }[];
    activeId: string;
    isVisible: boolean;
    onNavigate?: () => void;
    onHeadingClick: (id: string) => void;
}

export default function TOCOverlay({
    headings,
    activeId,
    isVisible,
    onNavigate,
    onHeadingClick,
}: TOCOverlayProps) {
    if (headings.length === 0) return null;

    return (
        <div
            className={`toc-text-overlay ${isVisible ? "visible" : ""}`}
            aria-hidden={!isVisible}
        >
            <div className="toc-text-overlay-content">
                <ul className="toc-text-list">
                    {headings.map((heading) => {
                        const isActive = activeId === heading.id;

                        return (
                            <li
                                key={heading.id}
                                className={`toc-text-item ${heading.level === 3 ? "indent" : ""}`}
                            >
                                <a
                                    href={`#${heading.id}`}
                                    className={`toc-text-link ${isActive ? "active" : ""}`}
                                    onClick={(e) => {
                                        onHeadingClick(heading.id);
                                        if (onNavigate) onNavigate();
                                    }}
                                    tabIndex={isVisible ? 0 : -1}
                                >
                                    {heading.text}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from "react";

export default function TableOfContents({
    content,
    onNavigate,
}: {
    content: string;
    onNavigate?: () => void;
}) {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
        // Extract headings from markdown content
        // This is a simple regex extraction. For better results, one might use a markdown parser's AST.
        // However, since we are rendering the markdown in the parent, we can also query the DOM.
        // But querying the DOM requires the content to be rendered first.

        // Let's use regex on the raw markdown content for simplicity in SSG/Client mismatch handling,
        // or we can query the DOM in a useEffect after render.
        // Let's try matching the markdown hexcodes.
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
    }, [content]);

    if (headings.length === 0) return null;

    return (
        <nav className="toc">
            <h3 className="text-[0.8rem] sm:text-[0.85rem] uppercase tracking-wider mb-3 sm:mb-4 text-[#999] font-semibold">Table of Contents</h3>
            <ul className="list-none p-0 m-0">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={`mb-2 sm:mb-3 text-[0.85rem] sm:text-sm leading-snug ${heading.level === 3 ? "pl-4 border-l border-[#eee]" : ""}`}
                    >
                        <a
                            href={`#${heading.id}`}
                            className="no-underline text-[#666] transition-colors duration-200 hover:text-black"
                            onClick={onNavigate}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

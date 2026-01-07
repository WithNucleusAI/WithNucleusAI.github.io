"use client";

import React, { useEffect, useState } from "react";

export default function TableOfContents({ content }: { content: string }) {
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
            <h3>Table of Contents</h3>
            <ul>
                {headings.map((heading) => (
                    <li key={heading.id} className={`toc-level-${heading.level}`}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

'use client';

import { useEffect, useState, useMemo } from 'react';  // Add useMemo import
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ImageViewer from './ImageViewer';

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    const [showViewer, setShowViewer] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Remove useState for images
    // const [images, setImages] = useState<string[]>([]);

    // Replace useEffect with useMemo to compute images from content
    const images = useMemo(() => {
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const matches = [...content.matchAll(imageRegex)];
        return matches.map(match => match[1]);
    }, [content]);

    // Remove the entire useEffect block

    const handleImageClick = (src: string) => {
        const index = images.indexOf(src);
        if (index !== -1) {
            setCurrentImageIndex(index);
            setShowViewer(true);
        }
    };

    // Custom renderer to add IDs to headings for TOC and make images clickable
    const components = {
        h2: ({ children }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h2 id={id}>{children}</h2>;
        },
        h3: ({ children }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h3 id={id}>{children}</h3>;
        },
        img: ({ src, alt }: any) => {
            return (
                <img
                    src={src}
                    alt={alt}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(src)}
                />
            );
        },
        a: ({ href, children }: any) => {
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        },
    };

    return (
        <>
            <ReactMarkdown
                components={components}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {content}
            </ReactMarkdown>

            {showViewer && (
                <ImageViewer
                    images={images}
                    currentIndex={currentImageIndex}
                    onClose={() => setShowViewer(false)}
                />
            )}
        </>
    );
}
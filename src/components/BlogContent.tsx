'use client';

import { useState, useMemo, type ReactNode, type ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ImageViewer from './ImageViewer';

interface BlogContentProps {
    content: string;
}

function CodeBlock({ children, ...rest }: ComponentProps<'pre'>) {
    const [copied, setCopied] = useState(false);

    const copyText = async (text: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        if (typeof document === 'undefined') {
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    const handleCopy = () => {
        const codeElement: any = (children as ReactNode as any)?.props?.children;
        const code = typeof codeElement === 'string' ? codeElement : codeElement?.toString() || '';
        void copyText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group">
            <button
                onClick={handleCopy}
                className="absolute right-2 top-2 px-3 py-1.5 text-xs bg-[#333] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#444] z-10"
                aria-label="Copy code"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre {...rest}>{children}</pre>
        </div>
    );
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
        pre: CodeBlock,
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
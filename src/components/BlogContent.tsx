'use client';

import { useState, useMemo, type ReactNode, type ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
        <div className="relative group my-6 rounded-lg overflow-hidden border border-gray-100">
            <button
                onClick={handleCopy}
                className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-all duration-200 z-10 shadow-sm"
                aria-label={copied ? 'Copied' : 'Copy code'}
                title={copied ? 'Copied' : 'Copy code'}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                    {copied ? (
                        <path d="M20 6L9 17l-5-5" />
                    ) : (
                        <>
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M9 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v5" />
                        </>
                    )}
                </svg>
            </button>
            <pre {...rest} className="!m-0 !p-0 !bg-transparent !border-0 overflow-x-auto">
                {children}
            </pre>
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
        code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
                <SyntaxHighlighter
                    style={prism}
                    language={language}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1.25rem', paddingRight: '3.5rem', backgroundColor: '#f5f7f9' }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={`${className || ''} px-1.5 py-0.5 rounded bg-gray-100 text-[0.9em]`} {...props}>
                    {children}
                </code>
            );
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
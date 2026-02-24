"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import TableOfContents from "@/components/TableOfContents";

type CollapsibleTocProps = {
    content: string;
    children: ReactNode;
};

export default function CollapsibleToc({ content, children }: CollapsibleTocProps) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleChange = () => {
            const desktop = mediaQuery.matches;
            setIsDesktop(desktop);
            // Always show on desktop, hide on mobile
            setIsOpen(desktop);
        };

        handleChange();
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        if (!isDesktop && isOpen) {
            document.body.style.overflow = "hidden";
            const scrollToTop = document.querySelector('.scroll-to-top') as HTMLElement;
            if (scrollToTop) scrollToTop.style.zIndex = '99';
        } else {
            document.body.style.overflow = "";
            const scrollToTop = document.querySelector('.scroll-to-top') as HTMLElement;
            if (scrollToTop) scrollToTop.style.zIndex = '100';
        }

        return () => {
            document.body.style.overflow = "";
            const scrollToTop = document.querySelector('.scroll-to-top') as HTMLElement;
            if (scrollToTop) scrollToTop.style.zIndex = '100';
        };
    }, [isDesktop, isOpen]);

    const contentClassName = useMemo(() => {
        if (isDesktop && isOpen) {
            return "max-w-[1000px] mx-auto";
        }
        return "max-w-none w-full";
    }, [isDesktop, isOpen]);

    return (
        <>
            <div className="relative">
                {/* Right-side TOC for desktop - always visible on desktop */}
                <aside
                    className={`hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 max-h-[80vh] transition-all duration-300 ease-out z-50 ${isDesktop ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
                        }`}
                >
                    <TableOfContents content={content} />
                </aside>

                <main
                    className={`min-w-0 text-[1rem] mx-auto transition-all duration-300 ${contentClassName} [&_h1]:mt-6 sm:[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:font-semibold [&_h1]:text-[2.1em] sm:[&_h1]:text-[2.5em] [&_h2]:mt-6 sm:[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:font-semibold [&_h2]:text-[1.6em] sm:[&_h2]:text-[2em] [&_h2]:pb-2 [&_h3]:mt-6 sm:[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-tight [&_h3]:tracking-tight [&_h3]:font-semibold [&_h3]:text-[1.25em] sm:[&_h3]:text-[1.5em] [&_h4]:mt-5 sm:[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:leading-snug [&_h4]:tracking-tight [&_h4]:font-semibold [&_h4]:text-[1.1em] sm:[&_h4]:text-[1.25em] [&_h5]:mt-4 sm:[&_h5]:mt-5 [&_h5]:mb-2 [&_h5]:leading-snug [&_h5]:font-semibold [&_h5]:text-[1em] [&_h6]:mt-4 sm:[&_h6]:mt-5 [&_h6]:mb-2 [&_h6]:leading-snug [&_h6]:font-semibold [&_h6]:text-[0.95em] [&_p]:mb-5 sm:[&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-[#333] dark:[&_p]:text-gray-300 [&_ul]:mb-5 sm:[&_ul]:mb-6 [&_ul]:pl-5 sm:[&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-5 sm:[&_ol]:mb-6 [&_ol]:pl-5 sm:[&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-2 [&_li]:ml-5 [&_li]:leading-relaxed [&_li::marker]:text-[#888] dark:[&_li::marker]:text-gray-500 [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:align-middle [&_code]:bg-[#f4f4f4] dark:[&_code]:bg-[#1a1a1a] [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-[1em] [&_code]:text-[#c7254e] dark:[&_code]:text-[#ff7b72] [&_pre]:bg-[#f8f8f8] dark:[&_pre]:bg-[#0d1117] [&_pre]:p-4 sm:[&_pre]:p-6 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:mb-6 sm:[&_pre]:mb-8 [&_pre]:border [&_pre]:border-[#eee] dark:[&_pre]:border-[#30363d] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em] [&_pre_code]:text-[#333] dark:[&_pre_code]:text-[#e6edf3] [&_blockquote]:border-l-4 [&_blockquote]:border-black dark:[&_blockquote]:border-gray-500 [&_blockquote]:py-2 [&_blockquote]:px-0 [&_blockquote]:pl-4 sm:[&_blockquote]:pl-6 [&_blockquote]:text-[#555] dark:[&_blockquote]:text-gray-400 [&_blockquote]:italic [&_blockquote]:my-6 sm:[&_blockquote]:my-8 [&_blockquote]:bg-[#fdfdfd] dark:[&_blockquote]:bg-[#161b22] [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 sm:[&_table]:my-8 [&_table]:text-sm sm:[&_table]:text-base [&_table]:overflow-x-auto [&_table]:block [&_table]:md:table [&_th]:border-b [&_th]:border-[#eee] dark:[&_th]:border-gray-700 [&_th]:py-3 [&_th]:px-3 sm:[&_th]:px-4 [&_th]:text-left [&_th]:bg-white dark:[&_th]:bg-transparent [&_th]:font-bold [&_th]:border-b-2 [&_th]:border-b-black dark:[&_th]:border-b-gray-600 [&_td]:border-b [&_td]:border-[#eee] dark:[&_td]:border-gray-800 [&_td]:py-3 [&_td]:px-3 sm:[&_td]:px-4 [&_td]:text-left [&_tr:hover]:bg-[#fafafa] dark:[&_tr:hover]:bg-white/5 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-800 dark:[&_a]:hover:text-blue-300 [&_strong]:font-semibold [&_em]:italic [&_del]:line-through [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-900/50 dark:[&_mark]:text-yellow-200 [&_mark]:px-1 [&_hr]:my-8 [&_hr]:border-[#eee] dark:[&_hr]:border-gray-800 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-6 dark:[&_img]:invert-0 [&_figure]:my-8 [&_figure]:text-center [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-[#666] dark:[&_figcaption]:text-gray-400 [&_sup]:text-[0.75em] [&_sup]:align-super [&_sub]:text-[0.75em] [&_sub]:align-sub [&_kbd]:bg-[#f4f4f4] dark:[&_kbd]:bg-gray-800 [&_kbd]:border [&_kbd]:border-[#ddd] dark:[&_kbd]:border-gray-700 [&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:rounded [&_kbd]:text-[0.85em]`}
                >
                    {children}
                </main>
            </div>
        </>
    );
}

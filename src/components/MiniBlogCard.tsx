"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts';
import { ArrowUpRight } from 'lucide-react';

interface MiniBlogCardProps {
    post: Post;
    VisualComponent?: React.ComponentType<{ isHovered: boolean }>;
    horizontal?: boolean;
    index?: number;
}

// Small equation decorations for each card
const CARD_EQUATIONS = ["∂f/∂x = 0", "∇²ψ + V", "Σᵢ wᵢxᵢ", "λ = Av", "H(p,q)", "∫ p log p"];

export default function MiniBlogCard({ post, VisualComponent, horizontal = false, index = 0 }: MiniBlogCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const equation = CARD_EQUATIONS[index % CARD_EQUATIONS.length];

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full w-full">
            <div
                className={`flex ${horizontal ? 'flex-col sm:flex-row gap-4 sm:gap-8 sm:items-center' : 'flex-col'} h-full overflow-hidden transition-all duration-500 rounded-2xl p-5 sm:p-7 glass-panel hover:border-[rgba(79,124,255,0.15)] hover:shadow-[0_0_40px_rgba(79,124,255,0.06)]`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Visual Section */}
                {VisualComponent && (
                    <div className={`relative ${horizontal ? 'hidden md:block w-1/2 aspect-video md:aspect-[4/3] max-w-[400px]' : 'w-full aspect-square'} overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800/30 mb-6 shrink-0`}>
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                            <VisualComponent isHovered={isHovered} />
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className={`flex flex-col flex-grow ${horizontal ? 'justify-center text-left' : ''}`}>
                    {/* Date + equation */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] sm:text-xs text-gray-400 dark:text-[rgba(255,255,255,0.3)] tracking-[0.15em] font-light">
                            {post.date}
                        </span>
                        <span className="text-[8px] sm:text-[9px] text-[rgba(79,124,255,0.2)] dark:text-[rgba(79,124,255,0.25)] tracking-[0.2em] font-light" aria-hidden="true">
                            {equation}
                        </span>
                    </div>

                    <h3 className="text-lg sm:text-xl md:text-2xl font-light text-gray-900 dark:text-[rgba(255,255,255,0.85)] leading-tight mb-3 group-hover:text-[var(--accent)] transition-colors duration-300 tracking-wide line-clamp-2">
                        {post.title}
                    </h3>

                    {horizontal && (
                        <p className="text-sm text-gray-500 dark:text-[rgba(255,255,255,0.35)] line-clamp-3 mb-5 font-light leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}

                    {horizontal && (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-px bg-[var(--accent)] opacity-30 group-hover:w-8 transition-all duration-300" />
                            <span className="text-[10px] sm:text-xs font-light tracking-[0.2em] text-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                                Read
                            </span>
                            <ArrowUpRight className="w-3 h-3 text-[var(--accent)] opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

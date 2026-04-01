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

const CARD_EQUATIONS = ["∂f/∂x = 0", "∇²ψ + V", "Σᵢ wᵢxᵢ", "λ = Av", "H(p,q)", "∫ p log p"];

export default function MiniBlogCard({ post, VisualComponent, horizontal = false, index = 0 }: MiniBlogCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const equation = CARD_EQUATIONS[index % CARD_EQUATIONS.length];

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full w-full">
            <div
                className={`flex ${horizontal ? 'flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center' : 'flex-col'} h-full overflow-hidden transition-all duration-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 glass-panel hover:border-[rgba(79,124,255,0.15)] hover:shadow-[0_0_30px_rgba(79,124,255,0.05)]`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {VisualComponent && (
                    <div className={`relative ${horizontal ? 'hidden md:block w-1/2 aspect-video md:aspect-[4/3] max-w-[400px]' : 'w-full aspect-square'} overflow-hidden rounded-lg sm:rounded-xl bg-gray-800/30 mb-4 sm:mb-6 shrink-0`}>
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                            <VisualComponent isHovered={isHovered} />
                        </div>
                    </div>
                )}

                <div className={`flex flex-col flex-grow ${horizontal ? 'justify-center text-left' : ''}`}>
                    {/* Date + equation */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <span className="text-[9px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.15em] font-light" style={{ color: 'var(--t2)' }}>
                            {post.date}
                        </span>
                        <span className="text-[7px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em] font-light" style={{ color: 'var(--a3)' }} aria-hidden="true">
                            {equation}
                        </span>
                    </div>

                    <h3 className="text-base sm:text-xl md:text-2xl font-light leading-snug sm:leading-tight mb-2 sm:mb-3 group-hover:text-[var(--accent)] transition-colors duration-300 tracking-normal sm:tracking-wide line-clamp-2"
                        style={{ color: 'var(--t4)' }}>
                        {post.title}
                    </h3>

                    {horizontal && (
                        <p className="text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 font-light leading-relaxed" style={{ color: 'var(--t2)' }}>
                            {post.excerpt}
                        </p>
                    )}

                    {horizontal && (
                        <div className="flex items-center gap-2">
                            <div className="w-4 sm:w-5 h-px bg-[var(--accent)] opacity-30 group-hover:w-6 sm:group-hover:w-8 transition-all duration-300" />
                            <span className="text-[9px] sm:text-[11px] font-light tracking-[0.15em] sm:tracking-[0.2em] text-[var(--accent)] opacity-50 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                                Read
                            </span>
                            <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--accent)] opacity-30 group-hover:opacity-70 transition-all duration-300" />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

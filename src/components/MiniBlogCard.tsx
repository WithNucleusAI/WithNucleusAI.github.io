"use client";

import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts';

interface MiniBlogCardProps {
    post: Post;
    index?: number;
}

export default function MiniBlogCard({ post, index = 0 }: MiniBlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block w-full">
            <div className="py-5 sm:py-6 border-b border-black/6 dark:border-white/6 transition-colors hover:border-black/15 dark:hover:border-white/15">
                <div className="flex items-baseline gap-3 sm:gap-5 mb-1.5 sm:mb-2">
                    {/* Index number — editorial */}
                    <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-black/15 dark:text-white/15 shrink-0 w-5">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.06em] text-black/25 dark:text-white/25 font-mono shrink-0 tabular-nums">
                        {post.date}
                    </span>
                    <h3 className="text-sm sm:text-base font-medium text-black/75 dark:text-white/75 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-1 flex-1">
                        {post.title}
                    </h3>
                    {/* Hover arrow */}
                    <span className="text-black/0 dark:text-white/0 group-hover:text-black/30 dark:group-hover:text-white/30 transition-all duration-200 text-xs shrink-0 translate-x-[-4px] group-hover:translate-x-0">
                        &rarr;
                    </span>
                </div>
                <p className="text-[11px] sm:text-xs line-clamp-2 font-light leading-relaxed text-black/30 dark:text-white/30 pl-8 sm:pl-[116px]">
                    {post.excerpt}
                </p>
            </div>
        </Link>
    );
}

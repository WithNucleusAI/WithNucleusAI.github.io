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
            <div className="py-5 sm:py-6 border-b border-black/[0.04] dark:border-white/[0.04] group-hover:border-black/10 dark:group-hover:border-white/8 transition-all duration-300 group-hover:pl-2 sm:group-hover:pl-3">
                <div className="flex items-start gap-4 sm:gap-5">
                    <span className="text-[9px] sm:text-[10px] font-mono tabular-nums text-black/10 dark:text-white/8 pt-0.5 shrink-0 group-hover:text-black/25 dark:group-hover:text-white/20 transition-colors duration-300">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] sm:text-[15px] font-medium text-black/65 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors duration-300 leading-snug mb-1.5">
                            {post.title}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] tracking-[0.04em] text-black/18 dark:text-white/12 font-mono tabular-nums">
                            {post.date}
                        </span>
                    </div>
                    <span className="text-[10px] text-black/0 dark:text-white/0 group-hover:text-black/20 dark:group-hover:text-white/15 transition-all duration-300 pt-1 shrink-0 -translate-x-2 group-hover:translate-x-0">
                        &rarr;
                    </span>
                </div>
            </div>
        </Link>
    );
}

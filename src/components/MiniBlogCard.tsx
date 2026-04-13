"use client";

import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts';

interface MiniBlogCardProps {
    post: Post;
    index?: number;
}

export default function MiniBlogCard({ post }: MiniBlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block w-full">
            <div className="py-5 sm:py-6 border-b border-black/6 dark:border-white/6 transition-colors hover:border-black/15 dark:hover:border-white/15">
                <div className="flex items-baseline gap-4 sm:gap-6 mb-1.5 sm:mb-2">
                    <span className="text-[10px] sm:text-[11px] tracking-[0.08em] text-black/25 dark:text-white/25 font-mono shrink-0 tabular-nums">
                        {post.date}
                    </span>
                    <h3 className="text-sm sm:text-lg font-medium text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-1">
                        {post.title}
                    </h3>
                </div>
                <p className="text-[11px] sm:text-sm line-clamp-2 font-light leading-relaxed text-black/35 dark:text-white/35 sm:pl-[100px]">
                    {post.excerpt}
                </p>
            </div>
        </Link>
    );
}

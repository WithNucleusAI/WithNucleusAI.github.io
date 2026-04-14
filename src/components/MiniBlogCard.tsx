"use client";

import React from 'react';
import { Post } from '@/lib/posts';

interface MiniBlogCardProps {
    post: Post;
    index?: number;
}

export default function MiniBlogCard({ post, index = 0 }: MiniBlogCardProps) {
    return (
        <div className="py-5 sm:py-6 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-start gap-3 sm:gap-5">
                <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-black/25 dark:text-white/20 pt-0.5 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] sm:text-[15px] font-medium text-black/75 dark:text-white/70 leading-snug mb-1.5">
                        {post.title}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-black/30 dark:text-white/25">
                        Coming Soon
                    </span>
                </div>
            </div>
        </div>
    );
}

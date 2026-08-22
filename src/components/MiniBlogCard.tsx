"use client";

import React from 'react';
import { Post } from '@/lib/posts';

interface MiniBlogCardProps {
    post: Post;
    index?: number;
}

export default function MiniBlogCard({ post, index = 0 }: MiniBlogCardProps) {
    return (
        <div className="py-5 sm:py-6 border-b border-surface-25">
            <div className="flex items-start gap-3 sm:gap-5">
                <span className="text-[12px] sm:text-[13px] font-mono tabular-nums text-pink/70 pt-1 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] sm:text-[19px] font-medium text-white leading-snug mb-1.5 tracking-[-0.011em]">
                        {post.title}
                    </h3>
                    <span className="text-[13px] sm:text-[14px] text-surface-50">
                        Coming Soon
                    </span>
                </div>
            </div>
        </div>
    );
}

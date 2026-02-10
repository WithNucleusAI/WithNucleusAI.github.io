"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts';
import { ArrowUpRight } from 'lucide-react';

interface MiniBlogCardProps {
    post: Post;
    VisualComponent?: React.ComponentType<{ isHovered: boolean }>;
}

export default function MiniBlogCard({ post, VisualComponent }: MiniBlogCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full">
            <div
                className="flex flex-col h-full overflow-hidden transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Visual Section - Always on top if present */}
                {VisualComponent && (
                    <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 mb-6">
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                            <VisualComponent isHovered={isHovered} />
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            {post.date}
                        </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-3 text-left group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                    </h3>

                </div>
            </div>
        </Link>
    );
}

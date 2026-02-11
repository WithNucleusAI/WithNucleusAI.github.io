"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts';
import { ArrowUpRight } from 'lucide-react';

interface MiniBlogCardProps {
    post: Post;
    VisualComponent?: React.ComponentType<{ isHovered: boolean }>;
}

export default function MiniBlogCard({ post, VisualComponent, horizontal = false }: MiniBlogCardProps & { horizontal?: boolean }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full w-full">
            <div
                className={`flex ${horizontal ? 'flex-row gap-8 items-center' : 'flex-col'} h-full overflow-hidden transition-all duration-300`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Visual Section */}
                {VisualComponent && (
                    <div className={`relative ${horizontal ? 'hidden md:block w-1/2 aspect-video md:aspect-[4/3] max-w-[400px]' : 'w-full aspect-square'} overflow-hidden rounded-2xl bg-gray-100 mb-6 shrink-0`}>
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                            <VisualComponent isHovered={isHovered} />
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className={`flex flex-col flex-grow ${horizontal ? 'justify-center text-left' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            {post.date}
                        </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                    </h3>

                    {horizontal && (
                        <p className="text-gray-500 line-clamp-3 mb-4">
                            {post.excerpt}
                        </p>
                    )}

                    {horizontal && (
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                            Read Article <ArrowUpRight className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

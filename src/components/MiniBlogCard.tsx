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

    if (VisualComponent) {
        // Wide Layout with Visualization
        return (
            <Link href={`/blog/${post.slug}`} className="block group w-full h-full">
                <div
                    className="w-full border border-gray-200 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-black/20 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[350px] transition-all hover:border-blue-500/30 cursor-pointer h-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Left Panel: Visualization */}
                    <div className="w-full lg:w-1/2 min-h-[250px] lg:min-h-0 relative border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 bg-white/5 dark:bg-black/5">
                        <div className="absolute inset-0">
                            <VisualComponent isHovered={isHovered} />
                        </div>
                    </div>

                    {/* Right Panel: Details */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative">
                        <div className="flex flex-col h-full">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-4">
                                {post.title}
                            </h3>

                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed font-light line-clamp-4 flex-grow">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5 mt-6">
                                <span className="text-sm font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">{post.date}</span>
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                                    Read Blog <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Default Compact/Grid Layout
    return (
        <Link href={`/blog/${post.slug}`} className="block group h-full">
            <div className="h-full border border-gray-200 dark:border-white/10 rounded-2xl bg-white/30 dark:bg-black/20 backdrop-blur-sm p-8 hover:border-blue-500/30 transition-colors flex flex-col">
                <div className="flex flex-col items-start gap-3 flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {post.title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-light mt-1 line-clamp-3">
                        {post.excerpt}
                    </p>
                </div>

                <div className="mt-6 pt-4 flex items-center justify-between w-full border-t border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">{post.date}</span>

                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold group-hover:translate-x-1 transition-transform duration-300">
                        Read Blog <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

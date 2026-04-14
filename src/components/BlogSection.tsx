"use client";

import React from 'react';
import MiniBlogCard from "@/components/MiniBlogCard";
import { Post } from "@/lib/posts";
import Link from "next/link";

interface BlogSectionProps {
    posts: Post[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
    return (
        <section
            id="blog-section"
            className="relative w-full py-4 sm:py-10"
        >
            <div className="w-full max-w-2xl mx-auto px-5 sm:px-6">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <span className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-black/20 dark:text-white/15 border border-black/8 dark:border-white/6 px-3 py-1">
                        Recent
                    </span>
                    <Link
                        href="/blog"
                        className="text-[10px] sm:text-[11px] tracking-[0.08em] text-black/30 dark:text-white/25 transition-colors duration-200 hover:text-black dark:hover:text-white"
                    >
                        View all &rarr;
                    </Link>
                </div>

                <div className="flex flex-col">
                    {posts.map((post, i) => (
                        <MiniBlogCard key={post.slug} post={post} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

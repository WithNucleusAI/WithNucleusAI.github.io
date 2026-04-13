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
            className="relative w-full flex flex-col justify-center py-8 sm:py-20"
        >
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium text-black/30 dark:text-white/30 mb-6 sm:mb-10">
                    Recent
                </p>

                <div className="flex flex-col gap-0">
                    {posts.map((post, i) => (
                        <MiniBlogCard key={post.slug} post={post} index={i} />
                    ))}
                </div>

                <div className="mt-6 sm:mt-10 flex justify-end">
                    <Link
                        href="/blog"
                        className="text-[10px] sm:text-xs tracking-[0.15em] text-black/35 dark:text-white/35 transition-colors duration-300 hover:text-black dark:hover:text-white"
                    >
                        View all &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
}

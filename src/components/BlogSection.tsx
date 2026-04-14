"use client";

import React from 'react';
import MiniBlogCard from "@/components/MiniBlogCard";
import { Post } from "@/lib/posts";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

interface BlogSectionProps {
    posts: Post[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
    return (
        <section
            id="blog-section"
            className="relative w-full py-12 sm:py-16"
        >
            <div className="w-full max-w-2xl mx-auto px-5 sm:px-6">
                <ScrollReveal>
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <span className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-black/20 dark:text-white/15 border border-black/8 dark:border-white/6 px-3 py-1">
                            Recent
                        </span>
                        <Link
                            href="/blog"
                            className="text-[10px] sm:text-[11px] tracking-[0.08em] text-black/25 dark:text-white/20 transition-colors duration-200 hover:text-black dark:hover:text-white"
                        >
                            View all &rarr;
                        </Link>
                    </div>
                </ScrollReveal>

                <div className="flex flex-col">
                    {posts.map((post, i) => (
                        <ScrollReveal key={post.slug} delay={i * 80}>
                            <MiniBlogCard post={post} index={i} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

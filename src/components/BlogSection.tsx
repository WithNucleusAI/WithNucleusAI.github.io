"use client";

import React from 'react';
import MiniBlogCard from "@/components/MiniBlogCard";
import { Post } from "@/lib/posts";
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
                        <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-black/35 dark:text-white/30 border border-black/10 dark:border-white/8 px-3 py-1">
                            Upcoming
                        </span>
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

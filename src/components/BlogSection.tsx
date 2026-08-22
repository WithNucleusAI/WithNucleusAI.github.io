"use client";

import React from 'react';
import Link from 'next/link';
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
            className="relative w-full py-12 sm:py-20"
        >
            <div className="w-full max-w-2xl mx-auto px-5 sm:px-6">
                <ScrollReveal>
                    <div className="flex flex-col items-center gap-3 mb-8 sm:mb-12">
                        <span className="eyebrow text-surface-50">Upcoming</span>
                        <span className="text-[24px] sm:text-[34px] font-semibold tracking-[-0.011em] leading-[1.1] text-pink">Blog</span>
                    </div>
                </ScrollReveal>

                <div className="flex flex-col text-left">
                    {posts.map((post, i) => (
                        <ScrollReveal key={post.slug} delay={i * 80}>
                            <MiniBlogCard post={post} index={i} />
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal delay={240}>
                    <div className="flex justify-center mt-10 sm:mt-14">
                        <Link href="/blog" className="pill-btn">
                            Explore Blog
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

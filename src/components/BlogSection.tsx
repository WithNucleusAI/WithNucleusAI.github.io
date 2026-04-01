"use client";

import React from 'react';
import MiniBlogCard from "@/components/MiniBlogCard";
import { Post } from "@/lib/posts";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fadeOutAudio } from "@/lib/audio";

interface BlogSectionProps {
    posts: Post[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
    return (
        <section
            id="blog-section"
            className="relative min-h-[60vh] sm:min-h-screen w-full flex flex-col justify-center py-8 sm:py-24"
        >
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Section header */}
                <div className="mb-8 sm:mb-16 flex flex-col items-start">
                    <div className="mb-3 text-[8px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] font-light" style={{ color: 'var(--a3)' }} aria-hidden="true">
                        ∇ × knowledge
                    </div>

                    <h2 className="text-xl sm:text-3xl font-extralight tracking-[0.06em] sm:tracking-[0.08em]"
                        style={{ color: 'var(--t5)', textShadow: "0 0 30px var(--a1)" }}>
                        Engineering Intelligence
                    </h2>

                    <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3">
                        <div className="w-6 sm:w-8 h-px" style={{ background: 'var(--a2)' }} />
                        <p className="text-[8px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.15em] font-light" style={{ color: 'var(--t2)' }}>
                            Latest research and updates
                        </p>
                    </div>
                </div>

                {/* Blog cards */}
                <div className="flex flex-col gap-4 sm:gap-6">
                    {posts.map((post, i) => (
                        <div key={post.slug} className="w-full">
                            <MiniBlogCard post={post} horizontal={true} index={i} />
                        </div>
                    ))}
                </div>

                {/* View All */}
                <div className="mt-8 sm:mt-12 flex justify-end">
                    <Link
                        href="/blog"
                        onClick={fadeOutAudio}
                        className="group inline-flex items-center gap-2 text-[10px] sm:text-xs font-light tracking-[0.12em] sm:tracking-[0.15em] transition-all duration-300 hover:text-[var(--accent)]"
                        style={{ color: 'var(--t2)' }}
                    >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

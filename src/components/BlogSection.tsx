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
            className="relative min-h-[70vh] sm:min-h-screen w-full flex flex-col justify-center py-10 sm:py-28"
        >
            {/* Section glow */}
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none" aria-hidden="true">
                <div className="w-[500px] h-[300px] sm:w-[700px] sm:h-[400px] rounded-full opacity-[0.03] dark:opacity-[0.06] blur-[120px] mt-[10%]"
                    style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)' }} />
            </div>

            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Section header — matching the refined theme */}
                <div className="mb-8 sm:mb-20 flex flex-col items-start">
                    {/* Equation label */}
                    <div className="mb-4 text-[9px] sm:text-[10px] tracking-[0.35em] text-[rgba(79,124,255,0.25)] dark:text-[rgba(79,124,255,0.3)] font-light" aria-hidden="true">
                        ∇ × knowledge
                    </div>

                    <h2 className="text-xl sm:text-3xl font-extralight tracking-[0.06em] sm:tracking-[0.08em] text-gray-900 dark:text-white"
                        style={{ textShadow: "0 0 30px rgba(79,124,255,0.08)" }}
                    >
                        Engineering Intelligence
                    </h2>

                    <div className="mt-3 flex items-center gap-3">
                        <div className="w-8 h-px bg-[rgba(79,124,255,0.15)]" />
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[rgba(255,255,255,0.3)] tracking-[0.15em] font-light">
                            Latest research and updates
                        </p>
                    </div>
                </div>

                {/* Blog cards */}
                <div className="flex flex-col gap-6 sm:gap-8">
                    {posts.map((post, i) => (
                        <div key={post.slug} className="w-full">
                            <MiniBlogCard post={post} horizontal={true} index={i} />
                        </div>
                    ))}
                </div>

                {/* View All */}
                <div className="mt-12 sm:mt-16 flex justify-end">
                    <Link
                        href="/blog"
                        onClick={fadeOutAudio}
                        className="group inline-flex items-center gap-2 text-xs sm:text-sm font-light tracking-[0.15em] text-gray-500 dark:text-[rgba(255,255,255,0.35)] hover:text-[var(--accent)] transition-all duration-300"
                    >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

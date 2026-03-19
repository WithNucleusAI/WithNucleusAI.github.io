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
            className="relative min-h-screen w-full flex flex-col justify-center py-12 sm:py-24"
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                        Engineering Intelligence
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Latest research and updates.
                    </p>
                </div>

                {/* Ultra-Minimalist Blog Grid */}
                {/* Ultra-Minimalist Blog Grid */}
                {/* Vertical Blog Gallery */}
                <div className="flex flex-col gap-8 sm:gap-16 max-w-5xl mx-auto">
                    {posts.map((post) => {
                        return (
                            <div key={post.slug} className="w-full border-b border-gray-100 dark:border-gray-800 pb-8 sm:pb-16 last:border-0 last:pb-0">
                                <MiniBlogCard
                                    post={post}
                                    horizontal={true}
                                />
                            </div>
                        );
                    })}
                </div>


                {/* View All Archives */}
                <div className="mt-8 flex justify-end">
                    <Link
                        href="/blog"
                        onClick={fadeOutAudio}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        View All Blogs
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>
        </section>
    );
}

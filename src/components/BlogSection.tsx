"use client";

import React from 'react';
import StructuredNetworkAnimation from "@/components/StructuredNetworkAnimation";
import MiniBlogCard from "@/components/MiniBlogCard";
import { Post } from "@/lib/posts";
import DataStreamAnimation from "@/components/DataStreamAnimation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BlogSectionProps {
    posts: Post[];
}

export default function BlogSection({ posts }: BlogSectionProps) {

    return (
        <section
            id="blog-section"
            className="relative min-h-screen w-full flex flex-col justify-center py-24 bg-gradient-to-b from-transparent to-gray-50/50"
        >
            <div className="w-full max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Engineering Intelligence
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Latest research and updates.
                    </p>
                </div>

                {/* Ultra-Minimalist Blog Grid */}
                {/* Ultra-Minimalist Blog Grid */}
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
                    {posts.map((post) => {
                        // Determine visual component based on slug
                        let VisualComponent;
                        if (post.slug.includes('mhc-triton')) {
                            VisualComponent = StructuredNetworkAnimation;
                        } else if (post.slug.includes('data-blog')) {
                            VisualComponent = DataStreamAnimation;
                        }

                        return (
                            <div key={post.slug} className="w-full max-w-[400px]">
                                <MiniBlogCard
                                    post={post}
                                    VisualComponent={VisualComponent}
                                />
                            </div>
                        );
                    })}
                </div>


                {/* View All Archives */}
                <div className="mt-8 flex justify-end">
                    <Link
                        href="/blog"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        View All Blogs
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>
        </section>
    );
}

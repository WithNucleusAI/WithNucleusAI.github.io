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

                {/* Blog Grid using MiniBlogCard's internal logic for wide vs compact */}
                <div className="flex flex-col gap-8">
                    {posts.map((post) => {
                        // Check if this post should have a specific visual
                        const isMHC = post.slug.includes('mhc-triton'); // Check slug
                        const isData = post.slug.includes('data-blog');

                        // If it's the specific blog, pass the visual component
                        if (isMHC) {
                            return (
                                <div key={post.slug} className="w-full">
                                    <MiniBlogCard post={post} VisualComponent={StructuredNetworkAnimation} />
                                </div>
                            )
                        }

                        if (isData) {
                            return (
                                <div key={post.slug} className="w-full">
                                    <MiniBlogCard post={post} VisualComponent={DataStreamAnimation} />
                                </div>
                            )
                        }

                        // Otherwise render it as a standard card
                        // We might want to group standard cards in a grid if they appear sequentially?
                        // For simplicity in this iteration, keeping them full width or making a grid wrapper?
                        // The user wanted "Move things to miniblog card".
                        // This allows mixing wide and small cards. 
                        // But wait, wide takes full row. Small takes half?
                        // Let's just render them. If grid needed, parent controls it.
                        // However, dynamic grid with some full width is tricky.
                        // For now, let's just assume the layout flow:
                        // "mhc-triton" -> Wide Card.
                        // Others -> should be compact.
                        // Layout: Just a vertical stack of divs. If we really want a grid for the small ones, we need more logic.
                        // Given we only have 3 posts likely...

                        return (
                            <div key={post.slug} className="w-full md:w-1/2 lg:w-1/3 inline-block align-top pr-4 pb-4">
                                {/* Use inline-block strategy or flex wrap? 
                                    Lets use a grid for the container instead.
                                */}
                                {/* Wait, I cannot easily mix wide and grid cells without CSS Grid spanning. */}
                                {/* Let's use a class based on type? */}
                                <MiniBlogCard post={post} />
                            </div>
                        );
                    })}
                </div>

                {/* 
                   Wait, iterating and returning mixed widths in a flex-col gap-8 ?
                   The wide card is w-full.
                   The small cards being "w-full md:w-1/2" inside a flex-col will just be full width rows unless wrapped in flex-row flex-wrap.
                */}

                {/* RETHINK Layout strategy:
                    We have a list of posts.
                    WE want to render them.
                    We can map and determine col-span.
                    
                    CSS Grid is perfect here.
                */}

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {posts.map((post) => {
                        const isMHC = post.slug.includes('mhc-triton');

                        return (
                            <div
                                key={post.slug}
                                className={isMHC ? "col-span-1 md:col-span-2" : "col-span-1"}
                            >
                                <MiniBlogCard
                                    post={post}
                                    VisualComponent={isMHC ? StructuredNetworkAnimation : undefined}
                                />
                            </div>
                        );
                    })}
                </div> */}


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

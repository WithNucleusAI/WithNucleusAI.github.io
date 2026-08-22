import { getPostBySlug, getPosts } from "@/lib/posts";
import type { Metadata } from "next";
import CollapsibleToc from "@/components/CollapsibleToc";
import BlogContent from "@/components/BlogContent";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";

export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found | Nucleus AI",
        };
    }

    return {
        title: `${post.title} | Nucleus AI`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: "article",
            publishedTime: post.date,
            url: `https://withnucleus.ai/blog/${slug}`,
            images: [
                {
                    url: "/logo.png",
                    width: 800,
                    height: 600,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
        }
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-[1000px] mx-auto py-10 px-5 sm:py-16 sm:px-8 text-left w-full box-border select-text">
            <Link href="/blog" className="inline-flex items-center mb-8 sm:mb-12 no-underline text-black/30 dark:text-white/25 text-[11px] sm:text-xs tracking-[0.04em] transition-colors duration-200 hover:text-black dark:hover:text-white">
                &larr; Back
            </Link>

            <header className="mb-10 sm:mb-16 text-center flex flex-col items-center max-w-[800px] mx-auto">
                <h1 className="mb-3 text-2xl sm:text-4xl leading-tight tracking-tight font-bold text-black dark:text-white">{post.title}</h1>
                <p className="text-xs sm:text-sm text-black/30 dark:text-white/25 font-mono tabular-nums">{post.date}</p>
            </header>

            <CollapsibleToc content={post.content}>
                <BlogContent content={post.content} />
            </CollapsibleToc>
        </div>
    );
}

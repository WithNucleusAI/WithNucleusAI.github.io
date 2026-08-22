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
            <Link href="/blog" className="pill-btn pill-btn--sm mb-8 sm:mb-12 no-underline">
                &larr; Back
            </Link>

            <header className="mb-10 sm:mb-16 text-center flex flex-col items-center max-w-[800px] mx-auto">
                <span className="eyebrow text-surface-50 mb-4">The Journal</span>
                <h1 className="mb-3 text-3xl sm:text-5xl leading-[1.05] tracking-[-0.02em] font-semibold text-white">{post.title}</h1>
                <p className="text-xs sm:text-sm text-surface-50 font-mono tabular-nums">{post.date}</p>
            </header>

            <CollapsibleToc content={post.content}>
                <BlogContent content={post.content} />
            </CollapsibleToc>
        </div>
    );
}

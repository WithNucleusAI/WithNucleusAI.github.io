import { getPostBySlug, getPosts } from "@/lib/posts";
import type { Metadata } from "next";
import CollapsibleToc from "@/components/CollapsibleToc";
import BlogContent from "@/components/BlogContent";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css"; // Import Katex CSS

// Force static generation (SSG)
export const dynamic = 'force-static';
export const revalidate = false;

// Generate static params for SSG
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
        <div className="max-w-[1200px] mx-auto py-10 px-4 sm:py-16 sm:px-8 text-left w-full box-border">
            <Link href="/blog" className="inline-flex items-center mb-6 sm:mb-8 no-underline text-[#666] dark:text-gray-400 text-[0.8rem] sm:text-[0.85rem] font-medium transition-colors duration-200 hover:text-black dark:hover:text-white">
                ← Back to Blogs
            </Link>

            <header className="mb-10 sm:mb-16 text-center flex flex-col items-center max-w-[1000px] mx-auto">
                <h1 className="mb-4 text-[2.2rem] sm:text-[3.5rem] leading-tight tracking-tight font-bold dark:text-gray-100">{post.title}</h1>
                <p className="text-sm sm:text-base text-[#888] dark:text-gray-400">{post.date}</p>
            </header>

            <CollapsibleToc content={post.content}>
                <BlogContent content={post.content} />
            </CollapsibleToc>
        </div>
    );
}

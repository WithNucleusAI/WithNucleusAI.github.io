import { getPostBySlug, getPosts } from "@/lib/posts";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import TableOfContents from "@/components/TableOfContents";
import Link from "next/link";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css"; // Import Katex CSS

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

    // Custom renderer to add IDs to headings for TOC
    const components = {
        h2: ({ children }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
            return <h2 id={id}>{children}</h2>;
        },
        h3: ({ children }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
            return <h3 id={id}>{children}</h3>;
        },
    };

    return (
        <div className="blog-post-container">
            <Link href="/blog" className="back-link">
                ← Back to Blog
            </Link>

            <header className="post-header">
                <h1>{post.title}</h1>
                <p className="post-date">{post.date}</p>
            </header>

            <div className="post-layout">
                <aside className="post-sidebar">
                    <TableOfContents content={post.content} />
                </aside>

                <main className="post-content">
                    <ReactMarkdown
                        components={components}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {post.content}
                    </ReactMarkdown>
                </main>
            </div>
        </div>
    );
}

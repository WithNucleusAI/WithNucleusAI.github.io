import Link from "next/link";
import { getPosts } from "@/lib/posts";

export const dynamic = 'force-static';
export const revalidate = false;

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:py-16 sm:px-6 text-left w-full box-border select-text">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl mb-6 sm:mb-10 pb-3 sm:pb-6 font-extralight tracking-[0.06em] sm:tracking-[0.08em]"
                style={{ color: 'var(--t5)', borderBottom: '1px solid var(--a1)' }}>
                Blogs
            </h1>
            <div className="posts-list">
                {posts.map((post) => (
                    <div key={post.slug} className="mb-6 sm:mb-10 pb-6 sm:pb-10" style={{ borderBottom: '1px solid var(--a1)' }}>
                        <Link href={`/blog/${post.slug}`} className="group no-underline text-inherit block hover:no-underline">
                            <h2 className="text-lg sm:text-2xl font-light tracking-wide m-0 mb-1.5 sm:mb-2 transition-colors duration-300 group-hover:text-[var(--accent)]"
                                style={{ color: 'var(--t4)' }}>
                                {post.title}
                            </h2>
                            <p className="text-[9px] sm:text-xs mb-3 sm:mb-4 tracking-[0.1em] font-light" style={{ color: 'var(--t2)' }}>
                                {post.date}
                            </p>
                            <p className="leading-relaxed text-xs sm:text-sm mb-4 sm:mb-6 font-light" style={{ color: 'var(--t3)' }}>
                                {post.excerpt}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-light tracking-[0.15em] transition-colors duration-300 group-hover:text-[var(--accent)]"
                                style={{ color: 'var(--a4)' }}>
                                Read more →
                            </span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

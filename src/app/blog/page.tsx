import Link from "next/link";
import { getPosts } from "@/lib/posts";

// Force static generation (SSG)
export const dynamic = 'force-static';
export const revalidate = false;

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="max-w-[800px] mx-auto py-10 px-4 sm:py-16 sm:px-6 text-left w-full box-border">
            <h1 className="text-3xl sm:text-5xl mb-8 sm:mb-12 pb-4 sm:pb-6 border-b border-[#eee] tracking-tight">Blogs</h1>
            <div className="posts-list">
                {posts.map((post) => (
                    <div key={post.slug} className="mb-10 sm:mb-12 pb-10 sm:pb-12 border-b border-[#f0f0f0]">
                        <Link href={`/blog/${post.slug}`} className="no-underline text-inherit block mb-2 group">
                            <h2 className="text-[1.4rem] sm:text-[1.8rem] font-semibold tracking-tight m-0 transition-colors duration-200 group-hover:text-[#444]">{post.title}</h2>
                        </Link>
                        <p className="text-[#888] text-xs sm:text-sm mb-4 block">{post.date}</p>
                        <p className="leading-relaxed text-[#444] mb-6 text-[0.98rem] sm:text-[1.05rem]">{post.excerpt}</p>
                        <Link href={`/blog/${post.slug}`} className="no-underline font-semibold text-black border-b border-black pb-0.5 transition-opacity duration-200 hover:opacity-70">
                            Read more →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

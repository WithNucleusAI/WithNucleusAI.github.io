import Link from "next/link";
import { getPosts } from "@/lib/posts";

export const dynamic = 'force-static';
export const revalidate = false;

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="max-w-2xl mx-auto py-10 px-5 sm:py-20 sm:px-6 text-left w-full box-border select-text">
            <h1 className="text-xl sm:text-3xl mb-8 sm:mb-14 pb-4 sm:pb-6 font-bold tracking-[0.04em] text-black dark:text-white border-b border-black/[0.06] dark:border-white/[0.04]">
                Blog
            </h1>
            <div>
                {posts.map((post, i) => (
                    <div key={post.slug} className="mb-0">
                        <Link href={`/blog/${post.slug}`} className="group no-underline text-inherit block hover:no-underline">
                            <div className="py-5 sm:py-6 border-b border-black/[0.04] dark:border-white/[0.04] group-hover:border-black/10 dark:group-hover:border-white/8 transition-all duration-300 group-hover:pl-2 sm:group-hover:pl-3">
                                <div className="flex items-baseline gap-3 sm:gap-5 mb-1.5 sm:mb-2">
                                    <span className="text-[9px] sm:text-[10px] font-mono tabular-nums text-black/12 dark:text-white/10 shrink-0 w-5">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <h2 className="text-[14px] sm:text-base font-medium text-black/70 dark:text-white/65 group-hover:text-black dark:group-hover:text-white transition-colors leading-snug">
                                        {post.title}
                                    </h2>
                                </div>
                                <div className="flex items-baseline gap-3 sm:gap-5">
                                    <span className="w-5 shrink-0" />
                                    <p className="text-[11px] sm:text-xs text-black/25 dark:text-white/20 font-mono tabular-nums">
                                        {post.date}
                                    </p>
                                </div>
                                <p className="mt-2 text-[12px] sm:text-[13px] line-clamp-2 font-light leading-relaxed text-black/35 dark:text-white/30 pl-8 sm:pl-[40px]">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

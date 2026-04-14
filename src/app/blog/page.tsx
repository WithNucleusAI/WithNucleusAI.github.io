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
                    <div key={post.slug} className="py-5 sm:py-6 border-b border-black/[0.06] dark:border-white/[0.06]">
                        <div className="flex items-start gap-3 sm:gap-5">
                            <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-black/25 dark:text-white/20 pt-0.5 shrink-0 w-5">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-[14px] sm:text-base font-medium text-black/75 dark:text-white/70 leading-snug mb-1.5">
                                    {post.title}
                                </h2>
                                <span className="text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-black/30 dark:text-white/25">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

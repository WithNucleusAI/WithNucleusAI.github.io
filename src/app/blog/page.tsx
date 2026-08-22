import { getPosts } from "@/lib/posts";

export const dynamic = 'force-static';
export const revalidate = false;

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="max-w-2xl mx-auto py-10 px-5 sm:py-20 sm:px-6 text-left w-full box-border select-text">
            <div className="mb-8 sm:mb-14 pb-6 sm:pb-8 border-b border-surface-25">
                <span className="eyebrow text-surface-50 block mb-4">The Journal</span>
                <h1 className="text-[44px] sm:text-[66px] font-semibold leading-[1] tracking-[-0.02em] text-pink">
                    Blog
                </h1>
            </div>
            <div>
                {posts.map((post, i) => (
                    <div key={post.slug} className="py-5 sm:py-6 border-b border-surface-25">
                        <div className="flex items-start gap-3 sm:gap-5">
                            <span className="text-[12px] sm:text-[13px] font-mono tabular-nums text-pink/70 pt-1 shrink-0 w-5">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-[16px] sm:text-[19px] font-medium text-white leading-snug mb-1.5 tracking-[-0.011em]">
                                    {post.title}
                                </h2>
                                <span className="text-[13px] sm:text-[14px] text-surface-50">
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

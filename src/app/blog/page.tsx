import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="blog-container">
            <h1>Blog</h1>
            <div className="posts-list">
                {posts.map((post) => (
                    <div key={post.slug} className="post-card">
                        <Link href={`/blog/${post.slug}`} className="post-title">
                            <h2>{post.title}</h2>
                        </Link>
                        <p className="post-date">{post.date}</p>
                        <p className="post-excerpt">{post.excerpt}</p>
                        <Link href={`/blog/${post.slug}`} className="read-more">
                            Read more →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

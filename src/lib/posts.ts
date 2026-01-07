import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Post = {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
};

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export async function getPosts(): Promise<Post[]> {
    // Ensure the directory exists
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");

            const { data, content } = matter(fileContents);

            return {
                slug,
                title: data.title || "Untitled",
                date: data.date || "",
                excerpt: data.excerpt || "",
                content: content,
            } as Post;
        });

    // Sort by date desc
    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
        return undefined;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
        slug,
        title: data.title || "Untitled",
        date: data.date || "",
        excerpt: data.excerpt || "",
        content: content,
    } as Post;
}

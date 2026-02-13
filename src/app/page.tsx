import Typewriter from "@/components/Typewriter";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full">
      <section className="min-h-[calc(100svh-6rem)] relative flex flex-col justify-center items-center w-full overflow-hidden">
        <Typewriter />
        <ScrollDownButton />
      </section>

      <BlogSection posts={recentPosts} />
    </main>
  );
}
import IntroOverlay from "@/components/IntroOverlay";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";
import EscherBackground from "@/components/EscherBackground";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full">
      <IntroOverlay />
      <EscherBackground />
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full overflow-hidden">
        <div className="w-full flex flex-col items-center -translate-y-12 sm:!-translate-y-12 lg:!-translate-y-16">
          <div style={{ fontSize: 'clamp(1.8rem, 6vw, 4rem)' }} className="mx-auto w-full max-w-[50vw] sm:max-w-xl px-2 mb-10  sm:px-4 text-center final-text">
            <span>NUCLEUS.</span>
          </div>
        </div>
        <ScrollDownButton />
      </section>

      <BlogSection posts={recentPosts} />
    </main>
  );
}
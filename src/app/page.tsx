import IntroOverlay from "@/components/IntroOverlay";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";
import EscherBackground from "@/components/EscherBackground";
import Typewriter from "@/components/Typewriter";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full">
      <IntroOverlay />
      <EscherBackground />
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full overflow-hidden">
        <div className="w-full flex flex-col items-center -translate-y-12 sm:!-translate-y-12 lg:!-translate-y-16">
          <Typewriter />
        </div>
        <ScrollDownButton />
      </section>

      <section className="min-h-[60vh] flex flex-col justify-center items-center px-6 sm:px-12 max-w-5xl mx-auto py-24 text-center z-10 relative">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl leading-[1.3] sm:leading-[1.4] font-medium text-gray-900 dark:text-gray-100 tracking-tight">
          We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
        </h2>
      </section>

      <BlogSection posts={recentPosts} />
    </main>
  );
}
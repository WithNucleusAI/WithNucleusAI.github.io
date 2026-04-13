import IntroOverlay from "@/components/IntroOverlay";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";
import EscherImage from "@/components/EscherImage";
import Typewriter from "@/components/Typewriter";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full relative">
      <IntroOverlay />
      <EscherImage />

      {/* Hero */}
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full overflow-hidden">
        <div className="relative w-full flex flex-col items-center mt-10 sm:mt-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16">
          <Typewriter />
        </div>
        <ScrollDownButton />
      </section>

      {/* Divider */}
      <div className="relative w-full flex justify-center py-6 sm:py-10" aria-hidden="true">
        <div className="w-px h-12 sm:h-16 bg-black/8 dark:bg-white/8" />
      </div>

      {/* Mission */}
      <section id="intro-section" className="min-h-[45vh] sm:min-h-[60vh] flex flex-col justify-center items-center px-6 sm:px-12 max-w-2xl mx-auto py-12 sm:py-24 text-center z-10 relative">
        <div className="w-full border-t border-black/6 dark:border-white/6 pt-6 sm:pt-8">
          <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-black/25 dark:text-white/25 mb-5 sm:mb-7">About</p>
          <h2 className="text-sm sm:text-xl lg:text-2xl leading-[1.8] sm:leading-[1.75] font-light text-black/60 dark:text-white/60">
            We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
          </h2>
        </div>
      </section>

      {/* Divider */}
      <div className="relative w-full flex justify-center py-4 sm:py-8" aria-hidden="true">
        <div className="w-12 sm:w-16 h-px bg-black/8 dark:bg-white/8" />
      </div>

      <BlogSection posts={recentPosts} />

      {/* Pre-footer spacer */}
      <div className="py-8 sm:py-14" />
    </main>
  );
}

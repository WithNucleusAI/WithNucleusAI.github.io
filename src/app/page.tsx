import IntroOverlay from "@/components/IntroOverlay";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";
import EscherImage from "@/components/EscherImage";
import Typewriter from "@/components/Typewriter";
import Image from "next/image";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full relative">
      <IntroOverlay />

      {/* Hero */}
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full">
        {/* Logo — prominent brand mark */}
        <div className="mb-8 sm:mb-10">
          <Image
            src="/logo.webp"
            alt="Nucleus"
            width={80}
            height={80}
            className="w-12 h-12 sm:w-16 sm:h-16 invert dark:invert-0 opacity-80"
            priority
          />
        </div>
        <Typewriter />
        <ScrollDownButton />
      </section>

      {/* Hands illustration */}
      <section className="relative w-full flex justify-center items-center pt-0 pb-4 sm:pb-8 -mt-8 sm:-mt-12 overflow-hidden">
        <EscherImage />
      </section>

      {/* About */}
      <section id="intro-section" className="flex flex-col justify-center items-center px-6 sm:px-12 max-w-2xl mx-auto py-10 sm:py-16 text-center">
        <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-black/20 dark:text-white/20 mb-4 sm:mb-6">About</p>
        <h2 className="text-sm sm:text-lg lg:text-xl leading-[1.8] sm:leading-[1.8] font-light text-black/50 dark:text-white/50">
          We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
        </h2>
      </section>

      {/* Divider */}
      <div className="relative w-full flex justify-center py-6 sm:py-10" aria-hidden="true">
        <div className="w-10 sm:w-14 h-px bg-black/5 dark:bg-white/5" />
      </div>

      <BlogSection posts={recentPosts} />

      <div className="py-6 sm:py-10" />
    </main>
  );
}

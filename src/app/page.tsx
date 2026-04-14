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
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full px-6">
        {/* Logo mark — centered, commanding */}
        <div className="mb-10 sm:mb-12">
          <Image
            src="/logo.webp"
            alt="Nucleus"
            width={80}
            height={80}
            className="w-14 h-14 sm:w-20 sm:h-20 invert dark:invert-0 opacity-70"
            priority
          />
        </div>

        <Typewriter />

        <ScrollDownButton />
      </section>

      {/* Hands illustration — visual anchor */}
      <section className="relative w-full flex justify-center items-center pb-4 sm:pb-8 -mt-10 sm:-mt-16 overflow-hidden">
        <EscherImage />
      </section>

      {/* About */}
      <section id="intro-section" className="px-6 sm:px-12 max-w-xl mx-auto py-12 sm:py-20 text-center">
        <div className="inline-block mb-5 sm:mb-7">
          <span className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-black/20 dark:text-white/15 border border-black/8 dark:border-white/6 px-3 py-1">
            About
          </span>
        </div>
        <p className="text-[13px] sm:text-base lg:text-lg leading-[1.9] sm:leading-[1.85] font-light text-black/45 dark:text-white/45">
          We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
        </p>
      </section>

      {/* Divider */}
      <div className="flex justify-center py-8 sm:py-12" aria-hidden="true">
        <div className="w-[1px] h-10 sm:h-14 bg-black/[0.04] dark:bg-white/[0.04]" />
      </div>

      <BlogSection posts={recentPosts} />

      <div className="py-8 sm:py-12" />
    </main>
  );
}

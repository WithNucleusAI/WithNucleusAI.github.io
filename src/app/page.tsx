import IntroOverlay from "@/components/IntroOverlay";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";
import EscherImage from "@/components/EscherImage";
import Typewriter from "@/components/Typewriter";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full relative">
      <IntroOverlay />

      {/* ═══ Hero ═══ */}
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full px-6">
        {/* Logo — large, centered, the first thing you see */}
        <div className="mb-10 sm:mb-14">
          <Image
            src="/logo.webp"
            alt="Nucleus"
            width={120}
            height={120}
            className="w-16 h-16 sm:w-24 sm:h-24 invert dark:invert-0 opacity-60"
            priority
          />
        </div>

        <Typewriter />

        <ScrollDownButton />

        {/* Subtle gradient aura behind hero — barely visible depth */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10" aria-hidden="true">
          <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full opacity-[0.025] dark:opacity-[0.03] bg-[radial-gradient(circle,currentColor_0%,transparent_70%)] text-black dark:text-white" />
        </div>
      </section>


      {/* ═══ Hands illustration ═══ */}
      <section className="relative w-full flex justify-center items-center py-8 sm:py-24 overflow-hidden">
        <EscherImage />
      </section>

      {/* ═══ About ═══ */}
      <section id="intro-section" className="px-5 sm:px-12 max-w-xl mx-auto py-10 sm:py-24 text-center">
        <ScrollReveal>
          <div className="inline-block mb-6 sm:mb-8">
            <span className="text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-black/20 dark:text-white/15 border border-black/8 dark:border-white/6 px-3 py-1">
              About
            </span>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-[13px] sm:text-base lg:text-lg leading-[1.9] sm:leading-[1.85] font-light text-black/45 dark:text-white/45">
            We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
          </p>
        </ScrollReveal>
      </section>


      {/* ═══ Blog ═══ */}
      <BlogSection posts={recentPosts} />

      <div className="py-8 sm:py-12" />
    </main>
  );
}

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
            className="w-16 h-16 sm:w-24 sm:h-24 opacity-70"
            priority
          />
        </div>

        <Typewriter />

        <ScrollDownButton />

        {/* Soft gradient aura behind hero — lit from within, no shadows */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10" aria-hidden="true">
          <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full opacity-[0.06] bg-[radial-gradient(circle,#0ae448_0%,#00bae2_40%,transparent_70%)]" />
        </div>
      </section>


      {/* ═══ Hands illustration ═══ */}
      <section className="relative w-full flex justify-center items-center py-8 sm:py-24 overflow-hidden">
        <EscherImage />
      </section>

      {/* ═══ About ═══ */}
      <section id="intro-section" className="px-5 sm:px-12 max-w-2xl mx-auto py-12 sm:py-28 text-center">

        <ScrollReveal>
          <p className="eyebrow text-surface-50 mb-8 sm:mb-12 block">Why Nucleus</p>
          <p className="text-[15px] sm:text-[19px] leading-[1.6] sm:leading-[1.7] text-white/75 mb-4 sm:mb-7">
            Systems with very simple rules can produce unexpectedly complex behavior when scaled.
          </p>
          <div className="space-y-1.5 sm:space-y-2 mb-5 sm:mb-7">
            <p className="text-[13px] sm:text-base text-surface-50">Ants — individually dumb, colony = <span className="text-pink">intelligent</span></p>
            <p className="text-[13px] sm:text-base text-surface-50">Neurons — individually simple, brain = <span className="text-lilac">consciousness</span></p>
            <p className="text-[13px] sm:text-base text-surface-50">Transformers — simple next-token prediction = <span className="text-blue">intelligence-like behavior</span></p>
          </div>
          <p className="text-[19px] sm:text-[28px] font-semibold tracking-[-0.011em] text-white mb-10 sm:mb-16">This is the idea of emergence.</p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="text-[15px] sm:text-[19px] leading-[1.6] sm:leading-[1.7] text-white/75 mb-10 sm:mb-16">
            Ada Lovelace saw that a simple computational substrate could represent <span className="font-medium text-orangey">logic</span> and all forms of <span className="font-medium text-blue">memory</span>. Turing and his peers saw that logic itself could construct an <span className="font-medium text-lilac">initial state of mind</span> — and a reward-driven process that enables <span className="font-medium text-light-green">learning</span>.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-[15px] sm:text-[19px] leading-[1.6] sm:leading-[1.7] text-white/75 mb-3 sm:mb-5">
            The next step function in general intelligence will not come from a fictional design yet to be found.
          </p>
          <p className="text-[21px] sm:text-[33px] leading-[1.25] font-semibold tracking-[-0.011em] text-white mb-4 sm:mb-7">
            It will come from a better arrangement of the building blocks already at hand.
          </p>
          <p className="text-[13px] sm:text-base leading-[1.6] sm:leading-[1.7] text-surface-50">
            We are engineering a core commodity that scales beautifully on its own — where and how it fits in the world are fundamental factors of its design.
          </p>
        </ScrollReveal>

      </section>

      <div className="max-w-2xl mx-auto w-full px-5 sm:px-6">
        <div className="hairline" />
      </div>

      {/* ═══ Blog ═══ */}
      <BlogSection posts={recentPosts} />

      <div className="py-8 sm:py-12" />
    </main>
  );
}

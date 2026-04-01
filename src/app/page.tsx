import IntroOverlay from "@/components/IntroOverlay";
import ScrollDownButton from "@/components/ScrollDownButton";
import BlogSection from "@/components/BlogSection";
import { getPosts } from "@/lib/posts";
import EscherImage from "@/components/EscherImage";
import SubtleParticles from "@/components/SubtleParticles";
import MatrixRain from "@/components/MatrixRain";
import Typewriter from "@/components/Typewriter";

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = posts.slice(0, 3);

  return (
    <main className="w-full relative">
      <IntroOverlay />
      <MatrixRain />
      <SubtleParticles />
      <EscherImage />

      {/* Hero */}
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full overflow-hidden">
        <div className="relative w-full flex flex-col items-center mt-10 sm:mt-14 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16">
          {/* Gradient spotlight — responsive */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="w-[280px] h-[220px] sm:w-[600px] sm:h-[400px] lg:w-[900px] lg:h-[550px] rounded-full opacity-[0.06] dark:opacity-[0.15] blur-[80px] sm:blur-[140px]"
              style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, var(--accent-glow) 40%, transparent 70%)' }} />
          </div>

          {/* Equation above title */}
          <div className="mb-4 sm:mb-6 text-[rgba(79,124,255,0.18)] dark:text-[rgba(79,124,255,0.25)] text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] font-light" aria-hidden="true">
            Σᵢ ∇f(xᵢ) → 0
          </div>

          <Typewriter />
        </div>
        <ScrollDownButton />
      </section>

      {/* ── Section divider ── */}
      <div className="relative w-full flex justify-center py-2 sm:py-4" aria-hidden="true">
        <div className="w-px h-12 sm:h-16 bg-gradient-to-b from-transparent via-[rgba(79,124,255,0.12)] to-transparent" />
      </div>

      {/* Mission */}
      <section id="intro-section" className="min-h-[60vh] sm:min-h-[80vh] flex flex-col justify-center items-center px-5 sm:px-12 max-w-3xl mx-auto py-12 sm:py-28 text-center z-10 relative">
        <h2 className="text-lg sm:text-3xl lg:text-4xl leading-[1.6] sm:leading-[1.55] font-extralight text-gray-700 dark:text-[rgba(255,255,255,0.55)] tracking-wide relative">
          We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
        </h2>

        <div className="mt-8 sm:mt-12 flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-8 sm:w-10 h-px bg-[rgba(79,124,255,0.15)]" />
          <span className="text-[8px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-[rgba(79,124,255,0.2)] dark:text-[rgba(79,124,255,0.22)] font-light">
            ∂ℒ/∂θ → 0
          </span>
        </div>
      </section>

      {/* ── Section divider ── */}
      <div className="relative w-full flex flex-col items-center py-4 sm:py-8" aria-hidden="true">
        <div className="w-px h-12 sm:h-20 bg-gradient-to-b from-transparent via-[rgba(79,124,255,0.10)] to-transparent" />
        <div className="mt-2 sm:mt-4 text-[7px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] text-[rgba(79,124,255,0.15)] dark:text-[rgba(79,124,255,0.18)] font-light">
          ∫₀^∞ f(t) dt
        </div>
      </div>

      <BlogSection posts={recentPosts} />

      {/* ── Pre-footer equation ── */}
      <div className="relative w-full flex flex-col items-center py-10 sm:py-16" aria-hidden="true">
        <div className="w-8 sm:w-10 h-px bg-[rgba(79,124,255,0.10)]" />
        <div className="mt-3 sm:mt-4 text-[7px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.35em] text-[rgba(79,124,255,0.12)] dark:text-[rgba(79,124,255,0.15)] font-light">
          lim(n→∞) Σ 1/n² = π²/6
        </div>
      </div>
    </main>
  );
}

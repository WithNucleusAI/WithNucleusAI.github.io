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

      {/* ═══ Hero ═══ */}
      <section className="h-svh sm:-mt-28 relative flex flex-col justify-center items-center w-full overflow-hidden">
        <div className="relative w-full flex flex-col items-center mt-10 sm:mt-16 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16">
          {/* Gradient spotlight */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="w-[280px] h-[200px] sm:w-[600px] sm:h-[400px] lg:w-[800px] lg:h-[500px] rounded-full dark:opacity-[0.12] blur-[80px] sm:blur-[120px]"
              style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, var(--a1) 50%, transparent 70%)' }} />
          </div>

          {/* Equation */}
          <div className="mb-4 sm:mb-6 text-[8px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] font-light" style={{ color: 'var(--a3)' }} aria-hidden="true">
            Σᵢ ∇f(xᵢ) → 0
          </div>

          <Typewriter />
        </div>
        <ScrollDownButton />
      </section>

      {/* ── Divider ── */}
      <div className="relative w-full flex justify-center py-2 sm:py-4" aria-hidden="true">
        <div className="w-px h-10 sm:h-16 bg-gradient-to-b from-transparent to-transparent" style={{ '--tw-gradient-via': 'var(--a2)' } as React.CSSProperties} />
      </div>

      {/* ═══ Mission ═══ */}
      <section id="intro-section" className="min-h-[55vh] sm:min-h-[75vh] flex flex-col justify-center items-center px-5 sm:px-12 max-w-3xl mx-auto py-10 sm:py-24 text-center z-10 relative">
        <h2 className="text-lg sm:text-3xl lg:text-4xl leading-[1.6] sm:leading-[1.55] font-extralight tracking-wide relative" style={{ color: 'var(--t3)' }}>
          We design systems that shape tomorrow. Exploring the frontiers of software, artificial intelligence, and resilient architectures to build the foundations of modern engineering.
        </h2>

        <div className="mt-6 sm:mt-10 flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-8 sm:w-10 h-px" style={{ background: 'var(--a2)' }} />
          <span className="text-[8px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] font-light" style={{ color: 'var(--a3)' }}>
            ∂ℒ/∂θ → 0
          </span>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative w-full flex flex-col items-center py-3 sm:py-6" aria-hidden="true">
        <div className="w-px h-10 sm:h-16 bg-gradient-to-b from-transparent to-transparent" style={{ '--tw-gradient-via': 'var(--a2)' } as React.CSSProperties} />
        <div className="mt-2 sm:mt-3 text-[7px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] font-light" style={{ color: 'var(--t1)' }}>
          ∫₀^∞ f(t) dt
        </div>
      </div>

      <BlogSection posts={recentPosts} />

      {/* ── Pre-footer ── */}
      <div className="relative w-full flex flex-col items-center py-8 sm:py-14" aria-hidden="true">
        <div className="w-8 sm:w-10 h-px" style={{ background: 'var(--a1)' }} />
        <div className="mt-2 sm:mt-3 text-[7px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.35em] font-light" style={{ color: 'var(--t1)' }}>
          lim(n→∞) Σ 1/n² = π²/6
        </div>
      </div>
    </main>
  );
}

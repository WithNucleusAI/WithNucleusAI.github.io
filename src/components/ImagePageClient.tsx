'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import PerformanceVsEfficiencyApp from '@/components/performance-vs-efficiency/PerformanceVsEfficiencyApp'
import { ArchitectureFlowchart } from '@/components/performance-vs-efficiency/components/architecture-flowchart'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

// All shortlisted images with natural aspect ratios
// ratio = width/height — used for masonry sizing
type Img = { src: string; ratio: number; category: string }

const ALL_IMAGES: Img[] = [
  // Close-up Portraits (Real)
  { src: '/shortlisted/Close-up_Portraits__Real__56.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__57.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__58.jpeg', ratio: 0.39, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__59.webp', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__60.jpeg', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__61.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__62.jpeg', ratio: 0.59, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__63.webp', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__64.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__65.jpeg', ratio: 0.52, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__66.jpeg', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__67.jpeg', ratio: 0.71, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Real__68.jpeg', ratio: 1.40, category: 'Portraits' },

  // Close-up Portraits (Synthetic)
  { src: '/shortlisted/Close-up_Portraits__Syn__39.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__40.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__41.jpeg', ratio: 1.55, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__42.jpeg', ratio: 1.67, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__43.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__44.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__45.jpeg', ratio: 0.72, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__46.png', ratio: 1, category: 'Portraits' },
  { src: '/shortlisted/Close-up_Portraits__Syn__47.png', ratio: 1, category: 'Portraits' },

  // Art & Artists
  { src: '/shortlisted/Art___Artists_18.png', ratio: 1, category: 'Art' },
  { src: '/shortlisted/Art___Artists_19.jpeg', ratio: 0.32, category: 'Art' },
  { src: '/shortlisted/Art___Artists_20.jpeg', ratio: 0.59, category: 'Art' },
  { src: '/shortlisted/Art___Artists_21.png', ratio: 1, category: 'Art' },
  { src: '/shortlisted/Art___Artists_22.png', ratio: 1, category: 'Art' },

  // Cartoon & Ghibli
  { src: '/shortlisted/Cartoon___Ghibli_23.webp', ratio: 1, category: 'Cartoon' },
  { src: '/shortlisted/Cartoon___Ghibli_24.jpeg', ratio: 0.41, category: 'Cartoon' },
  { src: '/shortlisted/Cartoon___Ghibli_25.png', ratio: 1, category: 'Cartoon' },
  { src: '/shortlisted/Cartoon___Ghibli_26.png', ratio: 1, category: 'Cartoon' },
  { src: '/shortlisted/Cartoon___Ghibli_27.png', ratio: 1, category: 'Cartoon' },
  { src: '/shortlisted/Cartoon___Ghibli_28.png', ratio: 1, category: 'Cartoon' },

  // Complex Subjects
  { src: '/shortlisted/Complex_Subjects_33.png', ratio: 1, category: 'Complex' },
  { src: '/shortlisted/Complex_Subjects_34.webp', ratio: 1, category: 'Complex' },
  { src: '/shortlisted/Complex_Subjects_35.jpeg', ratio: 1.35, category: 'Complex' },
  { src: '/shortlisted/Complex_Subjects_36.png', ratio: 1, category: 'Complex' },
  { src: '/shortlisted/Complex_Subjects_37.jpeg', ratio: 1, category: 'Complex' },
  { src: '/shortlisted/Complex_Subjects_38.png', ratio: 1, category: 'Complex' },

  // Intricate Renders
  { src: '/shortlisted/Intricate_Renders_01.jpeg', ratio: 2.02, category: 'Renders' },
  { src: '/shortlisted/Intricate_Renders_02.jpeg', ratio: 0.65, category: 'Renders' },
  { src: '/shortlisted/Intricate_Renders_03.png', ratio: 1, category: 'Renders' },
  { src: '/shortlisted/Intricate_Renders_04.jpeg', ratio: 0.72, category: 'Renders' },
  { src: '/shortlisted/Intricate_Renders_05.jpeg', ratio: 0.64, category: 'Renders' },

  // Branding
  { src: '/shortlisted/Branding_06.webp', ratio: 1, category: 'Branding' },
  { src: '/shortlisted/Branding_07.jpeg', ratio: 0.76, category: 'Branding' },
  { src: '/shortlisted/Branding_08.png', ratio: 1, category: 'Branding' },
  { src: '/shortlisted/Branding_09.jpeg', ratio: 1.45, category: 'Branding' },
  { src: '/shortlisted/Branding_10.png', ratio: 1, category: 'Branding' },
  { src: '/shortlisted/Branding_11.png', ratio: 1, category: 'Branding' },

  // Nature (Real)
  { src: '/shortlisted/Nature__Real__29.png', ratio: 1, category: 'Nature' },
  { src: '/shortlisted/Nature__Real__30.jpeg', ratio: 0.49, category: 'Nature' },
  { src: '/shortlisted/Nature__Real__31.png', ratio: 1, category: 'Nature' },
  { src: '/shortlisted/Nature__Real__32.png', ratio: 1, category: 'Nature' },

  // Nature (Synthetic)
  { src: '/shortlisted/Nature__Syn__48.jpeg', ratio: 1.82, category: 'Nature' },
  { src: '/shortlisted/Nature__Syn__49.jpeg', ratio: 0.74, category: 'Nature' },

  // Food
  { src: '/shortlisted/Food_50.jpeg', ratio: 1.54, category: 'Food' },
  { src: '/shortlisted/Food_51.jpeg', ratio: 0.85, category: 'Food' },
  { src: '/shortlisted/Food_52.jpeg', ratio: 0.37, category: 'Food' },
  { src: '/shortlisted/Food_53.png', ratio: 1, category: 'Food' },
  { src: '/shortlisted/Food_54.png', ratio: 1, category: 'Food' },
  { src: '/shortlisted/Food_55.png', ratio: 1, category: 'Food' },

  // Text
  { src: '/shortlisted/Text_69.jpeg', ratio: 0.71, category: 'Text' },
  { src: '/shortlisted/Text_70.png', ratio: 1, category: 'Text' },
  { src: '/shortlisted/Text_71.png', ratio: 1, category: 'Text' },
  { src: '/shortlisted/Text_72.jpeg', ratio: 1, category: 'Text' },

  // Vehicles & Buildings
  { src: '/shortlisted/Vehicles___Buildings_12.jpeg', ratio: 1, category: 'Architecture' },
  { src: '/shortlisted/Vehicles___Buildings_13.jpeg', ratio: 1, category: 'Architecture' },
  { src: '/shortlisted/Vehicles___Buildings_14.jpeg', ratio: 1, category: 'Architecture' },
  { src: '/shortlisted/Vehicles___Buildings_15.jpeg', ratio: 1.49, category: 'Architecture' },
  { src: '/shortlisted/Vehicles___Buildings_16.jpeg', ratio: 2.15, category: 'Architecture' },
  { src: '/shortlisted/Vehicles___Buildings_17.jpeg', ratio: 0.59, category: 'Architecture' },
]


export default function ImagePageClient() {
  const { setTheme, resolvedTheme } = useTheme()
  const prevThemeRef = typeof window !== 'undefined' ? window : null

  // Force dark mode on this page, restore on unmount
  useEffect(() => {
    const prev = resolvedTheme
    if (prev !== 'dark') setTheme('dark')
    return () => {
      if (prev && prev !== 'dark') setTheme(prev)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full min-h-screen overflow-hidden sm:-mt-48">
      <div className="fixed inset-0 bg-black -z-50" />

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <motion.h1
          className="text-3xl sm:text-7xl lg:text-8xl font-bold tracking-[0.15em] sm:tracking-[0.20em] text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
        >
          Nucleus Image
        </motion.h1>

        <motion.div
          className="mt-6 sm:mt-8 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="w-14 h-px bg-white/20" />
        </motion.div>

        <motion.div
          className="mt-8 sm:mt-10 flex flex-col items-center gap-6 sm:gap-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: EASE_OUT }}
        >
          <span className="px-5 py-2 text-[10px] sm:text-xs tracking-[0.25em] uppercase font-light border border-white/20 text-white/60">
            The 1st Sparse MoE Diffusion Transformer
          </span>

          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-light text-white/30">
            Leading Performance
          </span>

          <div className="flex items-center gap-5 sm:gap-12">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-3xl font-bold tracking-[0.08em] text-white">2B</span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/30 font-light mt-1">active params</span>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-3xl font-bold tracking-[0.08em] text-white">17B</span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/30 font-light mt-1">total params</span>
            </div>
            <div className="w-px h-10 bg-white/15" />
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-3xl font-bold tracking-[0.08em] text-white">64</span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/30 font-light mt-1">experts</span>
            </div>
          </div>
          {/* CTA buttons */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2">
            <a
              href="https://huggingface.co/NucleusAI/NucleusMoE-Image"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-black text-[10px] sm:text-xs tracking-[0.1em] font-semibold uppercase hover:bg-white/90 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Model
            </a>
            <a
              href="https://huggingface.co/blog/NucleusAI/nucleus-image"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border border-white/25 text-white/70 text-[10px] sm:text-xs tracking-[0.1em] font-medium uppercase hover:border-white/50 hover:text-white transition-all"
            >
              Read Blog &rarr;
            </a>
          </div>
        </motion.div>
      </section>

      {/* Model Description — right below hero */}
      <section className="relative z-10 -mt-8 sm:-mt-12 pb-6 px-6 sm:px-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-3 sm:gap-4">
          {[
            "Nucleus Image introduces the first sparse Mixture-of-Experts architecture to diffusion-based image generation — activating only 2B of 17B total parameters per forward pass.",
            "A custom Expert-Choice routing mechanism dynamically selects from 64 specialized experts plus one shared expert, enabling the model to allocate compute where it matters most.",
            "The architecture employs Grouped-Query Attention with adaptive modulation across 32 transformer blocks, achieving state-of-the-art quality at a fraction of the compute.",
            "Trained with a capacity factor schedule — 4.0 for early layers, tapering to 2.0 for deeper layers — learning efficient expert specialization without sacrificing diversity.",
            "The result: leading benchmark performance across DPG-Bench, GenEval, and overall quality metrics, at 10x parameter efficiency versus the nearest dense competitor.",
          ].map((text, i) => (
            <motion.p
              key={`desc-${i}`}
              className="text-xs sm:text-sm lg:text-base leading-[1.75] tracking-[0.03em]"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: i === 0 || i === 4 ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.40)',
              }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.06 }}
            >
              {text}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Benchmarks */}
      <section className="relative z-10 mt-8 sm:mt-12">
        <div className="max-w-5xl mx-auto py-10 px-4 sm:py-16 sm:px-8 text-left w-full box-border select-text">
          <PerformanceVsEfficiencyApp disableAmbientBackground />
        </div>
      </section>

      <div className="w-full flex flex-col items-center py-8 relative z-10" aria-hidden="true">
        <div className="w-px h-12 bg-white/10" />
      </div>

      {/* Architecture Flowchart — compact */}
      <section className="relative z-10 py-6 sm:py-10 overflow-hidden">
        <div className="max-w-2xl mx-auto px-2 sm:px-8">
          <ArchitectureFlowchart />
        </div>
      </section>


      {/* Disclaimer */}
      <div className="relative z-10 py-8 sm:py-12 text-center">
        <p className="text-[11px] text-white/40 tracking-wide">
          Performance scores are approximate from publicly available benchmarks.
        </p>
        <p className="mt-1.5 text-[10px] text-white/30 tracking-wide font-mono">
          Data compiled March 2026
        </p>
      </div>

      <div className="w-full flex flex-col items-center py-4 relative z-10" aria-hidden="true">
        <div className="w-px h-10 bg-white/10" />
      </div>

      {/* ═══ Gallery — All images, masonry, varied sizes ═══ */}
      <section className="px-3 sm:px-6 pb-20 sm:pb-32 relative z-10">
        <div className="max-w-7xl mx-auto mb-10 sm:mb-14 px-1">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.08em] text-white">
            Gallery
          </h2>
        </div>

        <div
          className="max-w-7xl mx-auto masonry-gallery"
          style={{
            columnCount: 4,
            columnGap: '8px',
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 1024px) {
              .masonry-gallery { column-count: 3 !important; }
            }
            @media (max-width: 640px) {
              .masonry-gallery { column-count: 2 !important; column-gap: 6px !important; }
            }
          `}} />
          {ALL_IMAGES.map((img, i) => (
            <motion.div
              key={`gallery-${i}`}
              className="mb-2 break-inside-avoid overflow-hidden border border-white/8 hover:border-white/30 transition-all duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-2%' }}
              transition={{ duration: 0.4, delay: (i % 8) * 0.03 }}
            >
              <img
                src={img.src}
                alt=""
                className="w-full h-auto block"
                style={{ imageRendering: 'auto' }}
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pre-footer */}
      <div className="w-full flex flex-col items-center py-16 relative z-10" aria-hidden="true">
        <div className="w-10 h-px bg-white/10" />
      </div>
    </div>
  )
}

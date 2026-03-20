'use client'

import { useRef, useEffect, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion'
import ImagePageScrollButton from '@/components/ImagePageScrollButton'

const MOUSE_FACTOR = 120
const HOVER_TRANSITION = {
  duration: 0.5,
  ease: [0.39, 0.575, 0.565, 1],
} as const
const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

interface ImageConfig {
  src: string
  left?: string
  right?: string
  top: string
  w: number
  h: number
  depth: number
  alpha: number
  mobileHidden?: boolean
}

const ORBIT_SECTION_COUNT = 4

// Positions modelled on the Getty Tracing Art hero composition:
// images frame the centered text, some bleed off edges, variable
// opacity gives depth, different parallax speeds create layers.
const artworks: ImageConfig[] = [
  // ── Hero screen (0 – 100vh) ──
  { src: '/image_samples/image (1).png', left: '3%', top: '18vh', w: 175, h: 235, depth: 0.35, alpha: 0.85 },
  { src: '/image_samples/image (2).webp', right: '2%', top: '4vh', w: 205, h: 150, depth: 0.55, alpha: 0.65 },
  { src: '/image_samples/image (3).webp', right: '5%', top: '52vh', w: 168, h: 128, depth: 0.4, alpha: 0.75 },
  { src: '/image_samples/image (4).webp', left: '14%', top: '64vh', w: 105, h: 142, depth: 0.28, alpha: 0.6, mobileHidden: true },
  { src: '/image_samples/image (6).webp', left: '46%', top: '84vh', w: 90, h: 90, depth: 0.45, alpha: 0.55, mobileHidden: true },
  { src: '/image_samples/image (7).webp', left: '-3%', top: '35vh', w: 80, h: 110, depth: 0.6, alpha: 0.35 },
  { src: '/image_samples/image (8).webp', right: '-2%', top: '70vh', w: 90, h: 72, depth: 0.3, alpha: 0.3, mobileHidden: true },
  { src: '/image_samples/image (9).webp', left: '1%', top: '84vh', w: 68, h: 96, depth: 0.2, alpha: 0.45 },
  { src: '/image_samples/image (10).webp', right: '0%', top: '16vh', w: 72, h: 92, depth: 0.5, alpha: 0.38, mobileHidden: true },
  { src: '/image_samples/image (11).webp', left: '44%', top: '7vh', w: 95, h: 65, depth: 0.15, alpha: 0.3 },
  { src: '/image_samples/image (14).webp', left: '20%', top: '25vh', w: 120, h: 120, depth: 0.7, alpha: 0.4, mobileHidden: true },
  { src: '/image_samples/image (15).webp', right: '15%', top: '85vh', w: 80, h: 120, depth: 0.8, alpha: 0.5 },

  // ── Below fold / transition (100 – 200vh) ──
  { src: '/image_samples/image (17).webp', left: '0%', top: '120vh', w: 142, h: 188, depth: 0.3, alpha: 0.7 },
  { src: '/image_samples/image (19).webp', right: '7%', top: '128vh', w: 172, h: 122, depth: 0.5, alpha: 0.6 },
  { src: '/image_samples/image (20).webp', left: '24%', top: '162vh', w: 108, h: 145, depth: 0.38, alpha: 0.5, mobileHidden: true },
  { src: '/image_samples/image (21).webp', right: '25%', top: '175vh', w: 110, h: 110, depth: 0.65, alpha: 0.45 },
  { src: '/image_samples/image (22).webp', left: '10%', top: '185vh', w: 140, h: 80, depth: 0.2, alpha: 0.55 },

  // ── Technical details (200 – 310vh) ──
  { src: '/image_samples/image (23).webp', right: '0%', top: '212vh', w: 155, h: 118, depth: 0.35, alpha: 0.62 },
  { src: '/image_samples/image (9).png', left: '2%', top: '238vh', w: 138, h: 184, depth: 0.45, alpha: 0.68 },
  { src: '/image_samples/image (10).png', right: '12%', top: '268vh', w: 118, h: 88, depth: 0.28, alpha: 0.45, mobileHidden: true },
  { src: '/image_samples/image (6).png', left: '28%', top: '275vh', w: 90, h: 130, depth: 0.5, alpha: 0.5 },
  { src: '/image_samples/image (7).png', right: '22%', top: '220vh', w: 100, h: 100, depth: 0.8, alpha: 0.35, mobileHidden: true },

  // ── Graphs area (300 – 430vh) ──
  { src: '/image_samples/image (4).png', left: '0%', top: '308vh', w: 148, h: 115, depth: 0.4, alpha: 0.58 },
  { src: '/image_samples/image (3).png', right: '4%', top: '338vh', w: 132, h: 175, depth: 0.55, alpha: 0.52 },
  { src: '/image_samples/image (2).png', left: '52%', top: '368vh', w: 98, h: 138, depth: 0.3, alpha: 0.42, mobileHidden: true },
  { src: '/image_samples/image (1).png', right: '0%', top: '395vh', w: 152, h: 112, depth: 0.48, alpha: 0.48 },
  { src: '/image_samples/image (2).webp', left: '15%', top: '340vh', w: 75, h: 75, depth: 0.25, alpha: 0.6 },
  { src: '/image_samples/image (3).webp', right: '15%', top: '405vh', w: 110, h: 150, depth: 0.65, alpha: 0.45, mobileHidden: true },
  { src: '/image_samples/image (4).webp', left: '25%', top: '415vh', w: 140, h: 110, depth: 0.35, alpha: 0.55 },
]

const benchmarks = [
  { label: 'Image Quality (FID)', nucleus: 95, baseline: 78 },
  { label: 'Generation Speed', nucleus: 92, baseline: 65 },
  { label: 'Style Diversity', nucleus: 88, baseline: 72 },
  { label: 'Resolution Fidelity', nucleus: 96, baseline: 80 },
]

const galleryColumns = [
  [
    '/image_samples/image (1).png',
    '/image_samples/image (4).webp',
    '/image_samples/image (17).webp',
    '/image_samples/image (21).webp',
    '/image_samples/image (10).png',
    '/image_samples/image (19).webp',
  ],
  [
    '/image_samples/image (2).webp',
    '/image_samples/image (6).webp',
    '/image_samples/image (9).png',
    '/image_samples/image (15).webp',
    '/image_samples/image (22).webp',
    '/image_samples/image (23).webp',
  ],
  [
    '/image_samples/image (3).webp',
    '/image_samples/image (7).webp',
    '/image_samples/image (8).webp',
    '/image_samples/image (14).webp',
    '/image_samples/image (20).webp',
    '/image_samples/image (11).webp',
  ]
]

// ────────────────────────────────────────────────────────────
// FloatingImage — mouse parallax + scroll parallax + hover
// No idle bobbing: Getty only moves images via mouse & scroll.
// Hover matches Getty exactly: scale(1.1) + opacity→1
// with 500ms cubic-bezier(.39,.575,.565,1).
// ────────────────────────────────────────────────────────────

function FloatingImage({
  config,
  mouseX,
  mouseY,
  pageProgress,
}: {
  config: ImageConfig
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  pageProgress: MotionValue<number>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [hoverOffset, setHoverOffset] = useState({ x: 0, y: 0 })

  const springOffsetX = useSpring(0, { stiffness: 100, damping: 20 })
  const springOffsetY = useSpring(0, { stiffness: 100, damping: 20 })

  useEffect(() => {
    springOffsetX.set(isHovered ? hoverOffset.x : 0)
    springOffsetY.set(isHovered ? hoverOffset.y : 0)
  }, [isHovered, hoverOffset, springOffsetX, springOffsetY])

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // Estimate boundaries after 1.4 scale
      const wDelta = (rect.width * 1.4 - rect.width) / 2
      const hDelta = (rect.height * 1.4 - rect.height) / 2
      
      const left = rect.left - wDelta
      const right = rect.right + wDelta
      const top = rect.top - hDelta
      const bottom = rect.bottom + hDelta

      let dx = 0
      let dy = 0
      const pad = 16 // 16px padding from viewport edges

      if (left < pad) dx = pad - left
      else if (right > window.innerWidth - pad) dx = window.innerWidth - pad - right

      if (top < pad) dy = pad - top
      else if (bottom > window.innerHeight - pad) dy = window.innerHeight - pad - bottom

      setHoverOffset({ x: dx, y: dy })
    }
  }

  const mx = useTransform(mouseX, (v) => v * config.depth * MOUSE_FACTOR)
  const rawMy = useTransform(mouseY, (v) => v * config.depth * MOUSE_FACTOR)

  const topVh = Number.parseFloat(config.top)
  const sectionIndex = Number.isFinite(topVh)
    ? Math.min(ORBIT_SECTION_COUNT - 1, Math.max(0, Math.floor(topVh / 110)))
    : 0
  const sectionStart = sectionIndex / ORBIT_SECTION_COUNT
  const sectionEnd = (sectionIndex + 1) / ORBIT_SECTION_COUNT
  const sectionProgress = useTransform(pageProgress, [sectionStart, sectionEnd], [0, 1])

  const sideSign = (config.w + config.h + config.src.length) % 2 === 0 ? 1 : -1
  const orbitRadius = 70 + config.depth * 110
  const orbitLift = 110 + config.depth * 190

  // Section orbit path: starts lower, sweeps to the side, then rises above copy blocks.
  const orbitX = useTransform(
    sectionProgress,
    [0, 0.42, 0.72, 1],
    [0, sideSign * orbitRadius, sideSign * orbitRadius * 0.45, sideSign * orbitRadius * 0.2],
  )
  const orbitY = useTransform(
    sectionProgress,
    [0, 0.3, 0.7, 1],
    [orbitLift * 0.42, orbitLift * 0.1, -orbitLift * 0.5, -orbitLift],
  )

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Keep a local vertical drift so each artwork still feels independent.
  const scrollShift = useTransform(
    scrollYProgress,
    [0, 1],
    [220 * config.depth, -220 * config.depth],
  )

  const rawRotation = useTransform(
    scrollYProgress,
    [0, 1],
    [-25 * config.depth, 25 * config.depth]
  )

  const hoverFactor = useSpring(0, { stiffness: 100, damping: 20 })
  useEffect(() => {
    hoverFactor.set(isHovered ? 1 : 0)
  }, [isHovered, hoverFactor])

  const finalRotation = useTransform(
    [rawRotation, hoverFactor],
    ([raw, hover]: number[]) => raw * (1 - hover)
  )

  const entryShift = useTransform(scrollYProgress, [0, 0.2], [100, 0])

  const combinedY = useTransform(
    [rawMy, scrollShift, entryShift, orbitY],
    ([mouse, scroll, entry, orbit]: number[]) => mouse + scroll + entry + orbit,
  )

  const finalX = useTransform([mx, springOffsetX, orbitX], ([m, h, orbit]: number[]) => m + h + orbit)
  const finalY = useTransform([combinedY, springOffsetY], ([c, h]: number[]) => c + h)

  const scrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.92, 1],
    [0, 1, 1, 0],
  )

  return (
    <motion.div
      ref={ref}
      className={`absolute ${config.mobileHidden ? 'hidden md:block' : ''}`}
      style={{
        left: config.left,
        right: config.right,
        top: config.top,
        width: config.w,
        height: config.h,
        x: finalX,
        y: finalY,
        rotate: finalRotation,
        opacity: scrollOpacity,
        zIndex: isHovered ? 10 : 0,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inner: handles hover (opacity restore + scale) */}
      <motion.div
        className="w-full h-full cursor-pointer overflow-hidden"
        initial={{ opacity: config.alpha, scale: 1 }}
        whileHover={{ opacity: 1, scale: 2 }}
        transition={HOVER_TRANSITION}
      >
        <img
          src={config.src}
          alt=""
          className="w-full h-full rounded-xl object-cover"
          draggable={false}
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────

export default function Page() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  // Lighter, quicker spring for smoother, more fascinating parallax
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 80, mass: 0.4 })
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 80, mass: 0.4 })

  const galleryRef = useRef<HTMLElement>(null)
  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ["start end", "end start"]
  })

  const pageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: pageProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end end'],
  })

  // Different translation speeds for masonry columns
  const y1 = useTransform(galleryProgress, [0, 1], [0, -400])
  const y2 = useTransform(galleryProgress, [0, 1], [200, 50])
  const y3 = useTransform(galleryProgress, [0, 1], [0, -250])
  const colTransforms = [y1, y2, y3]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mouseX, mouseY])

  return (
    <div ref={pageRef} className="relative w-full bg-white dark:bg-black text-foreground overflow-hidden sm:-mt-48">
      {/* ── Floating images (absolute, behind content) ── */}
      {artworks.map((config, i) => (
        <FloatingImage
          key={i}
          config={config}
          mouseX={smoothX}
          mouseY={smoothY}
          pageProgress={pageProgress}
        />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 pointer-events-none">
        {/* ═══ SECTION 1 — Hero ═══ */}
        <section id="image-hero" className="h-screen">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6">
            <motion.h1
              className=" text-[clamp(3.5rem,14vw,7rem)] leading-[0.92] tracking-[-0.03em] text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: EASE_OUT }}
            >
              Nucleus Image
            </motion.h1>

            <motion.p
              className="mt-5 md:mt-6 text-[11px] md:text-[13px] tracking-[0.2em] uppercase text-center max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              AI-Powered Image Generation
            </motion.p>


          </div>
        </section>

        {/* ═══ SECTION 2 — Technical Details ═══ */}
        <section id="image-technical" className="min-h-screen flex items-center justify-center px-6 md:px-8 py-32">
          <motion.div
            className="max-w-[42rem] text-center"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
          >
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.12] tracking-[-0.02em] mb-10">
              Built for the future of visual creation
            </h2>
            <p className="font-serif text-[clamp(0.9rem,1.8vw,1.1rem)] leading-[1.7] opacity-50">
              Nucleus Image leverages a state-of-the-art diffusion architecture
              with 3.2 billion parameters, trained on curated high-resolution
              datasets. Our proprietary attention mechanism enables unprecedented
              detail preservation at resolutions up to 2048&times;2048 pixels,
              while maintaining generation speeds under 2 seconds on consumer
              hardware.
            </p>
            <p className="font-serif text-[clamp(0.9rem,1.8vw,1.1rem)] leading-[1.7] opacity-50 mt-6">
              The model supports multi-modal conditioning through text, image,
              and sketch inputs, enabling precise creative control. Advanced
              style transfer capabilities allow seamless blending between
              artistic domains&mdash;from photorealistic to abstract, classical
              to contemporary.
            </p>
          </motion.div>
        </section>

        {/* ═══ SECTION 3 — Technical Graphs ═══ */}
        <section id="image-graphs" className="min-h-screen flex flex-col items-center justify-center px-6 md:px-8 py-32 gap-24">
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl w-full">
            {[
              { value: '2048', unit: 'px', label: 'Max Resolution' },
              { value: '1.2', unit: 's', label: 'Avg Generation' },
              { value: '3.2', unit: 'B', label: 'Parameters' },
              { value: '6.8', unit: '', label: 'FID Score' },
            ].map((m, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.8, ease: EASE_OUT }}
              >
                <div className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] tabular-nums leading-none">
                  {m.value}
                  <span className="text-[0.4em] opacity-40 ml-0.5">{m.unit}</span>
                </div>
                <div className="text-[10px] md:text-xs uppercase tracking-[0.18em] opacity-30 mt-3">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benchmark bars */}
          <div className="max-w-xl w-full space-y-8">
            <motion.h3
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] opacity-30 text-center mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.3 }}
              viewport={{ once: true }}
            >
              Benchmark Comparison
            </motion.h3>

            {benchmarks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: EASE_OUT }}
              >
                <div className="text-[10px] md:text-xs uppercase tracking-[0.12em] opacity-40 mb-2">
                  {item.label}
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex-1 h-[6px] bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-foreground rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.nucleus}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 1.2, ease: EASE_OUT }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums opacity-30 w-8 text-right">
                    {item.nucleus}
                  </span>
                </div>
                <div className="flex gap-3 items-center mt-1.5">
                  <div className="flex-1 h-[4px] bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-foreground/25 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.baseline}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 1.2, ease: EASE_OUT }}
                    />
                  </div>
                  <span className="text-[10px] tabular-nums opacity-20 w-8 text-right">
                    {item.baseline}
                  </span>
                </div>
              </motion.div>
            ))}

            <div className="flex gap-8 justify-center pt-6 text-[10px] md:text-xs opacity-25">
              <div className="flex items-center gap-2">
                <div className="w-5 h-[6px] bg-foreground rounded-full" />
                Nucleus Image
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-[4px] bg-foreground/25 rounded-full" />
                Baseline
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4 — Full Image Gallery ═══ */}
        <section id="image-gallery" ref={galleryRef} className="pt-32 pb-40 min-h-[150vh] pointer-events-auto relative">
          <motion.h2
            className="text-center font-serif text-[clamp(3rem,6vw,5rem)] tracking-[-0.02em] mb-12 z-20 relative w-full"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            Curated 
            <br className="" />
            Gallery
          </motion.h2>

          <div className="flex flex-row gap-3 md:gap-6 lg:gap-8 max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            {galleryColumns.map((col, colIndex) => (
              <motion.div
                key={colIndex}
                className={`flex-1 flex flex-col gap-3 md:gap-6 lg:gap-8`}
                style={{ y: colTransforms[colIndex] }}
              >
                {col.map((src, i) => (
                  <motion.div
                    key={i}
                    className="relative w-full overflow-hidden rounded-lg group isolate"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{
                      duration: 0.9,
                      ease: EASE_OUT,
                      delay: i * 0.1,
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-auto object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 group-hover:-rotate-1 will-change-transform"
                      loading="lazy"
                      draggable={false}
                    />
                    {/* Unique minute overlay animations */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                    <div className="absolute top-4 left-4 w-8 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left z-20 delay-100" />
                    <div className="absolute top-4 left-4 h-8 w-[1px] bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top z-20 delay-100" />
                    <div className="absolute bottom-4 right-4 w-8 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right z-20 delay-100" />
                    <div className="absolute bottom-4 right-4 h-8 w-[1px] bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-bottom z-20 delay-100" />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <ImagePageScrollButton />

      {/* Bottom hint
      <div className="fixed bottom-5 right-5 z-30 pointer-events-none">
        <p className="text-[10px] opacity-25 tracking-wide">
          Click on an artwork to learn more.
        </p>
      </div> */}
    </div>
  )
}


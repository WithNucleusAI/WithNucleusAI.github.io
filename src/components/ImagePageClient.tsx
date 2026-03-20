'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion'
import ImagePageScrollButton from '@/components/ImagePageScrollButton'
import BlogContent from '@/components/BlogContent'

const MOUSE_FACTOR = 120
const HOVER_TRANSITION = {
  duration: 0.5,
  ease: [0.39, 0.575, 0.565, 1],
} as const
const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const
const ORBIT_SECTION_COUNT = 6
const BASE_VIEWPORT_WIDTH = 1440

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

const IMAGE_POOL = [
  '/image_samples/image (1).png',
  '/image_samples/image (2).webp',
  '/image_samples/image (3).webp',
  '/image_samples/image (4).webp',
  '/image_samples/image (6).webp',
  '/image_samples/image (7).webp',
  '/image_samples/image (8).webp',
  '/image_samples/image (9).webp',
  '/image_samples/image (10).webp',
  '/image_samples/image (11).webp',
  '/image_samples/image (14).webp',
  '/image_samples/image (15).webp',
  '/image_samples/image (17).webp',
  '/image_samples/image (19).webp',
  '/image_samples/image (20).webp',
  '/image_samples/image (21).webp',
  '/image_samples/image (22).webp',
  '/image_samples/image (23).webp',
  '/image_samples/image (9).png',
  '/image_samples/image (10).png',
  '/image_samples/image (6).png',
  '/image_samples/image (7).png',
  '/image_samples/image (4).png',
  '/image_samples/image (3).png',
  '/image_samples/image (2).png',
]

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// Hand-tuned hero images (first viewport screen)
const HERO_IMAGES: ImageConfig[] = [
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
]

function generateDynamicImages(pageHeight: number, vh: number): ImageConfig[] {
  const startY = vh + 80
  const endY = pageHeight - vh * 0.3
  if (endY <= startY) return []

  const images: ImageConfig[] = []
  let y = startY
  let i = 0

  while (y < endY) {
    const r = (s: number) => seededRandom(i * 13 + s)
    const isLeft = i % 2 === 0
    const edgePct = r(1) * 15

    images.push({
      src: IMAGE_POOL[i % IMAGE_POOL.length],
      ...(isLeft ? { left: `${edgePct.toFixed(1)}%` } : { right: `${edgePct.toFixed(1)}%` }),
      top: `${Math.round(y)}px`,
      w: 72 + Math.floor(r(2) * 130),
      h: 72 + Math.floor(r(3) * 160),
      depth: 0.2 + r(4) * 0.6,
      alpha: 0.65 + r(5) * 0.4,
      mobileHidden: r(6) > 0.62,
    })

    y += 150 + r(7) * 190
    i++
  }

  return images
}

function topToPx(top: string, vh: number): number {
  const n = parseFloat(top)
  if (top.endsWith('px')) return n
  return (n / 100) * vh
}

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
  ],
]

// ────────────────────────────────────────────
// FloatingImage
// ────────────────────────────────────────────

function FloatingImage({
  config,
  mouseX,
  mouseY,
  pageProgress,
  pageHeight,
  viewportHeight,
}: {
  config: ImageConfig
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  pageProgress: MotionValue<number>
  pageHeight: number
  viewportHeight: number
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
      const wDelta = (rect.width * 1.4 - rect.width) / 2
      const hDelta = (rect.height * 1.4 - rect.height) / 2

      const left = rect.left - wDelta
      const right = rect.right + wDelta
      const top = rect.top - hDelta
      const bottom = rect.bottom + hDelta

      let dx = 0
      let dy = 0
      const pad = 16

      if (left < pad) dx = pad - left
      else if (right > window.innerWidth - pad) dx = window.innerWidth - pad - right

      if (top < pad) dy = pad - top
      else if (bottom > window.innerHeight - pad) dy = window.innerHeight - pad - bottom

      setHoverOffset({ x: dx, y: dy })
    }
  }

  const mx = useTransform(mouseX, (v) => v * config.depth * MOUSE_FACTOR)
  const rawMy = useTransform(mouseY, (v) => v * config.depth * MOUSE_FACTOR)

  const vh = viewportHeight || 900
  const topPx = topToPx(config.top, vh)
  const safeHeight = pageHeight > 0 ? pageHeight : vh * 10
  const normalizedPos = Math.min(1, Math.max(0, topPx / safeHeight))
  const sectionIndex = Math.min(
    ORBIT_SECTION_COUNT - 1,
    Math.max(0, Math.floor(normalizedPos * ORBIT_SECTION_COUNT)),
  )

  const sectionStart = sectionIndex / ORBIT_SECTION_COUNT
  const sectionEnd = (sectionIndex + 1) / ORBIT_SECTION_COUNT
  const sectionProgress = useTransform(pageProgress, [sectionStart, sectionEnd], [0, 1])

  const sideSign = (config.w + config.h + config.src.length) % 2 === 0 ? 1 : -1
  const orbitRadius = 70 + config.depth * 110
  const orbitLift = 110 + config.depth * 190

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

  const scrollShift = useTransform(
    scrollYProgress,
    [0, 1],
    [220 * config.depth, -220 * config.depth],
  )

  const rawRotation = useTransform(
    scrollYProgress,
    [0, 1],
    [-25 * config.depth, 25 * config.depth],
  )

  const hoverFactor = useSpring(0, { stiffness: 100, damping: 20 })
  useEffect(() => {
    hoverFactor.set(isHovered ? 1 : 0)
  }, [isHovered, hoverFactor])

  const finalRotation = useTransform(
    [rawRotation, hoverFactor],
    ([raw, hover]: number[]) => raw * (1 - hover),
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

  const minRem = Math.max(2.75, (config.w * 0.38) / 16)
  const fluidVw = (config.w / BASE_VIEWPORT_WIDTH) * 100
  const maxRem = (config.w * 1.2) / 16
  const responsiveWidth = `clamp(${minRem.toFixed(2)}rem, ${fluidVw.toFixed(2)}vw, ${maxRem.toFixed(2)}rem)`

  return (
    <motion.div
      ref={ref}
      className={`absolute ${config.mobileHidden ? 'hidden md:block' : ''}`}
      style={{
        left: config.left,
        right: config.right,
        top: config.top,
        width: responsiveWidth,
        aspectRatio: `${config.w} / ${config.h}`,
        x: finalX,
        y: finalY,
        rotate: finalRotation,
        opacity: scrollOpacity,
        zIndex: isHovered ? 10 : 0,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
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

// ────────────────────────────────────────────
// Page
// ────────────────────────────────────────────

interface ImagePageClientProps {
  blogContent: string
}

export default function ImagePageClient({ blogContent }: ImagePageClientProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 80, mass: 0.4 })
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 80, mass: 0.4 })

  const pageRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLElement>(null)

  const [pageHeight, setPageHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    const onResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!pageRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPageHeight(entry.contentRect.height)
      }
    })
    observer.observe(pageRef.current)
    return () => observer.disconnect()
  }, [])

  const dynamicImages = useMemo(() => {
    if (!pageHeight || !viewportHeight) return []
    return generateDynamicImages(pageHeight, viewportHeight)
  }, [pageHeight, viewportHeight])

  const { scrollYProgress: galleryProgress } = useScroll({
    target: galleryRef,
    offset: ['start end', 'end start'],
  })

  const { scrollYProgress: pageProgress } = useScroll({
    target: pageRef,
    offset: ['start start', 'end end'],
  })

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
      {/* Hero floating images (always rendered, hand-tuned positions) */}
      {HERO_IMAGES.map((config, i) => (
        <FloatingImage
          key={`hero-${i}`}
          config={config}
          mouseX={smoothX}
          mouseY={smoothY}
          pageProgress={pageProgress}
          pageHeight={pageHeight}
          viewportHeight={viewportHeight}
        />
      ))}

      {/* Dynamic floating images (generated to fill the full page) */}
      {dynamicImages.map((config, i) => (
        <FloatingImage
          key={`dyn-${i}`}
          config={config}
          mouseX={smoothX}
          mouseY={smoothY}
          pageProgress={pageProgress}
          pageHeight={pageHeight}
          viewportHeight={viewportHeight}
        />
      ))}

      <div className="relative z-10 pointer-events-none">
        {/* ═══ Hero ═══ */}
        <section id="image-hero" className="h-screen">
          <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6">
            <motion.h1
              className="text-[clamp(3.5rem,14vw,7rem)] leading-[0.92] tracking-[-0.03em] text-center"
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

        {/* ═══ Blog ═══ */}
        <section id="image-blog" className="pointer-events-none">
          <div className="max-w-[1200px] mx-auto py-10 px-4 sm:py-16 sm:px-8 text-left w-full box-border pointer-events-auto select-text">
            <div className="min-w-0 text-[1rem] mx-auto max-w-[1000px] [&_h1]:mt-6 sm:[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:font-semibold [&_h1]:text-[2.1em] sm:[&_h1]:text-[2.5em] [&_h2]:mt-6 sm:[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:font-semibold [&_h2]:text-[1.6em] sm:[&_h2]:text-[2em] [&_h2]:pb-2 [&_h3]:mt-6 sm:[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-tight [&_h3]:tracking-tight [&_h3]:font-semibold [&_h3]:text-[1.25em] sm:[&_h3]:text-[1.5em] [&_h4]:mt-5 sm:[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:leading-snug [&_h4]:tracking-tight [&_h4]:font-semibold [&_h4]:text-[1.1em] sm:[&_h4]:text-[1.25em] [&_h5]:mt-4 sm:[&_h5]:mt-5 [&_h5]:mb-2 [&_h5]:leading-snug [&_h5]:font-semibold [&_h5]:text-[1em] [&_h6]:mt-4 sm:[&_h6]:mt-5 [&_h6]:mb-2 [&_h6]:leading-snug [&_h6]:font-semibold [&_h6]:text-[0.95em] [&_p]:mb-5 sm:[&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-[#333] dark:[&_p]:text-gray-300 [&_ul]:mb-5 sm:[&_ul]:mb-6 [&_ul]:pl-5 sm:[&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-5 sm:[&_ol]:mb-6 [&_ol]:pl-5 sm:[&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-2 [&_li]:ml-5 [&_li]:leading-relaxed [&_li::marker]:text-[#888] dark:[&_li::marker]:text-gray-500 [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:align-middle [&_code]:bg-[#f4f4f4] dark:[&_code]:bg-[#1a1a1a] [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-[1em] [&_code]:text-[#c7254e] dark:[&_code]:text-[#ff7b72] [&_pre]:bg-[#f8f8f8] dark:[&_pre]:bg-[#0d1117] [&_pre]:p-4 sm:[&_pre]:p-6 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:mb-6 sm:[&_pre]:mb-8 [&_pre]:border [&_pre]:border-[#eee] dark:[&_pre]:border-[#30363d] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em] [&_pre_code]:text-[#333] dark:[&_pre_code]:text-[#e6edf3] [&_blockquote]:border-l-4 [&_blockquote]:border-black dark:[&_blockquote]:border-gray-500 [&_blockquote]:py-2 [&_blockquote]:px-0 [&_blockquote]:pl-4 sm:[&_blockquote]:pl-6 [&_blockquote]:text-[#555] dark:[&_blockquote]:text-gray-400 [&_blockquote]:italic [&_blockquote]:my-6 sm:[&_blockquote]:my-8 [&_blockquote]:bg-[#fdfdfd] dark:[&_blockquote]:bg-[#161b22] [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 sm:[&_table]:my-8 [&_table]:text-sm sm:[&_table]:text-base [&_table]:overflow-x-auto [&_table]:block [&_table]:md:table [&_th]:border-[#eee] dark:[&_th]:border-gray-700 [&_th]:py-3 [&_th]:px-3 sm:[&_th]:px-4 [&_th]:text-left [&_th]:bg-white dark:[&_th]:bg-transparent [&_th]:font-bold [&_th]:border-b-2 [&_th]:border-b-black dark:[&_th]:border-b-gray-600 [&_td]:border-b [&_td]:border-[#eee] dark:[&_td]:border-gray-800 [&_td]:py-3 [&_td]:px-3 sm:[&_td]:px-4 [&_td]:text-left [&_tr:hover]:bg-[#fafafa] dark:[&_tr:hover]:bg-white/5 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-800 dark:[&_a]:hover:text-blue-300 [&_strong]:font-semibold [&_em]:italic [&_del]:line-through [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-900/50 dark:[&_mark]:text-yellow-200 [&_mark]:px-1 [&_hr]:my-8 [&_hr]:border-[#eee] dark:[&_hr]:border-gray-800 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-6 dark:[&_img]:invert-0 [&_figure]:my-8 [&_figure]:text-center [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-[#666] dark:[&_figcaption]:text-gray-400 [&_sup]:text-[0.75em] [&_sup]:align-super [&_sub]:text-[0.75em] [&_sub]:align-sub [&_kbd]:bg-[#f4f4f4] dark:[&_kbd]:bg-gray-800 [&_kbd]:border [&_kbd]:border-[#ddd] dark:[&_kbd]:border-gray-700 [&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:rounded [&_kbd]:text-[0.85em]">
              <BlogContent content={blogContent} />
            </div>
          </div>
        </section>

        {/* ═══ Gallery ═══ */}
        <section
          id="image-gallery"
          ref={galleryRef}
          className="pt-32 pb-40 min-h-[150vh] pointer-events-auto relative"
        >
          <motion.h2
            className="text-center f text-[clamp(3rem,6vw,5rem)] tracking-[-0.02em] mb-12 z-20 relative w-full"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            Curated
            <br />
            Gallery
          </motion.h2>

          <div className="flex flex-row gap-3 md:gap-6 lg:gap-8 max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
            {galleryColumns.map((col, colIndex) => (
              <motion.div
                key={colIndex}
                className="flex-1 flex flex-col gap-3 md:gap-6 lg:gap-8"
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
    </div>
  )
}

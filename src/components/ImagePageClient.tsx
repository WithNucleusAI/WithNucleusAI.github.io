'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import PerformanceVsEfficiencyApp from '@/components/performance-vs-efficiency/PerformanceVsEfficiencyApp'
import { ArchitectureFlowchart } from '@/components/performance-vs-efficiency/components/architecture-flowchart'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

// Rain characters
const RAIN_CHARS = "∇θσ∂Σ∫λαβγεμηφπδΩΔΨΓ∀∃∈≈≡∝≠∞→⇒⊗⊕01".split("")
const EXPRESSIONS = ["∂f/∂x", "∇L", "W·x", "xᵀ", "f(x)", "𝔼[X]", "σ(z)", "P(A|B)", "det(A)", "‖x‖₂", "Σᵢ xᵢ", "∫ f dx", "ε→0", "tr(A)", "log p", "∂L/∂θ"]

// Curated images
const SHOWCASE_IMAGES = [
  '/final_images/masterpiece_1_hyper_realistic_portrait_.webp',
  '/final_images/masterpiece_3_high_fashion_editorial_sh.webp',
  '/final_images/masterpiece_6_extreme_macro_of_a_jumpin.webp',
  '/final_images/masterpiece_9_a_detailed_shot_of_an_ast.webp',
  '/final_images/masterpiece_12_wildlife_shot_of_a_snow_l.webp',
  '/final_images/masterpiece_15_a_futuristic_space_statio.webp',
  '/final_images/masterpiece_18_portrait_of_a_young_woman.webp',
  '/final_images/masterpiece_21_nighttime_shot_of_a_futur.webp',
  '/final_images/masterpiece_24_macro_shot_of_a_circuit_b.webp',
  '/final_images/masterpiece_28_portrait_of_an_astronaut_.webp',
  '/final_images/pro_diffusion_1_portrait_of_a_25_year_old.webp',
  '/final_images/pro_diffusion_10_close_up_portrait_of_mode.webp',
  '/final_images/pro_diffusion_22_ballet_dancer_mid_leap_on.webp',
  '/final_images/pro_diffusion_37_surfer_riding_barrel_wave.webp',
]

const GALLERY_IMAGES = [
  [
    '/final_images/masterpiece_2_cinematic_shot_of_a_rainy.webp',
    '/final_images/masterpiece_5_extreme_close_up_of_a_sin.webp',
    '/final_images/masterpiece_8_interior_of_a_high_end_lu.webp',
    '/final_images/masterpiece_11_professional_food_photogr.webp',
    '/final_images/masterpiece_14_a_majestic_bengal_tiger_d.webp',
    '/final_images/masterpiece_20_a_dark_moody_library__sha.webp',
    '/final_images/masterpiece_25_a_foggy_morning_in_a_redw.webp',
    '/final_images/masterpiece_33_a_remote_lighthouse_on_a_.webp',
    '/final_images/pro_diffusion_5_elderly_fisherman_mending.webp',
    '/final_images/pro_diffusion_19_fashion_model_on_paris_st.webp',
  ],
  [
    '/final_images/masterpiece_3_a_coastal_greek_village_w.webp',
    '/final_images/masterpiece_7_architectural_shot_of_a_b.webp',
    '/final_images/masterpiece_10_portrait_of_a_cat_with_st.webp',
    '/final_images/masterpiece_13_macro_photography_of_a_hu.webp',
    '/final_images/masterpiece_17_candid_shot_of_a_street_f.webp',
    '/final_images/masterpiece_22_action_shot_of_a_surfer_i.webp',
    '/final_images/masterpiece_30_architectural_shot_of_a_m.webp',
    '/final_images/masterpiece_38_macro_shot_of_a_blooming_.webp',
    '/final_images/pro_diffusion_8_chef_plating_gourmet_food.webp',
    '/final_images/pro_diffusion_32_portrait_of_african_woman.webp',
  ],
  [
    '/final_images/masterpiece_4_wide_angle_shot_of_the_do.webp',
    '/final_images/masterpiece_6_a_rustic_italian_kitchen_.webp',
    '/final_images/masterpiece_9_candid_portrait_of_a_jazz.webp',
    '/final_images/masterpiece_16_close_up_of_a_weathered_l.webp',
    '/final_images/masterpiece_19_a_professional_product_sh.webp',
    '/final_images/masterpiece_23_a_vintage_1960s_sports_ca.webp',
    '/final_images/masterpiece_27_professional_product_shot.webp',
    '/final_images/masterpiece_46_a_desert_landscape_at_nig.webp',
    '/final_images/pro_diffusion_13_mountain_climber_on_ridge.webp',
    '/final_images/pro_diffusion_44_cat_sleeping_on_windowsil.webp',
  ],
]

const imgCardClass = "rounded-xl border border-[rgba(79,124,255,0.06)] dark:border-[rgba(79,124,255,0.10)] shadow-lg dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-500 hover:dark:shadow-[0_0_30px_rgba(79,124,255,0.10)] hover:dark:border-[rgba(79,124,255,0.20)] overflow-hidden"

export default function ImagePageClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const themeRef = useRef(resolvedTheme)
  useEffect(() => { themeRef.current = resolvedTheme }, [resolvedTheme])

  // ── Built-in matrix rain (like intro page) ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    interface RainCol {
      x: number; chars: string[]; speed: number; offset: number;
      fontSize: number; isAccent: boolean;
    }

    const colCount = isMobile ? 35 : 80
    const columns: RainCol[] = []

    for (let i = 0; i < colCount; i++) {
      const fontSize = (isMobile ? 8 : 10) + Math.random() * (isMobile ? 5 : 7)
      const charCount = Math.floor(5 + Math.random() * 7 + Math.random() * 5)
      const chars: string[] = []
      for (let c = 0; c < charCount; c++) {
        chars.push(Math.random() < 0.18
          ? EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
          : RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)])
      }
      columns.push({
        x: i / colCount + (Math.random() - 0.5) * (0.8 / colCount),
        chars, speed: 0.008 + Math.random() * 0.016,
        offset: Math.random() * 3, fontSize,
        isAccent: Math.random() < 0.32,
      })
    }

    let w = 0, h = 0
    const resize = () => {
      w = Math.floor(window.innerWidth * dpr)
      h = Math.floor(window.innerHeight * dpr)
      canvas.width = w
      canvas.height = h
    }
    resize()

    let animId = 0
    const FRAME_INTERVAL = isMobile ? 1000 / 24 : 1000 / 30
    let lastFrameTime = 0

    const render = (now: number) => {
      animId = requestAnimationFrame(render)
      if (document.hidden) return
      const elapsed = now - lastFrameTime
      if (elapsed < FRAME_INTERVAL) return
      lastFrameTime = now - (elapsed % FRAME_INTERVAL)

      const isDark = themeRef.current === 'dark'
      const time = now * 0.001

      ctx.clearRect(0, 0, w, h)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      const edgeInv = 1 / (h * 0.12)
      let lastImgFont = -1

      for (const col of columns) {
        const colX = col.x * w
        const fSize = col.fontSize * dpr
        const lineH = fSize * 1.6

        if (fSize !== lastImgFont) {
          ctx.font = `300 ${fSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
          lastImgFont = fSize
        }

        const scrollOffset = ((time * col.speed * h * 0.4) + col.offset * h) % (h * 1.2)
        const charLen = col.chars.length
        const charLenM1 = charLen - 1
        const twinkleBase = time * 2 + col.x * 113

        const headR = col.isAccent ? 110 : isDark ? 190 : 0
        const headG = col.isAccent ? 165 : isDark ? 210 : 0
        const headB = col.isAccent ? 255 : isDark ? 230 : 0
        const bodyR = col.isAccent ? 79 : isDark ? 130 : 0
        const bodyG = col.isAccent ? 124 : isDark ? 150 : 0
        const bodyB = col.isAccent ? 255 : isDark ? 175 : 0

        for (let ci = 0; ci < charLen; ci++) {
          const charY = (scrollOffset + ci * lineH) % (h + lineH * 2) - lineH
          if (charY < -lineH || charY > h + lineH) continue

          const isHead = ci === charLenM1
          const trailFade = isHead ? 1 : 0.15 + (ci / charLen) * 0.5
          const edgeFade = Math.max(0, Math.min(Math.min(1, charY * edgeInv), Math.min(1, (h - charY) * edgeInv)))
          const twinkle = Math.sin(twinkleBase + ci * 7.3) > 0.93 ? 1.5 : 1

          let opacity = trailFade * edgeFade * twinkle
          opacity = Math.min(0.6, opacity * 0.28)
          if (isHead) opacity *= 1.8
          if (opacity < 0.008) continue

          const r = isHead ? headR : bodyR
          const g = isHead ? headG : bodyG
          const b = isHead ? headB : bodyB
          const a = col.isAccent ? (isHead ? opacity * 1.5 : opacity) : (isDark ? (isHead ? opacity * 1.3 : opacity) : opacity * 0.4)
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`
          ctx.fillText(col.chars[ci], colX, charY)
        }

        if (Math.random() < 0.004) {
          const idx = Math.floor(Math.random() * col.chars.length)
          col.chars[idx] = Math.random() < 0.18
            ? EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
            : RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]
        }
      }
    }

    animId = requestAnimationFrame(render)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative w-full min-h-screen overflow-hidden sm:-mt-48">
      {/* Background: dark canvas — NOT opaque, lets nothing through but is the base */}
      <div className="fixed inset-0 bg-white dark:bg-[#030308] -z-50" />

      {/* Matrix rain canvas — fixed, behind all content */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 w-full h-full -z-40 pointer-events-none"
        style={{ opacity: 0.9 }}
      />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[600px] h-[400px] sm:w-[800px] sm:h-[500px] rounded-full opacity-[0.04] dark:opacity-[0.10] blur-[140px]"
            style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, var(--accent-glow) 40%, transparent 70%)' }} />
        </div>

        <motion.div
          className="mb-8 text-[9px] sm:text-[10px] tracking-[0.35em] font-light text-[rgba(79,124,255,0.2)] dark:text-[rgba(79,124,255,0.35)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.2 }}
        >
          ∇²ψ + V(x)ψ = Eψ
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-[0.20em] text-center text-gray-900 dark:text-white"
          style={{ textShadow: '0 0 50px rgba(79,124,255,0.15)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
        >
          Nucleus Image
        </motion.h1>

        {/* Separator */}
        <motion.div
          className="mt-6 sm:mt-8 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="w-14 h-px bg-[rgba(79,124,255,0.18)]" />
        </motion.div>

        {/* Architecture specs */}
        <motion.div
          className="mt-6 sm:mt-7 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: EASE_OUT }}
        >
          {/* MoE badge */}
          <span className="px-5 py-1.5 rounded-full text-[10px] sm:text-xs tracking-[0.25em] uppercase font-light border border-[rgba(79,124,255,0.25)] bg-[rgba(79,124,255,0.06)] text-[rgba(79,124,255,0.7)] dark:text-[rgba(79,124,255,0.6)]"
            style={{ textShadow: '0 0 20px rgba(79,124,255,0.15)' }}>
            The 1st Sparse MoE Diffusion Transformer
          </span>

          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-light text-[rgba(52,211,153,0.45)]">
            Leading Performance
          </span>

          {/* Stats row */}
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-2xl font-extralight tracking-[0.08em] text-white" style={{ textShadow: '0 0 20px rgba(79,124,255,0.12)' }}>
                2B
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-[rgba(255,255,255,0.30)] font-light mt-0.5">
                active params
              </span>
            </div>

            <div className="w-px h-8 bg-[rgba(79,124,255,0.12)]" />

            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-2xl font-extralight tracking-[0.08em] text-white" style={{ textShadow: '0 0 20px rgba(79,124,255,0.12)' }}>
                17B
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-[rgba(255,255,255,0.30)] font-light mt-0.5">
                total params
              </span>
            </div>

            <div className="w-px h-8 bg-[rgba(79,124,255,0.12)]" />

            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-2xl font-extralight tracking-[0.08em] text-white" style={{ textShadow: '0 0 20px rgba(79,124,255,0.12)' }}>
                64
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-[rgba(255,255,255,0.30)] font-light mt-0.5">
                experts
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 text-[8px] sm:text-[9px] tracking-[0.3em] text-[rgba(79,124,255,0.12)] dark:text-[rgba(79,124,255,0.18)] font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          p(x) = ∫ p(x|z) · p(z) dz
        </motion.div>
      </section>

      {/* ═══════════════════ MODEL DESCRIPTION ═══════════════════ */}
      <section className="relative z-10 -mt-4 sm:-mt-6 pb-4 px-6 sm:px-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-3 sm:gap-4">
          {[
            "Nucleus Image introduces the first sparse Mixture-of-Experts architecture to diffusion-based image generation — activating only 2B of 17B total parameters per forward pass.",
            "A custom Expert-Choice routing mechanism dynamically selects from 64 specialized experts plus one shared expert, enabling the model to allocate compute where it matters most.",
            "The architecture employs Grouped-Query Attention with adaptive modulation across 32 transformer blocks, achieving state-of-the-art quality at a fraction of the compute.",
            "Trained with a capacity factor schedule — 4.0 for early layers, tapering to 2.0 for deeper layers — learning efficient expert specialization without sacrificing diversity.",
            "The result: leading benchmark performance across DPG-Bench, GenEval, and overall quality metrics, at 10× parameter efficiency versus the nearest dense competitor.",
          ].map((text, i) => (
            <motion.p
              key={`desc-${i}`}
              className="text-xs sm:text-sm lg:text-base leading-[1.75] tracking-[0.03em]"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: i === 0 || i === 4
                  ? 'rgba(79,124,255,0.60)'
                  : 'rgba(255,255,255,0.40)',
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

      {/* ═══════════════════ FLOATING SCATTERED IMAGES ═══════════════════ */}
      <div className="hidden md:block absolute inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          // ── Hero zone — dramatic flanking ──
          { src: SHOWCASE_IMAGES[0],  w: 240, h: 320, top: '1%',   left: '-2%',   rot: -6,  opa: 0.40 },
          { src: SHOWCASE_IMAGES[1],  w: 180, h: 140, top: '4%',   right: '1%',   rot: 5,   opa: 0.35 },
          { src: SHOWCASE_IMAGES[6],  w: 140, h: 180, top: '1%',   right: '16%',  rot: -3,  opa: 0.22 },
          { src: SHOWCASE_IMAGES[10], w: 110, h: 110, top: '8%',   left: '20%',   rot: 8,   opa: 0.18 },

          // ── Hero bottom / transition ──
          { src: SHOWCASE_IMAGES[2],  w: 280, h: 200, top: '12%',  right: '-3%',  rot: -4,  opa: 0.38 },
          { src: SHOWCASE_IMAGES[3],  w: 160, h: 220, top: '14%',  left: '3%',    rot: 6,   opa: 0.28 },
          { src: SHOWCASE_IMAGES[7],  w: 200, h: 150, top: '11%',  left: '16%',   rot: -2,  opa: 0.15 },
          { src: SHOWCASE_IMAGES[13], w: 130, h: 170, top: '15%',  right: '18%',  rot: 4,   opa: 0.20 },

          // ── Mid-upper — approaching benchmarks ──
          { src: SHOWCASE_IMAGES[4],  w: 220, h: 290, top: '24%',  left: '-2%',   rot: -5,  opa: 0.32 },
          { src: SHOWCASE_IMAGES[8],  w: 260, h: 190, top: '26%',  right: '-1%',  rot: 3,   opa: 0.30 },
          { src: SHOWCASE_IMAGES[5],  w: 150, h: 200, top: '23%',  right: '15%',  rot: -7,  opa: 0.18 },
          { src: SHOWCASE_IMAGES[11], w: 170, h: 130, top: '28%',  left: '15%',   rot: 5,   opa: 0.14 },

          // ── Around benchmarks ──
          { src: SHOWCASE_IMAGES[9],  w: 190, h: 250, top: '36%',  left: '0%',    rot: 4,   opa: 0.25 },
          { src: SHOWCASE_IMAGES[10], w: 230, h: 170, top: '38%',  right: '0%',   rot: -5,  opa: 0.35 },
          { src: SHOWCASE_IMAGES[12], w: 140, h: 140, top: '40%',  left: '18%',   rot: -3,  opa: 0.16 },

          // ── Mid-lower ──
          { src: SHOWCASE_IMAGES[11], w: 250, h: 180, top: '50%',  left: '-3%',   rot: -3,  opa: 0.30 },
          { src: SHOWCASE_IMAGES[12], w: 180, h: 240, top: '48%',  right: '2%',   rot: 6,   opa: 0.25 },
          { src: SHOWCASE_IMAGES[13], w: 160, h: 120, top: '52%',  right: '16%',  rot: -4,  opa: 0.18 },
          { src: SHOWCASE_IMAGES[0],  w: 120, h: 160, top: '54%',  left: '17%',   rot: 7,   opa: 0.14 },

          // ── Gallery zone ──
          { src: SHOWCASE_IMAGES[1],  w: 200, h: 270, top: '62%',  right: '-1%',  rot: -5,  opa: 0.32 },
          { src: SHOWCASE_IMAGES[3],  w: 240, h: 180, top: '64%',  left: '-1%',   rot: 4,   opa: 0.28 },
          { src: SHOWCASE_IMAGES[7],  w: 150, h: 150, top: '66%',  left: '16%',   rot: -6,  opa: 0.16 },
          { src: SHOWCASE_IMAGES[8],  w: 170, h: 220, top: '63%',  right: '14%',  rot: 3,   opa: 0.13 },

          // ── Lower gallery ──
          { src: SHOWCASE_IMAGES[4],  w: 220, h: 160, top: '75%',  left: '1%',    rot: -4,  opa: 0.30 },
          { src: SHOWCASE_IMAGES[6],  w: 180, h: 240, top: '77%',  right: '0%',   rot: 5,   opa: 0.25 },
          { src: SHOWCASE_IMAGES[2],  w: 140, h: 190, top: '76%',  right: '17%',  rot: -7,  opa: 0.15 },

          // ── Bottom ──
          { src: SHOWCASE_IMAGES[9],  w: 260, h: 190, top: '86%',  left: '-2%',   rot: 3,   opa: 0.35 },
          { src: SHOWCASE_IMAGES[5],  w: 200, h: 260, top: '84%',  right: '1%',   rot: -6,  opa: 0.28 },
          { src: SHOWCASE_IMAGES[10], w: 150, h: 120, top: '90%',  left: '15%',   rot: 5,   opa: 0.18 },
          { src: SHOWCASE_IMAGES[13], w: 170, h: 220, top: '92%',  right: '13%',  rot: -3,  opa: 0.20 },
        ].map((img, i) => (
          <div key={`float-${i}`} className="absolute" style={{
            top: img.top,
            ...(img.left !== undefined ? { left: img.left } : {}),
            ...(img.right !== undefined ? { right: img.right } : {}),
            width: img.w, height: img.h,
            transform: `rotate(${img.rot}deg)`,
            opacity: img.opa,
          }}>
            <div className="w-full h-full rounded-xl overflow-hidden border border-[rgba(79,124,255,0.07)] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <img src={img.src} alt="" className="w-full h-full object-cover" draggable={false} loading="lazy" decoding="async" />
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════ ARCHITECTURE FLOWCHART ═══════════════════ */}
      <section className="relative z-10 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <ArchitectureFlowchart />
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full flex flex-col items-center py-10 relative z-10" aria-hidden="true">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[rgba(79,124,255,0.10)] to-transparent" />
        <div className="mt-3 text-[8px] sm:text-[9px] tracking-[0.4em] text-[rgba(79,124,255,0.15)] dark:text-[rgba(79,124,255,0.22)] font-light">
          ‖θ‖₂ = argmin ℒ(θ)
        </div>
      </div>

      {/* ═══════════════════ BENCHMARKS ═══════════════════ */}
      <section className="relative z-10">
        <div className="max-w-5xl mx-auto py-10 px-4 sm:py-16 sm:px-8 text-left w-full box-border select-text">
          <PerformanceVsEfficiencyApp disableAmbientBackground />
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full flex flex-col items-center py-12 relative z-10" aria-hidden="true">
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-[rgba(79,124,255,0.08)] to-transparent" />
        <div className="mt-3 text-[8px] sm:text-[9px] tracking-[0.4em] text-[rgba(79,124,255,0.12)] dark:text-[rgba(79,124,255,0.20)] font-light">
          x ~ p(x|z), z ~ 𝒩(0,I)
        </div>
      </div>

      {/* ═══════════════════ GALLERY ═══════════════════ */}
      <section className="px-4 sm:px-8 pb-20 sm:pb-32 relative z-10">
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
          <div className="mb-4 text-[9px] sm:text-[10px] tracking-[0.35em] font-light text-[rgba(79,124,255,0.2)] dark:text-[rgba(79,124,255,0.28)]" aria-hidden="true">
            ∇ × creativity
          </div>
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-[0.08em] text-gray-900 dark:text-white"
            style={{ textShadow: '0 0 30px rgba(79,124,255,0.08)' }}
          >
            Gallery
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-8 h-px bg-[rgba(79,124,255,0.15)]" />
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[rgba(255,255,255,0.3)] tracking-[0.15em] font-light">
              Curated generations
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {GALLERY_IMAGES.map((column, colIdx) =>
            column.map((src, imgIdx) => (
              <motion.div
                key={`gallery-${colIdx}-${imgIdx}`}
                className={imgCardClass}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: (imgIdx * 0.05) + (colIdx * 0.02) }}
              >
                <img src={src} alt="" className="w-full h-auto object-cover" draggable={false} loading="lazy" decoding="async" />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* ── Pre-footer ── */}
      <div className="w-full flex flex-col items-center py-16 relative z-10" aria-hidden="true">
        <div className="w-10 h-px bg-[rgba(79,124,255,0.10)]" />
        <div className="mt-4 text-[8px] sm:text-[9px] tracking-[0.35em] text-[rgba(79,124,255,0.12)] dark:text-[rgba(79,124,255,0.18)] font-light">
          𝔼[‖x - G(z)‖²] → min
        </div>
      </div>
    </div>
  )
}

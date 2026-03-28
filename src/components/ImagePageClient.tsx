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
import PerformanceVsEfficiencyApp from '@/components/performance-vs-efficiency/PerformanceVsEfficiencyApp'


const MOUSE_FACTOR = 120
const HOVER_TRANSITION = {
  duration: 0.5,
  ease: [0.39, 0.575, 0.565, 1],
} as const
const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const
const ORBIT_SECTION_COUNT = 6
const MOBILE_BREAKPOINT = 768
const MOBILE_GALLERY_MAX_IMAGES = 16
const INFOGRAPHIC_CLEAR_PADDING_PX = 120
const SIDE_DENSITY_BOOST = 1.22

interface ImageConfig {
  src: string
  position: 'left' | 'right' | 'center'
  left?: string
  right?: string
  top: string
  w: number
  h: number
  depth: number
  alpha: number
  mobileHidden?: boolean
}

const EXCLUDED_IMAGES = new Set([
  '/final_images/image (1).webp',
  '/final_images/image (2).webp',
  '/final_images/image (3).webp',
  '/final_images/image (4).webp',
  '/final_images/image (6).webp',
  '/final_images/image (7).webp',
  '/final_images/image (8).webp',
  '/final_images/image (9).webp',
  '/final_images/image (10).webp',
  '/final_images/image (11).webp',
  '/final_images/image (14).webp',
  '/final_images/image (15).webp',
  '/final_images/image (17).webp',
  '/final_images/image (19).webp',
  '/final_images/image (20).webp',
  '/final_images/image (21).webp',
  '/final_images/image (22).webp',
  '/final_images/image (23).webp',
])

const IMAGE_POOL = [
  '/final_images/image (1) 2.webp',
  '/final_images/image (1) 2.webp',
  '/final_images/image (1).webp',
  '/final_images/image (10).webp',
  '/final_images/image (11) 2.webp',
  '/final_images/image (11).webp',
  '/final_images/image (11).webp',
  '/final_images/image (12).webp',
  '/final_images/image (13).webp',
  '/final_images/image (13).webp',
  '/final_images/image (14).webp',
  '/final_images/image (14).webp',
  '/final_images/image (15).webp',
  '/final_images/image (15).webp',
  '/final_images/image (16).webp',
  '/final_images/image (17).webp',
  '/final_images/image (17).webp',
  '/final_images/image (18).webp',
  '/final_images/image (19).webp',
  '/final_images/image (2).webp',
  '/final_images/image (2).webp',
  '/final_images/image (20).webp',
  '/final_images/image (21).webp',
  '/final_images/image (21).webp',
  '/final_images/image (22).webp',
  '/final_images/image (23).webp',
  '/final_images/image (24).webp',
  '/final_images/image (3).webp',
  '/final_images/image (3).webp',
  '/final_images/image (4).webp',
  '/final_images/image (4).webp',
  '/final_images/image (5).webp',
  '/final_images/image (6).webp',
  '/final_images/image (7).webp',
  '/final_images/image (8).webp',
  '/final_images/image (8).webp',
  '/final_images/image (9).webp',
  '/final_images/image (9).webp',
  '/final_images/image 2.webp',
  '/final_images/image 3.webp',
  '/final_images/image-2.webp',
  '/final_images/image-3.webp',
  '/final_images/image-4.webp',
  '/final_images/image.webp',
  '/final_images/masterpiece_10_aerial_view_of_an_iceland.webp',
  '/final_images/masterpiece_10_high_detail_shot_of_a_mec.webp',
  '/final_images/masterpiece_10_portrait_of_a_cat_with_st.webp',
  '/final_images/masterpiece_11_a_serene_japanese_tea_hou.webp',
  '/final_images/masterpiece_11_professional_food_photogr.webp',
  '/final_images/masterpiece_12_clear_photograph_of_an_an.webp',
  '/final_images/masterpiece_12_the_interior_of_a_futuris.webp',
  '/final_images/masterpiece_12_wildlife_shot_of_a_snow_l.webp',
  '/final_images/masterpiece_13_detailed_image_of_an_arti.webp',
  '/final_images/masterpiece_13_macro_photography_of_a_hu.webp',
  '/final_images/masterpiece_13_portrait_of_a_female_weld.webp',
  '/final_images/masterpiece_14_a_majestic_bengal_tiger_d.webp',
  '/final_images/masterpiece_14_minimalist_scandinavian_l.webp',
  '/final_images/masterpiece_14_realistic_scene_of_a_bust.webp',
  '/final_images/masterpiece_15_a_futuristic_space_statio.webp',
  '/final_images/masterpiece_15_close_up_of_a_vintage_typ.webp',
  '/final_images/masterpiece_15_the_grand_canyon_under_a_.webp',
  '/final_images/masterpiece_16_close_up_of_a_weathered_l.webp',
  '/final_images/masterpiece_16_detailed_photo_of_a_calm_.webp',
  '/final_images/masterpiece_16_macro_shot_of_a_human_eye.webp',
  '/final_images/masterpiece_17_a_cozy_cabin_interior_dur.webp',
  '/final_images/masterpiece_17_candid_shot_of_a_street_f.webp',
  '/final_images/masterpiece_17_portrait_of_a_dog_with_a_.webp',
  '/final_images/masterpiece_18_aerial_photography_of_a_w.webp',
  '/final_images/masterpiece_18_portrait_of_a_young_woman.webp',
  '/final_images/masterpiece_18_realistic_depiction_of_a_.webp',
  '/final_images/masterpiece_19_a_professional_product_sh.webp',
  '/final_images/masterpiece_19_high_detail_image_of_a_mo.webp',
  '/final_images/masterpiece_19_macro_shot_of_a_butterfly.webp',
  '/final_images/masterpiece_1_architectural_shot_of_a_b.webp',
  '/final_images/masterpiece_1_hyper_realistic_portrait_.webp',
  '/final_images/masterpiece_1_portrait_of_a_young_man_w.webp',
  '/final_images/masterpiece_20_a_dark_moody_library__sha.webp',
  '/final_images/masterpiece_20_close_up_of_a_musician_pl.webp',
  '/final_images/masterpiece_20_street_food_vendor_in_han.webp',
  '/final_images/masterpiece_21_a_group_of_monks_in_saffr.webp',
  '/final_images/masterpiece_21_nighttime_shot_of_a_futur.webp',
  '/final_images/masterpiece_22_action_shot_of_a_surfer_i.webp',
  '/final_images/masterpiece_22_extreme_close_up_of_a_dro.webp',
  '/final_images/masterpiece_23_a_vintage_1960s_sports_ca.webp',
  '/final_images/masterpiece_23_portrait_of_a_blacksmith_.webp',
  '/final_images/masterpiece_24_macro_shot_of_a_circuit_b.webp',
  '/final_images/masterpiece_24_portrait_of_a_young_man_w.webp',
  '/final_images/masterpiece_25_a_foggy_morning_in_a_redw.webp',
  '/final_images/masterpiece_26_extreme_close_up_of_a_dro.webp',
  '/final_images/masterpiece_27_professional_product_shot.webp',
  '/final_images/masterpiece_28_portrait_of_an_astronaut_.webp',
  '/final_images/masterpiece_29_a_bustling_fish_market_in.webp',
  '/final_images/masterpiece_2_cinematic_shot_of_a_rainy.webp',
  '/final_images/masterpiece_2_interior_of_a_high_end_lu.webp',
  '/final_images/masterpiece_2_macro_photography_of_a_fu (1).webp',
  '/final_images/masterpiece_2_macro_photography_of_a_fu.webp',
  '/final_images/masterpiece_2_macro_photography_of_a_me.webp',
  '/final_images/masterpiece_30_architectural_shot_of_a_m.webp',
  '/final_images/masterpiece_31_macro_photography_of_a_ho.webp',
  '/final_images/masterpiece_32_portrait_of_an_artist_in_.webp',
  '/final_images/masterpiece_33_a_remote_lighthouse_on_a_.webp',
  '/final_images/masterpiece_34_candid_street_photography.webp',
  '/final_images/masterpiece_35_macro_shot_of_a_human_thu.webp',
  '/final_images/masterpiece_36_interior_of_an_old_wooden.webp',
  '/final_images/masterpiece_37_portrait_of_a_young_man_w.webp',
  '/final_images/masterpiece_38_macro_shot_of_a_blooming_.webp',
  '/final_images/masterpiece_39_a_futuristic_medical_lab_.webp',
  '/final_images/masterpiece_3_a_coastal_greek_village_w.webp',
  '/final_images/masterpiece_3_candid_portrait_of_a_jazz.webp',
  '/final_images/masterpiece_3_cinematic_street_shot_of_ (1).webp',
  '/final_images/masterpiece_3_cinematic_street_shot_of_.webp',
  '/final_images/masterpiece_3_high_fashion_editorial_sh.webp',
  '/final_images/masterpiece_3_macro_photography_of_a_pe.webp',
  '/final_images/masterpiece_40_action_shot_of_a_mountain.webp',
  '/final_images/masterpiece_42_macro_photography_of_an_o.webp',
  '/final_images/masterpiece_43_a_minimalist_concrete_sta.webp',
  '/final_images/masterpiece_44_portrait_of_a_coal_miner_.webp',
  '/final_images/masterpiece_45_macro_shot_of_a_peacock_s.webp',
  '/final_images/masterpiece_46_a_desert_landscape_at_nig.webp',
  '/final_images/masterpiece_47_professional_product_shot.webp',
  '/final_images/masterpiece_48_portrait_of_a_samurai_in_.webp',
  '/final_images/masterpiece_49_macro_shot_of_a_dandelion.webp',
  '/final_images/masterpiece_4_a_professional_athlete_mi.webp',
  '/final_images/masterpiece_4_aerial_view_of_an_iceland.webp',
  '/final_images/masterpiece_4_an_ultra_sharp_architectu.webp',
  '/final_images/masterpiece_4_portrait_of_a_young_woman.webp',
  '/final_images/masterpiece_4_wide_angle_shot_of_the_do.webp',
  '/final_images/masterpiece_50_a_close_up_of_a_freshly_p.webp',
  '/final_images/masterpiece_5_extreme_close_up_of_a_sin.webp',
  '/final_images/masterpiece_5_high_fashion_editorial_sh.webp',
  '/final_images/masterpiece_5_realistic_landscape_of_ro.webp',
  '/final_images/masterpiece_6_a_rustic_italian_kitchen_.webp',
  '/final_images/masterpiece_6_cinematic_street_photogra.webp',
  '/final_images/masterpiece_6_close_up_of_a_flower_in_b.webp',
  '/final_images/masterpiece_6_extreme_macro_of_a_jumpin.webp',
  '/final_images/masterpiece_7_architectural_shot_of_a_b.webp',
  '/final_images/masterpiece_7_high_detail_image_of_a_ci.webp',
  '/final_images/masterpiece_7_wildlife_portrait_of_a_sn.webp',
  '/final_images/masterpiece_8_a_minimalist_concrete_vil.webp',
  '/final_images/masterpiece_8_interior_design_shot_of_a.webp',
  '/final_images/masterpiece_8_interior_of_a_high_end_lu.webp',
  '/final_images/masterpiece_8_photo_of_a_mountain_range.webp',
  '/final_images/masterpiece_9_a_detailed_shot_of_an_ast.webp',
  '/final_images/masterpiece_9_candid_portrait_of_a_jazz.webp',
  '/final_images/masterpiece_9_candid_street_shot_of_a_g.webp',
  '/final_images/masterpiece_9_realistic_depiction_of_a_.webp',
  '/final_images/pro_diffusion_10_close_up_portrait_of_mode.webp',
  '/final_images/pro_diffusion_11_classic_car_in_desert_at_.webp',
  '/final_images/pro_diffusion_12_indian_wedding_ceremony__.webp',
  '/final_images/pro_diffusion_13_mountain_climber_on_ridge.webp',
  '/final_images/pro_diffusion_14_coffee_shop_interior__mor.webp',
  '/final_images/pro_diffusion_15_baby_laughing_with_eyes_c.webp',
  '/final_images/pro_diffusion_16_street_musician_playing_s.webp',
  '/final_images/pro_diffusion_17_golden_retriever_running_.webp',
  '/final_images/pro_diffusion_18_real_estate_interior_of_l.webp',
  '/final_images/pro_diffusion_19_fashion_model_on_paris_st.webp',
  '/final_images/pro_diffusion_1_portrait_of_a_25_year_old.webp',
  '/final_images/pro_diffusion_20_underwater_portrait__swim.webp',
  '/final_images/pro_diffusion_21_street_food_market_in_mar.webp',
  '/final_images/pro_diffusion_22_ballet_dancer_mid_leap_on.webp',
  '/final_images/pro_diffusion_23_macro_of_honeybee_on_lave.webp',
  '/final_images/pro_diffusion_24_construction_worker_high_.webp',
  '/final_images/pro_diffusion_25_night_cityscape_from_roof.webp',
  '/final_images/pro_diffusion_26_portrait_of_twins__identi.webp',
  '/final_images/pro_diffusion_27_farmer_in_wheat_field_at_.webp',
  '/final_images/pro_diffusion_28_newlyweds_first_dance__so.webp',
  '/final_images/pro_diffusion_29_street_vendor_selling_fre.webp',
  '/final_images/pro_diffusion_2_street_photography__nyc_t.webp',
  '/final_images/pro_diffusion_30_athlete_doing_yoga_on_mou.webp',
  '/final_images/pro_diffusion_31_raindrops_on_window_with_.webp',
  '/final_images/pro_diffusion_32_portrait_of_african_woman.webp',
  '/final_images/pro_diffusion_33_tech_startup_office__crea.webp',
  '/final_images/pro_diffusion_34_grandfather_teaching_gran.webp',
  '/final_images/pro_diffusion_35_industrial_factory_worker.webp',
  '/final_images/pro_diffusion_36_fresh_sushi_platter_on_sl.webp',
  '/final_images/pro_diffusion_37_surfer_riding_barrel_wave.webp',
  '/final_images/pro_diffusion_38_old_bookshop_owner_surrou.webp',
  '/final_images/pro_diffusion_39_aerial_drone_shot_of_rice.webp',
  '/final_images/pro_diffusion_3_professional_headshot_of_.webp',
  '/final_images/pro_diffusion_40_portrait_of_musician_with.webp',
  '/final_images/pro_diffusion_41_children_playing_in_monso.webp',
  '/final_images/pro_diffusion_42_fashion_flat_lay_on_marbl.webp',
  '/final_images/pro_diffusion_43_firefighter_emerging_from.webp',
  '/final_images/pro_diffusion_44_cat_sleeping_on_windowsil.webp',
  '/final_images/pro_diffusion_45_marathon_runners_at_finis.webp',
  '/final_images/pro_diffusion_46_snow_covered_village__chi.webp',
  '/final_images/pro_diffusion_47_portrait_through_rain_str.webp',
  '/final_images/pro_diffusion_48_artisan_potter_shaping_cl.webp',
  '/final_images/pro_diffusion_4_candid_photo_of_a_barista.webp',
  '/final_images/pro_diffusion_50_close_up_of_aged_hands_ho.webp',
  '/final_images/pro_diffusion_5_elderly_fisherman_mending.webp',
  '/final_images/pro_diffusion_6_mother_holding_newborn_ba.webp',
  '/final_images/pro_diffusion_7_athletes_sprinting_on_tra.webp',
  '/final_images/pro_diffusion_8_chef_plating_gourmet_food.webp',
  '/final_images/pro_diffusion_9_couple_walking_through_au.webp',
].filter(img => !EXCLUDED_IMAGES.has(img))

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// Hand-tuned hero images – evenly spaced ~8vh apart, alternating left/right
const HERO_IMAGES: ImageConfig[] = [
  { src: '/final_images/image (1).webp', position: 'left', left: '3%', top: '4vh', w: 175, h: 235, depth: 0.35, alpha: 0.85 },
  { src: '/final_images/image (2).webp', position: 'right', right: '3%', top: '12vh', w: 195, h: 145, depth: 0.55, alpha: 0.65 },
  { src: '/final_images/image (23).webp', position: 'left', left: '2%', top: '10vh', w: 76, h: 110, depth: 0.38, alpha: 0.42, mobileHidden: true },
  { src: '/final_images/image (20).webp', position: 'left', left: '7%', top: '16vh', w: 104, h: 84, depth: 0.48, alpha: 0.44, mobileHidden: true },
  { src: '/final_images/image (18).webp', position: 'right', right: '8%', top: '18vh', w: 88, h: 126, depth: 0.5, alpha: 0.42, mobileHidden: true },
  { src: '/final_images/image (14).webp', position: 'left', left: '18%', top: '20vh', w: 115, h: 115, depth: 0.7, alpha: 0.4, mobileHidden: true },
  { src: '/final_images/image (11).webp', position: 'right', right: '16%', top: '28vh', w: 90, h: 62, depth: 0.15, alpha: 0.3, mobileHidden: true },
  { src: '/final_images/image (19).webp', position: 'right', right: '11%', top: '32vh', w: 96, h: 66, depth: 0.62, alpha: 0.52, mobileHidden: true },
  { src: '/final_images/image (16).webp', position: 'left', left: '2%', top: '30vh', w: 74, h: 106, depth: 0.42, alpha: 0.39, mobileHidden: true },
  { src: '/final_images/image (5).webp', position: 'left', left: '4%', top: '34vh', w: 92, h: 128, depth: 0.44, alpha: 0.4, mobileHidden: true },
  { src: '/final_images/image (7).webp', position: 'left', left: '-2%', top: '36vh', w: 80, h: 110, depth: 0.6, alpha: 0.35 },
  { src: '/final_images/image (10).webp', position: 'right', right: '1%', top: '44vh', w: 72, h: 92, depth: 0.5, alpha: 0.38, mobileHidden: true },
  { src: '/final_images/image (17).webp', position: 'left', left: '8%', top: '48vh', w: 82, h: 120, depth: 0.5, alpha: 0.46, mobileHidden: true },
  { src: '/final_images/image (4).webp', position: 'left', left: '12%', top: '52vh', w: 105, h: 142, depth: 0.28, alpha: 0.6, mobileHidden: true },
  { src: '/final_images/image (3).webp', position: 'right', right: '5%', top: '60vh', w: 168, h: 128, depth: 0.4, alpha: 0.75 },
  { src: '/final_images/image (22).webp', position: 'right', right: '12%', top: '64vh', w: 72, h: 102, depth: 0.36, alpha: 0.4, mobileHidden: true },
  { src: '/final_images/image (12).webp', position: 'left', left: '2%', top: '62vh', w: 66, h: 96, depth: 0.31, alpha: 0.37, mobileHidden: true },
  { src: '/final_images/image (24).webp', position: 'left', left: '6%', top: '66vh', w: 84, h: 84, depth: 0.33, alpha: 0.42, mobileHidden: true },
  { src: '/final_images/image (9).webp', position: 'left', left: '1%', top: '68vh', w: 68, h: 96, depth: 0.2, alpha: 0.45 },
  { src: '/final_images/image (8).webp', position: 'right', right: '0%', top: '76vh', w: 85, h: 68, depth: 0.3, alpha: 0.3, mobileHidden: true },
  { src: '/final_images/image (21).webp', position: 'right', right: '2%', top: '82vh', w: 70, h: 98, depth: 0.47, alpha: 0.44, mobileHidden: true },
  { src: '/final_images/image (6).webp', position: 'left', left: '38%', top: '84vh', w: 90, h: 90, depth: 0.45, alpha: 0.55, mobileHidden: true },
  { src: '/final_images/image (13).webp', position: 'right', right: '7%', top: '88vh', w: 78, h: 112, depth: 0.52, alpha: 0.46, mobileHidden: true },
  { src: '/final_images/image (15).webp', position: 'right', right: '15%', top: '92vh', w: 80, h: 120, depth: 0.8, alpha: 0.5 },
]

function generateDynamicImages(pageHeight: number, vh: number, isMobile: boolean): ImageConfig[] {
  const startY = Math.max(vh * 0.8, vh - 120)
  const endY = pageHeight - (isMobile ? vh * 0.18 : vh * 0.06)
  if (endY <= startY) return []

  const images: ImageConfig[] = []
  const baseGap = isMobile ? 150 : 92
  const positionCycle: ('left' | 'right' | 'center')[] = [
    'left', 'right', 'left', 'right', 'left', 'right', 'center', 'left', 'right', 'left', 'right', 'left', 'right',
  ]

  let y = startY
  let i = 0

  while (y < endY) {
    const r = (s: number) => seededRandom(i * 13 + s)
    const position = positionCycle[i % positionCycle.length]
    const size = isMobile ? 62 + Math.floor(r(2) * 68) : 64 + Math.floor(r(2) * 74)

    let posProps: { left?: string; right?: string }
    if (position === 'left') {
      const pct = isMobile ? 2 + r(1) * 14 : 1 + r(1) * 16
      posProps = { left: `${pct.toFixed(1)}%` }
    } else if (position === 'right') {
      const pct = isMobile ? 2 + r(1) * 14 : 1 + r(1) * 16
      posProps = { right: `${pct.toFixed(1)}%` }
    } else {
      const pct = 41 + r(1) * 18
      posProps = { left: `${pct.toFixed(1)}%` }
    }

    const jitter = (r(3) - 0.5) * (baseGap * 0.2)
    const placeY = Math.round(y + jitter)
    if (placeY >= endY) break

    images.push({
      src: IMAGE_POOL[Math.floor(r(8) * IMAGE_POOL.length)],
      position,
      ...posProps,
      top: `${placeY}px`,
      w: position === 'center' ? size : Math.round(size * SIDE_DENSITY_BOOST),
      h: position === 'center' ? size : Math.round(size * SIDE_DENSITY_BOOST),
      depth: 0.2 + r(4) * 0.6,
      alpha: 0.65 + r(5) * 0.4,
      mobileHidden: r(6) > 0.78,
    })

    y += baseGap + r(7) * (baseGap * 0.22)
    i++
  }

  return images
}

function createUniqueGalleryColumns(
  columns: string[][],
  reserved: Set<string>,
): string[][] {
  const used = new Set<string>(reserved)
  const uniqueFromColumns = columns
    .flat()
    .filter((src) => {
      if (used.has(src)) return false
      used.add(src)
      return true
    })

  for (const src of IMAGE_POOL) {
    if (uniqueFromColumns.length >= columns.flat().length) break
    if (used.has(src)) continue
    used.add(src)
    uniqueFromColumns.push(src)
  }

  const filled: string[][] = []
  let cursor = 0
  for (const col of columns) {
    const nextCol: string[] = []
    for (let i = 0; i < col.length && cursor < uniqueFromColumns.length; i++) {
      nextCol.push(uniqueFromColumns[cursor])
      cursor++
    }
    filled.push(nextCol)
  }

  return filled
}

function uniqueDynamicImages(
  images: ImageConfig[],
  reserved: Set<string>,
): ImageConfig[] {
  const used = new Set<string>(reserved)
  return images.filter((img) => {
    if (used.has(img.src)) return false
    used.add(img.src)
    return true
  })
}

function topToPx(top: string, vh: number): number {
  const n = parseFloat(top)
  if (top.endsWith('px')) return n
  return (n / 100) * vh
}

const galleryColumns = [
  [
    '/final_images/image (1).webp',
    '/final_images/image (4).webp',
    '/final_images/image (17).webp',
    '/final_images/image (21).webp',
    '/final_images/image (10).webp',
    '/final_images/image (19).webp',
    '/final_images/image (24).webp',
    '/final_images/image (12).webp',
    '/final_images/image (13).webp',
    '/final_images/image (18).webp',
  ],
  [
    '/final_images/image (2).webp',
    '/final_images/image (6).webp',
    '/final_images/image (9).webp',
    '/final_images/image (15).webp',
    '/final_images/image (22).webp',
    '/final_images/image (23).webp',
    '/final_images/image (13).webp',
    '/final_images/image (5).webp',
    '/final_images/image (20).webp',
    '/final_images/image (24).webp',
  ],
  [
    '/final_images/image (3).webp',
    '/final_images/image (7).webp',
    '/final_images/image (8).webp',
    '/final_images/image (14).webp',
    '/final_images/image (20).webp',
    '/final_images/image (11).webp',
    '/final_images/image (18).webp',
    '/final_images/image (16).webp',
    '/final_images/image (12).webp',
    '/final_images/image (5).webp',
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
  const desktopVw = (config.w / 1440) * 100
  const responsiveWidth = `max(${minRem.toFixed(2)}rem, ${desktopVw.toFixed(2)}vw)`

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
        transform: config.position === 'center' ? 'translateX(-50%)' : undefined,
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
}

export default function ImagePageClient({ }: ImagePageClientProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 80, mass: 0.4 })
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 80, mass: 0.4 })

  const pageRef = useRef<HTMLDivElement>(null)
  const blogRef = useRef<HTMLElement>(null)
  const galleryRef = useRef<HTMLElement>(null)

  const [pageHeight, setPageHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [blogBand, setBlogBand] = useState({ start: 0, end: 0 })

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    const onResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(mediaQuery.matches)
    onChange()
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
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

  useEffect(() => {
    if (!blogRef.current || !pageRef.current) return

    const updateBlogBand = () => {
      if (!blogRef.current || !pageRef.current) return
      const blogRect = blogRef.current.getBoundingClientRect()
      const pageRect = pageRef.current.getBoundingClientRect()

      const start = Math.max(0, blogRect.top - pageRect.top - INFOGRAPHIC_CLEAR_PADDING_PX)
      const end = Math.max(0, blogRect.bottom - pageRect.top + INFOGRAPHIC_CLEAR_PADDING_PX)
      setBlogBand({ start, end })
    }

    updateBlogBand()
    window.addEventListener('resize', updateBlogBand)

    const observer = new ResizeObserver(() => updateBlogBand())
    observer.observe(blogRef.current)
    observer.observe(pageRef.current)

    return () => {
      window.removeEventListener('resize', updateBlogBand)
      observer.disconnect()
    }
  }, [])

  const heroSources = useMemo(() => new Set(HERO_IMAGES.map((img) => img.src)), [])

  const desktopGalleryColumns = useMemo(
    () => createUniqueGalleryColumns(galleryColumns, heroSources),
    [heroSources],
  )

  const curatedSources = useMemo(
    () => new Set(desktopGalleryColumns.flat()),
    [desktopGalleryColumns],
  )

  const reservedSources = useMemo(() => {
    const merged = new Set<string>(heroSources)
    for (const src of curatedSources) merged.add(src)
    return merged
  }, [heroSources, curatedSources])

  const dynamicImages = useMemo(() => {
    if (!pageHeight || !viewportHeight) return []
    const generated = generateDynamicImages(pageHeight, viewportHeight, isMobile)
    const unique = uniqueDynamicImages(generated, reservedSources)

    if (blogBand.end <= blogBand.start) return unique

    return unique.filter((img) => {
      const y = topToPx(img.top, viewportHeight)
      const insideInfographicBand = y >= blogBand.start && y <= blogBand.end

      // Keep side imagery visible; only suppress center/background clutter behind infographics.
      if (!insideInfographicBand) return true
      return img.position !== 'center'
    })
  }, [pageHeight, viewportHeight, isMobile, reservedSources, blogBand])

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
  const mobileGallery = useMemo(() => {
    const all = desktopGalleryColumns.flat()
    return all.filter((_, idx) => idx % 2 === 0).slice(0, MOBILE_GALLERY_MAX_IMAGES)
  }, [desktopGalleryColumns])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mouseX, mouseY])

  return (
    <div ref={pageRef} id='imageMain' className="relative w-full bg-white dark:bg-black text-foreground overflow-hidden sm:-mt-48">
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
        <section id="image-blog" ref={blogRef} className="pointer-events-none">
          <div className="max-w-5xl mx-auto py-10 px-4 sm:py-16 sm:px-8 text-left w-full box-border pointer-events-auto select-text">
              <div className="w-full  pointer-events-auto">
                <PerformanceVsEfficiencyApp disableAmbientBackground />
              </div>
            
          </div>
        </section>

        {/* ═══ Gallery ═══ */}
        <section
          id="image-gallery"
          ref={galleryRef}
          className="pt-16 md:pt-32 pb-20 md:pb-40  min-h-[110vh] md:min-h-[150vh] pointer-events-auto relative"
        >
          <motion.h2
            className="text-center f text-[clamp(2.25rem,12vw,5rem)] tracking-[-0.02em] mb-8 md:mb-12 z-20 relative w-full max-w-5xl mx-auto px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            Curated
            <br />
            Gallery
          </motion.h2>

          {isMobile ? (
            <div className="max-w-5xl w-full mx-auto px-4 relative z-10">
              <div className="flex flex-col gap-4">
                {mobileGallery.map((src, i) => (
                  <motion.div
                    key={src + i}
                    className="relative w-full overflow-hidden rounded-lg group isolate"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-5%' }}
                    transition={{
                      duration: 0.8,
                      ease: EASE_OUT,
                      delay: i * 0.04,
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-auto object-cover transition-all duration-1200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03] group-hover:-rotate-[0.4deg] will-change-transform"
                      loading="lazy"
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-row gap-3 md:gap-6 lg:gap-8 w-full max-w-5xl mx-auto px-4 md:px-8 relative z-10">
              {desktopGalleryColumns.map((col, colIndex) => (
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
                        className="w-full h-auto object-cover transition-all duration-1200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 group-hover:-rotate-1 will-change-transform"
                        loading="lazy"
                        draggable={false}
                      />
                      {/* <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                      <div className="absolute top-4 left-4 w-8 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left z-20 delay-100" />
                      <div className="absolute top-4 left-4 h-8 w-[1px] bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top z-20 delay-100" />
                      <div className="absolute bottom-4 right-4 w-8 h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-right z-20 delay-100" />
                      <div className="absolute bottom-4 right-4 h-8 w-[1px] bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-bottom z-20 delay-100" /> */}
                    </motion.div>
                  ))}
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ImagePageScrollButton />
    </div>
  )
}

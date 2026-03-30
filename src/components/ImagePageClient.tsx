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
const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const
const ORBIT_SECTION_COUNT = 6
const MOBILE_BREAKPOINT = 768
const MOBILE_GALLERY_MAX_IMAGES = 16
const INFOGRAPHIC_CLEAR_PADDING_PX = 120
const SIDE_DENSITY_BOOST = 1.22

const FLOATING_IMAGE_CONFIG = {
  size: {
    minWidthPx: 110,
    minHeightPx: 100,
    maxWidthPx: 150,
    maxHeightPx: 150,
  },
  overlap: {
    maxOverlapRatio: 0.1,
    resolveStepPx: 12,
    maxResolveIterations: 140,
  },
  geometry: {
    heroFrame: {
      widthUnits: 100,
      heightUnits: 60,
      centerNoImageZone: {
        xStart: 25,
        xEnd: 75,
        yStart: 25,
        yEnd: 55,
      },
      sideSequence: ['left', 'right', 'top', 'bottom'] as const,
    },
    postHero: {
      centerNoImageZoneX: {
        xStart: 35,
        xEnd: 75,
      },
    },
  },
  hero: {
    topCoverageVh: 92,
    topStartVh: 0,
    desktopCount: 16,
    mobileVisibleCount: 10,
    topJitterRatio: 0.2,
  },
  dynamic: {
    leftRangePct: [2, 16] as const,
    rightRangePct: [2, 16] as const,
    positionCycle: ['left', 'right'] as const,
  },
  interaction: {
    enableHoverEffects: true,
  },
} as const

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

const HERO_IMAGE_SOURCES = [
  '/final_images/image (1).webp',
  '/final_images/image (2).webp',
  '/final_images/image (23).webp',
  '/final_images/image (20).webp',
  '/final_images/image (18).webp',
  '/final_images/image (14).webp',
  '/final_images/image (11).webp',
  '/final_images/image (19).webp',
  '/final_images/image (16).webp',
  '/final_images/image (5).webp',
  '/final_images/image (7).webp',
  '/final_images/image (10).webp',
  '/final_images/image (17).webp',
  '/final_images/image (4).webp',
  '/final_images/image (3).webp',
  '/final_images/image (22).webp',
  '/final_images/image (12).webp',
  '/final_images/image (24).webp',
  '/final_images/image (9).webp',
  '/final_images/image (8).webp',
  '/final_images/image (21).webp',
  '/final_images/image (6).webp',
  '/final_images/image (13).webp',
  '/final_images/image (15).webp',
]

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function clampImageSize(w: number, h: number): { w: number; h: number } {
  const cfg = FLOATING_IMAGE_CONFIG.size
  let nextW = w
  let nextH = h

  const shrink = Math.min(cfg.maxWidthPx / nextW, cfg.maxHeightPx / nextH, 1)
  nextW *= shrink
  nextH *= shrink

  const grow = Math.max(cfg.minWidthPx / nextW, cfg.minHeightPx / nextH, 1)
  nextW *= grow
  nextH *= grow

  return {
    w: Math.round(clamp(nextW, cfg.minWidthPx, cfg.maxWidthPx)),
    h: Math.round(clamp(nextH, cfg.minHeightPx, cfg.maxHeightPx)),
  }
}

function getHorizontalPlacement(
  position: 'left' | 'right' | 'center',
  seed: number,
): { left?: string; right?: string } {
  const r = seededRandom(seed)

  if (position === 'left') {
    const [min, max] = FLOATING_IMAGE_CONFIG.dynamic.leftRangePct
    const pct = min + r * (max - min)
    return { left: `${pct.toFixed(1)}%` }
  }

  if (position === 'right') {
    const [min, max] = FLOATING_IMAGE_CONFIG.dynamic.rightRangePct
    const pct = min + r * (max - min)
    return { right: `${pct.toFixed(1)}%` }
  }

  const center = (FLOATING_IMAGE_CONFIG.geometry.postHero.centerNoImageZoneX.xStart + FLOATING_IMAGE_CONFIG.geometry.postHero.centerNoImageZoneX.xEnd) / 2
  return { left: `${center.toFixed(1)}%` }
}

function heroSidePlacement(
  side: 'left' | 'right' | 'top' | 'bottom',
  seed: number,
): { position: 'left' | 'right' | 'center'; left?: string; right?: string; topVh: number } {
  const frame = FLOATING_IMAGE_CONFIG.geometry.heroFrame
  const r = (s: number) => seededRandom(seed * 17 + s)
  const yJitter = (r(5) - 0.5) * 1.1

  if (side === 'left') {
    const leftPct = 1 + r(1) * (frame.centerNoImageZone.xStart - 5)
    const y = frame.centerNoImageZone.yStart + r(2) * (frame.centerNoImageZone.yEnd - frame.centerNoImageZone.yStart)
    return { position: 'left', left: `${leftPct.toFixed(1)}%`, topVh: y + yJitter }
  }

  if (side === 'right') {
    const rightPct = 1 + r(1) * (frame.widthUnits - frame.centerNoImageZone.xEnd - 5)
    const y = frame.centerNoImageZone.yStart + r(2) * (frame.centerNoImageZone.yEnd - frame.centerNoImageZone.yStart)
    return { position: 'right', right: `${rightPct.toFixed(1)}%`, topVh: y + yJitter }
  }

  if (side === 'top') {
    const x = frame.centerNoImageZone.xStart + r(3) * (frame.centerNoImageZone.xEnd - frame.centerNoImageZone.xStart)
    const y = 1 + r(4) * (frame.centerNoImageZone.yStart - 2)
    return { position: 'center', left: `${x.toFixed(1)}%`, topVh: y + yJitter }
  }

  const x = frame.centerNoImageZone.xStart + r(3) * (frame.centerNoImageZone.xEnd - frame.centerNoImageZone.xStart)
  const y = frame.centerNoImageZone.yEnd + r(4) * (frame.heightUnits - frame.centerNoImageZone.yEnd - 2)
  return { position: 'center', left: `${x.toFixed(1)}%`, topVh: y + yJitter }
}

function heroBalancedSlot(
  side: 'left' | 'right' | 'top' | 'bottom',
  sideIndex: number,
): { position: 'left' | 'right' | 'center'; left?: string; right?: string; topVh: number } {
  // Left/right border images — spread across full vertical height
  const leftSlots = [
    { left: -5, y: 2 },
    { left: 8, y: 22 },
    { left: -2, y: 50 },
    { left: 10, y: 72 },
  ]
  const rightSlots = [
    { right: 10, y: 5 },
    { right: -6, y: 28 },
    { right: 5, y: 55 },
    { right: -4, y: 78 },
  ]
  // Top-area images, distributed across the upper viewport
  const topSlots = [
    { left: 15, y: 4 },
    { left: 40, y: 8 },
    { left: 60, y: 3 },
    { left: 85, y: 10 },
  ]
  // Bottom images — placed in the center-bottom zone BELOW the heading text
  // The heading occupies ~25–55 vh, so these sit at 60–82 vh in the center column
  const bottomSlots = [
    { left: 20, y: 63 },
    { left: 42, y: 72 },
    { left: 62, y: 66 },
    { left: 82, y: 78 },
  ]

  if (side === 'left') {
    const slot = leftSlots[sideIndex % leftSlots.length]
    return { position: 'left', left: `${slot.left}%`, topVh: slot.y }
  }
  if (side === 'right') {
    const slot = rightSlots[sideIndex % rightSlots.length]
    return { position: 'right', right: `${slot.right}%`, topVh: slot.y }
  }
  if (side === 'top') {
    const slot = topSlots[sideIndex % topSlots.length]
    return { position: 'center', left: `${slot.left}%`, topVh: slot.y }
  }

  const slot = bottomSlots[sideIndex % bottomSlots.length]
  return { position: 'center', left: `${slot.left}%`, topVh: slot.y }
}

function overlapRatio(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): number {
  const x1 = Math.max(a.x, b.x)
  const y1 = Math.max(a.y, b.y)
  const x2 = Math.min(a.x + a.w, b.x + b.w)
  const y2 = Math.min(a.y + a.h, b.y + b.h)

  if (x2 <= x1 || y2 <= y1) return 0
  const area = (x2 - x1) * (y2 - y1)
  const minArea = Math.min(a.w * a.h, b.w * b.h)
  if (minArea <= 0) return 0
  return area / minArea
}

function getImageLeftPx(img: ImageConfig, viewportWidth: number): number {
  const w = img.w
  if (img.position === 'center') {
    const centerPct = parseFloat(img.left || '50')
    return (centerPct / 100) * viewportWidth - w / 2
  }
  if (img.left) return (parseFloat(img.left) / 100) * viewportWidth
  if (img.right) return viewportWidth - (parseFloat(img.right) / 100) * viewportWidth - w
  return 0
}

function enforceNoImageZones(
  images: ImageConfig[],
  vh: number,
  viewportWidth: number,
): ImageConfig[] {
  const heroFrame = FLOATING_IMAGE_CONFIG.geometry.heroFrame
  const postHero = FLOATING_IMAGE_CONFIG.geometry.postHero

  return images.map((img) => {
    const topPx = topToPx(img.top, vh)
    const yVh = (topPx / vh) * 100
    const xPx = getImageLeftPx(img, viewportWidth)
    const widthPct = (img.w / viewportWidth) * 100
    const xStart = (xPx / viewportWidth) * 100
    const xEnd = xStart + widthPct

    const overlapsCenter = (zoneStart: number, zoneEnd: number) => xEnd > zoneStart && xStart < zoneEnd

    const inHeroCenterY = yVh >= heroFrame.centerNoImageZone.yStart && yVh <= heroFrame.centerNoImageZone.yEnd
    const inHeroBand = yVh <= FLOATING_IMAGE_CONFIG.hero.topCoverageVh

    const blockCenterX = inHeroBand
      ? (inHeroCenterY ? heroFrame.centerNoImageZone : null)
      : postHero.centerNoImageZoneX

    if (!blockCenterX) return img

    if (!overlapsCenter(blockCenterX.xStart, blockCenterX.xEnd)) return img

    const leftMax = Math.max(1, blockCenterX.xStart - widthPct - 1)
    const rightMax = Math.max(1, 100 - blockCenterX.xEnd - widthPct - 1)
    const imageMid = xStart + widthPct / 2

    if (imageMid <= 50) {
      return {
        ...img,
        position: 'left',
        left: `${leftMax.toFixed(1)}%`,
        right: undefined,
      }
    }

    return {
      ...img,
      position: 'right',
      right: `${rightMax.toFixed(1)}%`,
      left: undefined,
    }
  })
}

function enforceMaxOverlap(
  images: ImageConfig[],
  vh: number,
  viewportWidth: number,
): ImageConfig[] {
  const cfg = FLOATING_IMAGE_CONFIG.overlap
  const sorted = [...images].sort((a, b) => topToPx(a.top, vh) - topToPx(b.top, vh))
  const accepted: ImageConfig[] = []
  const acceptedTopPx: number[] = []

  for (const img of sorted) {
    let topPx = topToPx(img.top, vh)
    let iterations = 0

    while (iterations < cfg.maxResolveIterations) {
      const currentBox = {
        x: getImageLeftPx(img, viewportWidth),
        y: topPx,
        w: img.w,
        h: img.h,
      }

      const hasTooMuchOverlap = accepted.some((prev, prevIndex) => {
        const prevBox = {
          x: getImageLeftPx(prev, viewportWidth),
          y: acceptedTopPx[prevIndex],
          w: prev.w,
          h: prev.h,
        }
        return overlapRatio(currentBox, prevBox) > cfg.maxOverlapRatio
      })

      if (!hasTooMuchOverlap) break
      topPx += cfg.resolveStepPx
      iterations += 1
    }

    accepted.push({ ...img, top: `${Math.round(topPx)}px` })
    acceptedTopPx.push(topPx)
  }

  return accepted
}

// Mobile hero: 10 images — 4 top, 1 left side, 1 right side, 4 bottom.
// Top/bottom images spread across the full width since they're above/below
// the heading. Side images hug the edges at heading height.
const MOBILE_HERO_SLOTS: Array<{
  position: 'left' | 'right'
  left?: string
  right?: string
  topVh: number
}> = [
  // — Top 4 (above heading, ~2–22vh) —
  { position: 'left',  left:  '0%',  topVh:  2 },
  { position: 'right', right: '0%',  topVh:  6 },
  { position: 'left',  left:  '28%', topVh: 14 },
  { position: 'right', right: '26%', topVh: 20 },
  // — Side 2 (beside heading, ~38–44vh) —
  { position: 'left',  left:  '0%',  topVh: 38 },
  { position: 'right', right: '0%',  topVh: 44 },
  // — Bottom 4 (below heading, ~62–82vh) —
  { position: 'left',  left:  '0%',  topVh: 62 },
  { position: 'right', right: '0%',  topVh: 66 },
  { position: 'left',  left:  '28%', topVh: 74 },
  { position: 'right', right: '26%', topVh: 80 },
]

function buildHeroImages(isMobile: boolean): ImageConfig[] {
  if (isMobile) {
    // Use fixed slots so images frame the hero text from both sides without
    // touching the center. config.w ~220-260 makes the rendered size ~84-99px
    // via the max(minRem, desktopVw) formula — good for a ~390px mobile screen.
    return MOBILE_HERO_SLOTS.map((slot, i) => {
      const r = (s: number) => seededRandom((i + 1) * 41 + s)
      const w = 220 + Math.round(r(2) * 40)
      const ratio = 0.78 + r(3) * 0.44
      const h = Math.round(w * ratio)
      return {
        src: HERO_IMAGE_SOURCES[i],
        position: slot.position,
        left: slot.left,
        right: slot.right,
        top: `${slot.topVh}vh`,
        w,
        h,
        depth: 0.28 + r(6) * 0.42,
        alpha: 1,
        mobileHidden: false,
      }
    })
  }

  const cfg = FLOATING_IMAGE_CONFIG.hero
  const count = Math.min(cfg.desktopCount, HERO_IMAGE_SOURCES.length)
  const zones = FLOATING_IMAGE_CONFIG.geometry.heroFrame.sideSequence

  const images: ImageConfig[] = []
  const sideCounters: Record<'left' | 'right' | 'top' | 'bottom', number> = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }

  for (let i = 0; i < count; i++) {
    const r = (s: number) => seededRandom((i + 1) * 41 + s)
    const zone = zones[i % zones.length]
    const sizeBase = FLOATING_IMAGE_CONFIG.size.minWidthPx
      + Math.round(r(2) * (FLOATING_IMAGE_CONFIG.size.maxWidthPx - FLOATING_IMAGE_CONFIG.size.minWidthPx))

    const ratio = 0.75 + r(3) * 0.55
    const raw = clampImageSize(sizeBase, Math.round(sizeBase * ratio))

    const placement = heroBalancedSlot(zone, sideCounters[zone])
    sideCounters[zone] += 1

    const fallback = heroSidePlacement(zone, i + 1)
    const placeLeft = placement.left ?? fallback.left
    const placeRight = placement.right ?? fallback.right

    const topVh = clamp(
      placement.topVh + (r(5) - 0.5) * 0.35,
      cfg.topStartVh,
      cfg.topCoverageVh,
    )

    images.push({
      src: HERO_IMAGE_SOURCES[i],
      position: placement.position,
      left: placeLeft,
      right: placeRight,
      top: `${topVh.toFixed(2)}vh`,
      w: raw.w,
      h: raw.h,
      depth: 0.2 + r(6) * 0.65,
      alpha: 1,
      mobileHidden: r(8) > 0.7,
    })
  }

  return images
}

function generateDynamicImages(pageHeight: number, vh: number, isMobile: boolean): ImageConfig[] {
  const startY = Math.max(vh * 0.62, vh - 220)
  const endY = pageHeight - (isMobile ? vh * 0.18 : vh * 0.06)
  if (endY <= startY) return []

  const images: ImageConfig[] = []
  const baseGap = isMobile ? 150 : 92
  const positionCycle = FLOATING_IMAGE_CONFIG.dynamic.positionCycle

  let y = startY
  let i = 0

  while (y < endY) {
    const r = (s: number) => seededRandom(i * 13 + s)
    const position = positionCycle[i % positionCycle.length]
    const size = isMobile ? 95 + Math.floor(r(2) * 58) : 100 + Math.floor(r(2) * 56)
    const ratio = 0.78 + r(9) * 0.48
    const clamped = clampImageSize(size, Math.round(size * ratio))
    const boosted = clampImageSize(
      Math.round(clamped.w * SIDE_DENSITY_BOOST),
      Math.round(clamped.h * SIDE_DENSITY_BOOST),
    )

    const posProps = getHorizontalPlacement(position, i * 17 + 1)

    const jitter = (r(3) - 0.5) * (baseGap * 0.2)
    const placeY = Math.round(y + jitter)
    if (placeY >= endY) break

    images.push({
      src: IMAGE_POOL[Math.floor(r(8) * IMAGE_POOL.length)],
      position,
      ...posProps,
      top: `${placeY}px`,
      w: boosted.w,
      h: boosted.h,
      depth: 0.2 + r(4) * 0.6,
      alpha: 1,
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
    '/final_images/image (6).webp',
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

  const [isHovered, setIsHovered] = useState(false)

  const hoverFactor = useSpring(0, { stiffness: 100, damping: 20 })
  useEffect(() => {
    if (FLOATING_IMAGE_CONFIG.interaction.enableHoverEffects) {
      hoverFactor.set(isHovered ? 1 : 0)
    }
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

  const finalX = useTransform([mx, orbitX], ([m, orbit]: number[]) => m + orbit)
  const finalY = useTransform([combinedY], ([c]: number[]) => c)

  const scrollOpacity = 1

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
        zIndex: isHovered ? 50 : Math.round(config.depth * 10),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="w-full h-full cursor-pointer overflow-hidden"
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.2 }}
        transition={{ duration: 0.3 }}
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

type ImagePageClientProps = Record<string, never>

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
  const [viewportWidth, setViewportWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [blogBand, setBlogBand] = useState({ start: 0, end: 0 })

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    setViewportWidth(window.innerWidth)
    const onResize = () => {
      setViewportHeight(window.innerHeight)
      setViewportWidth(window.innerWidth)
    }
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

  const heroImages = useMemo(() => {
    if (!viewportHeight || !viewportWidth) return []
    const generated = buildHeroImages(isMobile)

    // Mobile positions are pre-calibrated via MOBILE_HERO_SLOTS — skip zone
    // enforcement entirely. The zone math uses config.w (algo pixels) but the
    // actual rendered size on mobile is ~38% of that, so enforcement would
    // incorrectly push images to bad positions.
    if (isMobile) return generated

    const zoned = enforceNoImageZones(generated, viewportHeight, viewportWidth)
    const spread = enforceMaxOverlap(zoned, viewportHeight, viewportWidth)
    return enforceNoImageZones(spread, viewportHeight, viewportWidth)
  }, [viewportHeight, viewportWidth, isMobile])

  const heroSources = useMemo(() => new Set(heroImages.map((img) => img.src)), [heroImages])

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
    if (!pageHeight || !viewportHeight || !viewportWidth) return []
    const generated = generateDynamicImages(pageHeight, viewportHeight, isMobile)
    const unique = uniqueDynamicImages(generated, reservedSources)

    const filtered = blogBand.end <= blogBand.start
      ? unique
      : unique.filter((img) => {
      const y = topToPx(img.top, viewportHeight)
      const insideInfographicBand = y >= blogBand.start && y <= blogBand.end

      // Keep side imagery visible; only suppress center/background clutter behind infographics.
      if (!insideInfographicBand) return true
      return img.position !== 'center'
    })

    const zoned = enforceNoImageZones(filtered, viewportHeight, viewportWidth)
    const spread = enforceMaxOverlap(zoned, viewportHeight, viewportWidth)
    return enforceNoImageZones(spread, viewportHeight, viewportWidth)
  }, [pageHeight, viewportHeight, viewportWidth, isMobile, reservedSources, blogBand])

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
    const selected = all.filter((_, idx) => idx % 2 === 0).slice(0, MOBILE_GALLERY_MAX_IMAGES)

    if (selected.length % 2 === 0) return selected

    const fallback = all.find((src, idx) => idx % 2 === 1 && !selected.includes(src))
      ?? all.find((src) => !selected.includes(src))

    return fallback ? [...selected, fallback] : selected.slice(0, -1)
  }, [desktopGalleryColumns])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2)
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mouseX, mouseY])

  // Gyroscope-driven parallax for mobile devices.
  // Maps device tilt (gamma → X, beta → Y) to the same motion values that
  // the desktop mouse handler writes to, so FloatingImage picks it up for free.
  useEffect(() => {
    if (!isMobile || typeof DeviceOrientationEvent === 'undefined') return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      const x = clamp(e.gamma / 30, -1, 1)
      // beta ~45° is the natural phone-hold angle; offset so 45° → 0
      const y = clamp((e.beta - 45) / 30, -1, 1)
      mouseX.set(x)
      mouseY.set(y)
    }

    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }

    if (typeof DOE.requestPermission === 'function') {
      // iOS 13+ requires a user-gesture to grant permission
      const requestOnTouch = async () => {
        try {
          const response = await DOE.requestPermission!()
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        } catch { /* permission denied */ }
      }
      window.addEventListener('touchstart', requestOnTouch, { once: true, capture: true })
      return () => {
        window.removeEventListener('touchstart', requestOnTouch, true)
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [isMobile, mouseX, mouseY])

  return (
    <div ref={pageRef} id='imageMain' className="relative w-full bg-white dark:bg-black text-foreground overflow-hidden sm:-mt-48">
      {/* Hero floating images (always rendered, hand-tuned positions) */}
      {heroImages.map((config, i) => (
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

      {/* Dynamic floating images (desktop/tablet only) */}
      {!isMobile && dynamicImages.map((config, i) => (
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
              <div className="grid grid-cols-2 gap-3">
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
                      className="w-full h-auto object-cover"
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
                        className="w-full h-auto object-cover"
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

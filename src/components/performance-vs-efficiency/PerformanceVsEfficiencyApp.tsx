import { useState, useEffect, useCallback } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { ParamInfographic } from "./components/param-infographic";
import { EfficiencyChart } from "./components/efficiency-chart";
import { DpgBench } from "./components/dpg-bench";
import { GenEvalBench } from "./components/geneval-bench";
import { useTheme } from "./components/theme-context";
import { useIsMobile } from "./components/use-mobile";

/* ─────────────────────────── Data ─────────────────────────── */

interface Model {
  id: string;
  name: string;
  activeParams: number | null;
  totalParams: number | null;
  score: number;
  family: string;
  desc: string;
}

const models: Model[] = [
  { id: "nucleus", name: "Nucleus-Image", activeParams: 2.0, totalParams: 17, score: 0.76, family: "Nucleus", desc: "State-of-the-art MoE diffusion model achieving top performance with only 2B active parameters through sparse expert routing." },
  { id: "cogview4", name: "CogView 4", activeParams: 6.0, totalParams: 6, score: 0.72, family: "CogView", desc: "Tsinghua's latest text-to-image model with improved compositional understanding and visual quality." },
  { id: "omnigen2", name: "OmniGen2", activeParams: 7.0, totalParams: 7, score: 0.70, family: "OmniGen", desc: "Versatile unified generation model supporting multiple image generation and editing tasks." },
  { id: "hidream", name: "HiDream-1-Full", activeParams: 13.2, totalParams: 17, score: 0.72, family: "HiDream", desc: "High-resolution dream synthesis model with MoE architecture activating 13.2B of 17B total parameters." },
  { id: "qwen-img", name: "Qwen-Image", activeParams: 20, totalParams: 20, score: 0.765, family: "Qwen", desc: "Alibaba's large-scale image generation model built on the Qwen architecture with massive parameter scaling." },
  { id: "seedream", name: "Seedream 3.0", activeParams: null, totalParams: null, score: 0.75, family: "Seedream", desc: "ByteDance's third-generation image synthesis model with refined aesthetic training. Parameter count undisclosed." },
  { id: "gpt-img", name: "GPT Image 1 High", activeParams: null, totalParams: null, score: 0.74, family: "GPT", desc: "OpenAI's high-quality image generation mode integrated with the GPT architecture. Parameter count undisclosed." },
  { id: "bagel", name: "BAGEL", activeParams: 7.0, totalParams: 14, score: 0.66, family: "Other", desc: "MoE architecture for general-purpose editing and layout-aware image generation, activating 7B of 14B total." },
  { id: "showo2-7b", name: "Show-o2 7B", activeParams: 7.0, totalParams: 7, score: 0.64, family: "Other", desc: "Unified multimodal model for both understanding and generation at the 7B scale." },
  { id: "janus-pro", name: "Janus-Pro-7B", activeParams: 7.0, totalParams: 7, score: 0.63, family: "Other", desc: "Dual-encoder architecture separating visual understanding from generation pathways." },
  { id: "blip3o", name: "BLIP3-O", activeParams: 8.0, totalParams: 8, score: 0.65, family: "Other", desc: "Salesforce's third-generation bootstrapped language-image model with output generation capability." },
  { id: "emu3", name: "Emu3-Gen", activeParams: 8.5, totalParams: 8.5, score: 0.63, family: "Other", desc: "Meta's autoregressive visual generation model predicting next visual tokens." },
  { id: "flux-dev", name: "FLUX.1 Dev", activeParams: 12.0, totalParams: 12, score: 0.64, family: "FLUX", desc: "Black Forest Labs' open-weight development model with distilled guidance for efficient inference." },
  { id: "sana15", name: "SANA-1.5", activeParams: 4.8, totalParams: 4.8, score: 0.60, family: "Other", desc: "Efficient linear-attention based diffusion model achieving strong results with minimal compute." },
  { id: "lumina2", name: "Lumina-Image 2.0", activeParams: 2.6, totalParams: 2.6, score: 0.65, family: "Other", desc: "Second-generation Lumina model with improved high-resolution synthesis capabilities." },
  { id: "showo2-15b", name: "Show-o2 1.5B", activeParams: 1.5, totalParams: 1.5, score: 0.64, family: "Other", desc: "Compact 1.5B variant of Show-o2, optimized for efficient multimodal generation." },
  { id: "sdxl", name: "SDXL", activeParams: 2.6, totalParams: 2.6, score: 0.53, family: "Stable Diffusion", desc: "A significant leap in quality with dual text encoders and a refined UNet architecture." },
];

/* ─────────────────── Palette ──────────────────── */

const familyConfig: Record<string, { color: string; light: string }> = {
  Nucleus: { color: "#3B9EFF", light: "#0066DC" },
  Qwen: { color: "#34EAD0", light: "#0A7D6E" },
  Seedream: { color: "#FFD04A", light: "#B45309" },
  GPT: { color: "#FF7A90", light: "#C01040" },
  CogView: { color: "#FF9F43", light: "#C56A00" },
  HiDream: { color: "#A78BFA", light: "#7C3AED" },
  OmniGen: { color: "#F472B6", light: "#DB2777" },
  FLUX: { color: "#FF85C8", light: "#B91C5C" },
  "Stable Diffusion": { color: "#70B5FF", light: "#1D4FCC" },
  Other: { color: "#7C8BA1", light: "#546478" },
};

const families = Object.keys(familyConfig);

const nucleus = models.find((m) => m.id === "nucleus")!;

const toChart = (list: Model[]) => list.filter((m) => m.activeParams != null).map((m) => ({ ...m, x: m.activeParams, y: m.score }));

const unknownParamModels = models.filter((m) => m.activeParams == null);

/* ─────────────────── Mono number utility ──────────────────── */

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  fontVariantNumeric: "tabular-nums",
};

/* ───────── Bubble Dot Component ───────── */

const BubbleDot = (props: any) => {
  const { cx, cy, payload, theme } = props;
  if (!payload || cx == null || cy == null) return null;

  const isDark = (theme ?? "dark") === "dark";
  const cfg = familyConfig[payload.family] ?? { color: "#94a3b8", light: "#64748b" };
  const color = isDark ? cfg.color : cfg.light;
  const uid = payload.id;
  const isNucleus = payload.id === "nucleus";
  const isKey = payload.family !== "Other";
  const r = isNucleus ? 7.5 : isKey ? 5 : 3.5;

  return (
    <g>
      <defs>
        <radialGradient id={`gl-${uid}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={isDark ? "#fff" : "#fff"} stopOpacity={isNucleus ? 0.35 : 0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.5 : 0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
        <filter id={`bf-${uid}`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={isNucleus ? 8 : 4} />
        </filter>
      </defs>

      {/* Ambient glow */}
      <circle cx={cx} cy={cy} r={r * 4} fill={`url(#bg-${uid})`} opacity={isDark ? 0.12 : 0.09} filter={`url(#bf-${uid})`} />

      {/* Main dot with subtle gradient for 3D effect */}
      <circle cx={cx} cy={cy} r={r} fill={color} opacity={isKey ? (isDark ? 0.92 : 0.88) : (isDark ? 0.35 : 0.3)} />
      {/* Catchlight */}
      {isKey && (
        <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.35} fill="white" opacity={isDark ? 0.15 : 0.25} />
      )}

      {/* Nucleus animated rings */}
      {isNucleus && (
        <>
          <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={color} strokeWidth={0.8} opacity={0.3}>
            <animate attributeName="r" values={`${r + 4};${r + 14};${r + 4}`} dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={color} strokeWidth={0.4} opacity={0.15}>
            <animate attributeName="r" values={`${r + 8};${r + 20};${r + 8}`} dur="3s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0;0.15" dur="3s" begin="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)"} strokeWidth={0.6} />
        </>
      )}

      {/* Label for key models */}
      {isKey && (
        <>
          <line
            x1={cx + r + 2} y1={cy}
            x2={cx + r + 6} y2={cy}
            stroke={color} strokeWidth={0.5} opacity={isDark ? 0.2 : 0.25}
          />
          <text
            x={cx + r + 8} y={cy + 3.5}
            fill={color}
            fontSize={isNucleus ? 10.5 : 9} fontFamily="'Inter', sans-serif"
            fontWeight={isNucleus ? 600 : 400}
            letterSpacing="-0.02em"
            opacity={isDark ? 0.82 : 0.88}
          >
            {payload.name}
          </text>
          {/* Score sub-label for Nucleus */}
          {isNucleus && (
            <text
              x={cx + r + 8} y={cy + 14}
              fill={color}
              fontSize={8.5} fontFamily="'JetBrains Mono', monospace"
              fontWeight={400}
              letterSpacing="0.01em"
              opacity={isDark ? 0.6 : 0.66}
            >
              {payload.score.toFixed(3)}
            </text>
          )}
        </>
      )}
    </g>
  );
};

/* ═══════════════════════════════════════════════════════════
   Tooltip
   ═══════════════════════════════════════════════════════════ */

function ChartTooltipInner({ active, payload }: any) {
  const { t, theme } = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Model;
  const cfg = familyConfig[d.family];
  const isDark = theme === "dark";
  const color = isDark ? cfg?.color : cfg?.light;
  const hasParams = d.activeParams != null;

  return (
    <div style={{
      background: t.tooltipBg,
      backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)",
      border: `1px solid ${t.tooltipBorder}`, borderRadius: 16,
      boxShadow: t.tooltipShadow, minWidth: 220, overflow: "hidden",
    }}>
      {/* Colored accent bar at top */}
      <div style={{
        height: 2.5, borderRadius: "16px 16px 0 0",
        background: `linear-gradient(90deg, transparent 5%, ${color} 30%, ${color}88 70%, transparent 95%)`,
        opacity: isDark ? 0.6 : 0.5,
      }} />
      <div style={{ padding: "14px 18px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${isDark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)"}, ${color} 60%)`,
          flexShrink: 0,
          boxShadow: `0 0 8px ${color}40`,
        }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: t.tooltipTitle, letterSpacing: "-0.02em" }}>{d.name}</p>
          <p style={{ margin: 0, marginTop: 2, fontSize: 10.5, color: t.tooltipSub, letterSpacing: "0.01em" }}>{d.family}{d.activeParams !== d.totalParams ? " · MoE" : " · Dense"}</p>
        </div>
      </div>
      <div style={{
        padding: "11px 18px 15px", display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "10px 20px", borderTop: `1px solid ${t.tooltipDivider}`,
      }}>
        <MicroStat label="Score" value={d.score.toFixed(3)} color={color} />
        {hasParams && d.activeParams !== d.totalParams ? (
          <>
            <MicroStat label="Active" value={`${d.activeParams}B`} />
            <MicroStat label="Total" value={`${d.totalParams}B`} />
          </>
        ) : (
          <MicroStat label="Params" value={hasParams ? `${d.activeParams}B` : "Undisclosed"} />
        )}
        <MicroStat label="Score/B" value={hasParams ? (d.score / d.activeParams!).toFixed(3) : "N/A"} highlight={d.id === "nucleus"} />
      </div>
    </div>
  );
}

function MicroStat({ label, value, color, highlight }: { label: string; value: string; color?: string; highlight?: boolean }) {
  const { t, theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div>
      <p style={{ margin: 0, fontSize: 9, color: t.tooltipLabel, letterSpacing: "0.05em", fontWeight: 500, textTransform: "uppercase" as const }}>{label}</p>
      <p style={{
        margin: 0, marginTop: 2, fontSize: 15, fontWeight: 600, letterSpacing: "-0.03em",
        ...mono,
        color: highlight
          ? (isDark ? "#3B9EFF" : "#0066DC")
          : color || t.tooltipValue,
      }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════════════════════ */

function StatCard({ label, value, sub, delay, accent, icon }: {
  label: string; value: string; sub: string; delay: number; accent: string;
  icon: React.ReactNode;
}) {
  const { t, theme } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex-1 min-w-0"
      style={{
        background: t.cardBg, backdropFilter: t.cardInset, WebkitBackdropFilter: t.cardInset,
        border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: "26px 28px 24px",
        
        transition: "all 0.45s cubic-bezier(0.22,0.61,0.36,1)",
        position: "relative", overflow: "hidden",
      }}
      whileHover={{ y: -2, transition: { duration: 0.3 } }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 10%, ${accent}${isDark ? "55" : "66"} 35%, ${accent}${isDark ? "33" : "44"} 65%, transparent 90%)`,
        borderRadius: "20px 20px 0 0",
      }} />
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
        width: 180, height: 80, borderRadius: "50%",
        background: accent, opacity: isDark ? 0.04 : 0.055, filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, position: "relative" }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${accent}${isDark ? "12" : "0e"}`,
          border: `1px solid ${accent}${isDark ? "18" : "14"}`,
        }}>
          {icon}
        </div>
        <p style={{
          margin: 0, fontSize: 10, color: accent, letterSpacing: "0.06em",
          fontWeight: 600, textTransform: "uppercase" as const, opacity: isDark ? 0.65 : 0.75,
        }}>{label}</p>
      </div>

      <p style={{
        margin: 0, fontSize: 38, color: t.statValue,
        fontWeight: 700, letterSpacing: "-0.045em",
        ...mono,
        lineHeight: 1, position: "relative",
      }}>{value}</p>
      <p style={{
        margin: 0, marginTop: 14, fontSize: 12.5, color: t.statSub,
        letterSpacing: "-0.01em", fontWeight: 400, lineHeight: 1.45,
      }}>{sub}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Section Divider
   ═══════════════════════════════════════════════════════════ */

function SectionDivider({ delay = 0 }: { delay?: number }) {
  const { t, theme } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();
  const lineHeight = mob ? 1.5 : 2;
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        margin: mob ? "32px 0" : "52px 0",
        transformOrigin: "center",
        display: "flex", alignItems: "center", gap: 0,
        position: "relative",
      }}
    >
      {mob && (
        <div
          style={{
            position: "absolute",
            inset: "-18px 0",
            background: isDark ? "#000" : "#fff",
            zIndex: 0,
          }}
          aria-hidden
        />
      )}
      <div style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        height: lineHeight,
        background: isDark
          ? "linear-gradient(90deg, transparent 0%, rgba(59,158,255,0.18) 28%, rgba(129,140,248,0.28) 52%, rgba(59,158,255,0.18) 76%, transparent 100%)"
          : "linear-gradient(90deg, transparent 0%, rgba(0,102,220,0.2) 28%, rgba(79,70,229,0.3) 52%, rgba(0,102,220,0.2) 76%, transparent 100%)",
        boxShadow: isDark
          ? "0 0 10px rgba(59,158,255,0.16)"
          : "0 0 8px rgba(0,102,220,0.12)",
      }} />
      <div style={{
        position: "relative",
        zIndex: 1,
        width: mob ? 7 : 8,
        height: mob ? 7 : 8,
        borderRadius: 2,
        transform: "rotate(45deg)",
        background: isDark ? "rgba(129,140,248,0.34)" : "rgba(79,70,229,0.38)",
        border: `1px solid ${isDark ? "rgba(167,180,255,0.55)" : "rgba(79,70,229,0.5)"}`,
        boxShadow: isDark
          ? "0 0 10px rgba(129,140,248,0.38), inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 0 8px rgba(79,70,229,0.24), inset 0 0 0 1px rgba(255,255,255,0.35)",
        flexShrink: 0,
        margin: mob ? "0 5px" : "0 7px",
      }} />
      <div style={{
        position: "relative",
        zIndex: 1,
        flex: 1,
        height: lineHeight,
        background: isDark
          ? "linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.2) 24%, rgba(52,211,153,0.22) 52%, rgba(129,140,248,0.16) 76%, transparent 100%)"
          : "linear-gradient(90deg, transparent 0%, rgba(79,70,229,0.24) 24%, rgba(5,150,105,0.24) 52%, rgba(79,70,229,0.2) 76%, transparent 100%)",
        boxShadow: isDark
          ? "0 0 10px rgba(52,211,153,0.14)"
          : "0 0 8px rgba(5,150,105,0.1)",
      }} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Theme Toggle
   ═══════════════════════════════════════════════════════════ */

function ThemeToggle() {
  const { theme, toggle, t } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      className="cursor-pointer"
      style={{
        width: 40, height: 40, borderRadius: 13,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: t.toggleBg, border: `1px solid ${t.toggleBorder}`,
        color: t.toggleColor,
        transition: "all 0.45s cubic-bezier(0.22,0.61,0.36,1)",
        flexShrink: 0,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.svg
            key="sun"
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   Quadrant Label Component
   ═══════════════════════════════════════════════════════════ */

function QuadrantLabel({ x, y, text, theme }: { x: number; y: number; text: string; theme: string }) {
  const isDark = theme === "dark";
  return (
    <text
      x={x} y={y}
      fill={isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.26)"}
      fontSize={9}
      fontFamily="'Inter', sans-serif"
      fontWeight={500}
      letterSpacing="0.08em"
      textAnchor="middle"
    >
      {text}
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════════════════════ */

function AppInner({ disableAmbientBackground }: { disableAmbientBackground?: boolean }) {
  const { t, theme } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const ThemedDot = useCallback((p: any) => <BubbleDot {...p} theme={theme} />, [theme]);

  if (!mounted) {
    return (
      <div className="size-full flex flex-col items-center overflow-y-auto overflow-x-hidden bg-transparent [scroll-behavior:smooth] antialiased">
        <div className="w-full max-w-5xl relative z-10  md:py-20">
          <div className="mb-10 h-4 w-36 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-14 w-64 rounded-xl bg-black/10 dark:bg-white/10 md:h-20 md:w-96" />
          <div className="mt-6 h-5 w-full max-w-xl rounded bg-black/10 dark:bg-white/10" />
          <div className="mt-2 h-5 w-4/5 max-w-lg rounded bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col items-center overflow-y-auto overflow-x-hidden bg-transparent [scroll-behavior:smooth] antialiased">
      {!disableAmbientBackground && (
        <>
          {/* Ambient blooms — asymmetric for organic feel */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-500" aria-hidden>
            <div className="absolute -left-[5%] -top-[25%] h-[900px] w-[1000px] blur-[120px] bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(0,102,220,0.05)_0%,transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(59,158,255,0.05)_0%,transparent_60%)]" />
            <div className="absolute -bottom-[15%] -right-[8%] h-[700px] w-[800px] blur-[100px] bg-[radial-gradient(ellipse_70%_50%_at_90%_80%,rgba(147,51,234,0.04)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_90%_80%,rgba(192,132,252,0.04)_0%,transparent_55%)]" />
            <div className="absolute left-[45%] top-[30%] h-[500px] w-[900px] -translate-x-1/2 blur-[110px] bg-[radial-gradient(ellipse_90%_40%_at_50%_40%,rgba(5,150,105,0.03)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_90%_40%_at_50%_40%,rgba(52,211,153,0.02)_0%,transparent_55%)]" />
            <div className="absolute right-[10%] top-[5%] h-[400px] w-[600px] blur-[90px] bg-[radial-gradient(ellipse_60%_40%_at_70%_10%,rgba(194,65,12,0.025)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_60%_40%_at_70%_10%,rgba(251,146,60,0.02)_0%,transparent_50%)]" />
          </div>

          {/* Subtle noise grain overlay */}
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.012] dark:opacity-[0.022] bg-repeat bg-[length:128px_128px] mix-blend-overlay"
            aria-hidden
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}

      <div className={`w-full max-w-5xl relative z-10 ${mob ? " py-12" : " py-20"}`}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className={mob ? "mb-10" : "mb-16"}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Pill badge with subtle shimmer */}
              <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#0066DC]/10  px-4 py-[5px] pl-[10px] backdrop-blur-[12px] dark:border-[#3B9EFF]/10 dark:bg-[#3B9EFF]/[0.06]">
                {/* Shimmer */}
                <div className="absolute left-[-100%] top-0 h-full w-[200%] animate-[shimmer_4s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent_40%,rgba(0,102,220,0.06)_50%,transparent_60%)] dark:bg-[linear-gradient(90deg,transparent_40%,rgba(59,158,255,0.08)_50%,transparent_60%)]" />
                <span className="h-1.5 w-1.5 animate-[pulse_2.5s_ease-in-out_infinite] rounded-full bg-[#0066DC] shadow-[0_0_10px_rgba(0,102,220,0.5)] dark:bg-[#3B9EFF] dark:shadow-[0_0_12px_rgba(59,158,255,0.7)]" />
                <span className="relative text-[11px] font-medium tracking-[0.02em] text-[#0057C8] dark:text-[#76BBFF]">Benchmark Analysis</span>
              </div>

              <h1 className={`m-0 ${mob ? "mt-[22px]" : "mt-[30px]"} leading-none tracking-[-0.05em] text-black/95 dark:text-white/95`}>
                <span className={`block ${mob ? "mb-3 text-[10px]" : "mb-4 text-[11.5px]"} font-semibold uppercase tracking-[0.12em] text-black/52 dark:text-white/50`}>
                  Diffusion Model Benchmark
                </span>
                <span className={`${mob ? "text-4xl" : "text-[60px]"} inline font-bold`}>
                  Nucleus
                </span>
                <span className={`${mob ? "text-4xl ml-[6px]" : "text-[60px] ml-[10px]"} inline bg-[linear-gradient(135deg,#0055CC_0%,#4F46E5_40%,#7C3AED_80%,#9333EA_100%)] bg-clip-text font-bold text-transparent dark:bg-[linear-gradient(135deg,#3B9EFF_0%,#818cf8_40%,#c084fc_80%,#f0abfc_100%)]`}>
                  Image
                </span>
                <span className={`relative inline-block align-super ${mob ? "top-[-6px] ml-2 rounded-[5px] px-2 py-[3px] text-[11px]" : "top-[-12px] ml-[14px] rounded-[7px] px-3 py-1 text-base"} border border-[#0066DC]/25 bg-[#0066DC]/[0.06] font-semibold uppercase tracking-[0.15em] text-[#0057C8] backdrop-blur-[8px] dark:border-[#3B9EFF]/30 dark:bg-[#3B9EFF]/[0.1] dark:text-[#82C4FF]`}>
                  MoE
                </span>
              </h1>

              <p className={`m-0 ${mob ? "mt-4 text-[14.5px]" : "mt-6 text-[17px]"} max-w-[460px] font-normal leading-[1.6] tracking-[-0.02em] text-black/68 dark:text-white/68`}>
                Leading performance with{" "}
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">10x fewer</span>
                {" "}active parameters.
              </p>
            </div>
            {/* <ThemeToggle /> */}
          </div>
        </motion.header>

        {/* Stat Cards */}
        <div className={`grid ${mob ? "grid-cols-1 gap-3 mb-9" : "grid-cols-3 gap-[14px] mb-14"}`}>
          <StatCard
            label="Score"
            value={nucleus.score.toFixed(3)}
            sub="Highest overall performance"
            delay={0.08}
            accent="#818cf8"
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.7}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
          />
          <StatCard
            label="Active Params"
            value={`${nucleus.activeParams}B`}
            sub="Sparse expert routing of 17B total"
            delay={0.16}
            accent="#34d399"
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.7}>
                <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
              </svg>
            }
          />
          <StatCard
            label="Efficiency"
            value={(nucleus.score / nucleus.activeParams!).toFixed(2)}
            sub="Score per active billion parameters"
            delay={0.24}
            accent="#f472b6"
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.7}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            }
          />
        </div>

        {/* Chart Panel */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className={`relative overflow-hidden border border-[rgba(0,0,0,0.065)] dark:border-[rgba(255,255,255,0.08)] bg-white/10   backdrop-blur-[24px] backdrop-saturate-[1.2] transition-colors dark:bg-white/[0.08] ${mob ? "rounded-[18px]" : "rounded-3xl"}`}
          
        >
          {/* Top highlight */}
          <div className={`absolute left-0 right-0 top-0 z-[1] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.8)_20%,rgba(255,255,255,0.8)_80%,transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.05)_20%,rgba(255,255,255,0.05)_80%,transparent)] ${mob ? "rounded-t-[18px]" : "rounded-t-3xl"}`} />

          <div className={mob ? "px-4 pb-[18px] pt-[22px]" : "px-9 pb-7 pt-9"}>
            <div className={`flex ${mob ? "flex-col items-start gap-[14px] mb-5" : "flex-row items-end justify-between gap-4 mb-8"}`}>
              <div>
                <p className="mb-[10px] text-[10px] font-semibold uppercase tracking-[0.1em] text-black/52 dark:text-white/48">
                  Performance Chart
                </p>
                <p className={`${mob ? "text-base" : "text-[19px]"} m-0 font-semibold tracking-[-0.03em] text-black/90 dark:text-white/90`}>
                  Active Params{" "}
                  <span className={`${mob ? "text-[13px]" : "text-base"} font-medium text-indigo-700/72 dark:text-indigo-300/78`}>vs</span>
                  {" "}Overall Performance
                </p>
              </div>
              {/* Color legend — frosted strip */}
              <div className={`flex flex-wrap ${mob ? "gap-2 rounded-[10px] px-[10px] py-[6px]" : "gap-4 rounded-[10px] px-[14px] py-[7px]"} border border-black/5 bg-black/[0.012] dark:border-white/[0.03] dark:bg-white/[0.015]`}>
                {families.filter(f => f !== "Other").map((f) => {
                  const c = isDark ? familyConfig[f].color : familyConfig[f].light;
                  return (
                    <div key={f} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full opacity-85"/>
                      <span className={`${mob ? "text-[9px]" : "text-[10.5px]"} font-medium tracking-[-0.01em] text-black/62 dark:text-white/62`}>{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginLeft: mob ? -8 : 0, marginRight: mob ? -8 : 0 }}>
              <ResponsiveContainer width="100%" height={mob ? 320 : 520}>
                <ScatterChart margin={mob ? { top: 10, right: 8, bottom: 32, left: 2 } : { top: 14, right: 20, bottom: 38, left: 20 }}>
                  {/* Quadrant tinting */}
                  <ReferenceArea x1={0} x2={6} y1={0.7} y2={0.8} fill={t.quadrantA} stroke="none" />
                  <ReferenceArea x1={15} x2={24} y1={0.5} y2={0.65} fill={t.quadrantB} stroke="none" />

                  <CartesianGrid stroke={t.gridStroke} strokeDasharray="1 6" strokeLinecap="round" />
                  <XAxis
                    type="number" dataKey="x"
                    tick={{ fill: isDark ? "rgba(147,161,255,0.66)" : "rgba(79,70,229,0.78)", fontSize: mob ? 9 : 10.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
                    axisLine={{ stroke: t.axisStroke }} tickLine={false}
                    domain={[0, 24]} ticks={mob ? [0, 6, 12, 18, 24] : [0, 4, 8, 12, 16, 20, 24]}
                    tickFormatter={(v: number) => `${v}B`}
                    label={{ value: mob ? "Active Params (B)" : "Active Parameters (Billions)", position: "bottom", offset: mob ? 12 : 18, style: { fill: isDark ? "rgba(147,161,255,0.72)" : "rgba(79,70,229,0.75)", fontSize: mob ? 8.5 : 10, fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em", fontWeight: 600 } }}
                  />
                  <YAxis
                    type="number" dataKey="y"
                    tick={{ fill: isDark ? "rgba(74,222,170,0.66)" : "rgba(5,150,105,0.8)", fontSize: mob ? 9 : 10.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
                    axisLine={{ stroke: t.axisStroke }} tickLine={false}
                    domain={[0.5, 0.8]} ticks={mob ? [0.5, 0.6, 0.7, 0.8] : [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80]}
                    width={mob ? 30 : 60}
                    label={mob ? undefined : { value: "Overall Performance", angle: -90, position: "insideLeft", offset: -6, style: { fill: isDark ? "rgba(74,222,170,0.72)" : "rgba(5,150,105,0.74)", fontSize: 10, fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em", textAnchor: "middle", fontWeight: 600 } }}
                  />
                  {/* Nucleus score reference line */}
                  <ReferenceLine y={0.76} stroke={t.refLineStroke} strokeDasharray="4 6" strokeWidth={1} label={mob ? undefined : {
                    value: "Nucleus Score",
                    position: "right",
                    style: { fill: isDark ? "rgba(120,191,255,0.68)" : "rgba(0,102,220,0.72)", fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.02em" },
                  }} />
                  <Tooltip
                    content={<ChartTooltipInner />}
                    cursor={false}
                    isAnimationActive={false}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Scatter data={toChart(models)} shape={<ThemedDot />}>
                    {toChart(models).map((m) => (
                      <Cell key={`c-${m.id}`} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Unknown params models */}
          {unknownParamModels.length > 0 && (
            <div
              className={`
      flex border border-dashed border-black/10 bg-black/[0.012] 
      dark:border-white/[0.05] dark:bg-white/[0.012]
      ${mob
                  ? "mx-4 mb-4 flex-col gap-4 p-4 rounded-xl"
                  : "mx-9 mb-7 flex-row items-center gap-6 px-6 py-4 rounded-[14px]"}
    `}
            >
              {/* Header / Icon Section */}
              <div className="flex shrink-0 items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)"} strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-[10px] 
       font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                  Params Unknown
                </p>
              </div>

              {/* Vertical Separator (Desktop Only) */}
              {!mob && <div className="h-8 w-px bg-black/10 dark:bg-white/10" />}

              {/* Models Grid */}
              <div className={`grid flex-1 ${mob ? "grid-cols-1 gap-3" : "grid-cols-2 gap-x-8 gap-y-3"}`}>
                {unknownParamModels.map((m) => {
                  const cfg = familyConfig[m.family] ?? familyConfig.Other;
                  const color = isDark ? cfg.color : cfg.light;
                  return (
                    <div key={m.id} className="flex items-center gap-3 min-w-0">
                      {/* Status Indicator */}
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-dashed"
                        style={{ borderColor: color, opacity: isDark ? 0.6 : 0.7 }}
                      />

                      {/* Model Info */}
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="truncate text-[13px] font-medium text-black/80 dark:text-white/85">
                          {m.name}
                        </span>
                        <span style={{ ...mono }} className="text-[10px] text-black/45 dark:text-white/45">
                          Score {m.score.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        <SectionDivider delay={0.3} />

        {/* Param Infographic */}
        <ParamInfographic />

        <SectionDivider delay={0.5} />

        {/* Efficiency Chart */}
        <EfficiencyChart />

        <SectionDivider delay={0.7} />

        {/* DPG Bench */}
        <DpgBench />

        <SectionDivider delay={0.9} />

        {/* GenEval Bench */}
        <GenEvalBench />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-[72px] pb-10 text-center"
        >
          <div className="mb-8 h-px bg-[linear-gradient(90deg,transparent,rgba(0,102,220,0.06)_20%,rgba(147,51,234,0.05)_50%,rgba(5,150,105,0.04)_80%,transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(59,158,255,0.04)_20%,rgba(192,132,252,0.035)_50%,rgba(52,211,153,0.03)_80%,transparent)]" />
          <div className="mb-[14px] inline-flex items-center gap-2">
            <div className="h-[5px] w-[5px] rounded-full bg-[#0066DC] opacity-30 dark:bg-[#3B9EFF]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0066DC]/65 dark:text-[#7EC0FF]">
              Nucleus-Image
            </span>
            <div className="h-[5px] w-[5px] rounded-full bg-[#0066DC] opacity-30 dark:bg-[#3B9EFF]" />
          </div>
          <p className="m-0 text-[11px] leading-[1.5] tracking-[-0.005em] text-black/52 dark:text-white/52">
            Performance scores are approximate from publicly available benchmarks.
          </p>
          <p style={{ ...mono }} className="m-0 mt-2 text-[10px] tracking-[0.02em] text-black/48 dark:text-white/48">
            Data compiled March 2026
          </p>
        </motion.footer>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function App({ disableAmbientBackground }: { disableAmbientBackground?: boolean }) {
  return <AppInner disableAmbientBackground={disableAmbientBackground} />;
}
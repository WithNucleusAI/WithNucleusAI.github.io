import { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { useIsMobile } from "./use-mobile";

interface EfficiencyEntry {
  id: string;
  name: string;
  activeParams: number;
  totalParams: number;
  score: number;
  efficiency: number;
  family: string;
  arch: string;
}

const modelColors: Record<string, { dark: string; light: string }> = {
  nucleus:      { dark: "#4F7CFF", light: "#0066DC" },
  "qwen-img":   { dark: "#34EAD0", light: "#0A7D6E" },
  cogview4:     { dark: "#FF9F43", light: "#C56A00" },
  "flux-dev":   { dark: "#FF85C8", light: "#B91C5C" },
  sdxl:         { dark: "#70B5FF", light: "#1D4FCC" },
  hidream:      { dark: "#A78BFA", light: "#7C3AED" },
  omnigen2:     { dark: "#F472B6", light: "#DB2777" },
  bagel:        { dark: "#FBBF24", light: "#B45309" },
  "showo2-7b":  { dark: "#34D399", light: "#059669" },
  "janus-pro":  { dark: "#FB923C", light: "#C2410C" },
  blip3o:       { dark: "#60A5FA", light: "#2563EB" },
  emu3:         { dark: "#C084FC", light: "#9333EA" },
  sana15:       { dark: "#2DD4BF", light: "#0D9488" },
  lumina2:      { dark: "#E879F9", light: "#A21CAF" },
  "showo2-15b": { dark: "#4ADE80", light: "#16A34A" },
};

const fallback = { dark: "#94A3B8", light: "#64748B" };

const rawModels = [
  { id: "nucleus", name: "Nucleus-Image", activeParams: 2.0, totalParams: 17, score: 0.76, family: "Nucleus", arch: "MoE" },
  { id: "cogview4", name: "CogView 4", activeParams: 6.0, totalParams: 6, score: 0.72, family: "CogView", arch: "Dense" },
  { id: "omnigen2", name: "OmniGen2", activeParams: 7.0, totalParams: 7, score: 0.70, family: "Other", arch: "Dense" },
  { id: "hidream", name: "HiDream-1-Full", activeParams: 13.2, totalParams: 17, score: 0.72, family: "Other", arch: "MoE" },
  { id: "qwen-img", name: "Qwen-Image", activeParams: 20, totalParams: 20, score: 0.765, family: "Qwen", arch: "Dense" },
  { id: "bagel", name: "BAGEL", activeParams: 7.0, totalParams: 14, score: 0.66, family: "Other", arch: "MoE" },
  { id: "showo2-7b", name: "Show-o2 7B", activeParams: 7.0, totalParams: 7, score: 0.64, family: "Other", arch: "Dense" },
  { id: "janus-pro", name: "Janus-Pro-7B", activeParams: 7.0, totalParams: 7, score: 0.63, family: "Other", arch: "Dense" },
  { id: "blip3o", name: "BLIP3-O", activeParams: 8.0, totalParams: 8, score: 0.65, family: "Other", arch: "Dense" },
  { id: "emu3", name: "Emu3-Gen", activeParams: 8.5, totalParams: 8.5, score: 0.63, family: "Other", arch: "Dense" },
  { id: "flux-dev", name: "FLUX.1 Dev", activeParams: 12.0, totalParams: 12, score: 0.64, family: "FLUX", arch: "Dense" },
  { id: "sana15", name: "SANA-1.5", activeParams: 4.8, totalParams: 4.8, score: 0.60, family: "Other", arch: "Dense" },
  { id: "lumina2", name: "Lumina-Image 2.0", activeParams: 2.6, totalParams: 2.6, score: 0.65, family: "Other", arch: "Dense" },
  { id: "showo2-15b", name: "Show-o2 1.5B", activeParams: 1.5, totalParams: 1.5, score: 0.64, family: "Other", arch: "Dense" },
  { id: "sdxl", name: "SDXL", activeParams: 2.6, totalParams: 2.6, score: 0.53, family: "Stable Diffusion", arch: "Dense" },
];

const data: EfficiencyEntry[] = rawModels
  .map((m) => ({ ...m, efficiency: m.score / m.activeParams }))
  .sort((a, b) => b.efficiency - a.efficiency);

const maxEfficiency = data[0].efficiency;
const nucleusEntry = data.find((d) => d.id === "nucleus")!;
const restData = data.filter((d) => d.id !== "nucleus");

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  fontVariantNumeric: "tabular-nums",
};

/* ── Stat mini card inside hero ── */
function HeroStat({ label, value, sub, isDark }: { label: string; value: string; sub?: string; isDark: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: "0.07em",
        textTransform: "uppercase" as const,
        color: isDark ? "rgba(59,158,255,0.72)" : "rgba(0,102,220,0.7)",
      }}>{label}</p>
      <p style={{
        margin: 0, marginTop: 5, fontSize: 18, fontWeight: 700,
        letterSpacing: "-0.03em", lineHeight: 1,
        ...mono,
        color: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.82)",
      }}>{value}</p>
      {sub && (
        <p style={{
          margin: 0, marginTop: 4, fontSize: 10,
          color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
          letterSpacing: "-0.005em",
        }}>{sub}</p>
      )}
    </div>
  );
}

export function EfficiencyChart() {
  const { theme, t } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const secondEntry = restData[0];
  const multiplier = (nucleusEntry.efficiency / secondEntry.efficiency).toFixed(1);
  const nucleusColor = isDark ? "#4F7CFF" : "#0066DC";

  // Median efficiency for context line
  const efficiencies = data.map(d => d.efficiency);
  const median = efficiencies.sort((a, b) => a - b)[Math.floor(efficiencies.length / 2)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        borderRadius: mob ? 18 : 24,
        background: t.panelBg,
        ...(mob
          ? {}
          : {
              backdropFilter: "blur(24px) saturate(1.3)",
              WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            }),
        border: `1px solid ${t.panelBorder}`,
       
        overflow: "hidden",
        position: "relative" as const,
      }}
    >
      {/* Top hairline */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 1,
        background: isDark
          ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 75%, transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.8) 75%, transparent)",
        borderRadius: `${mob ? 18 : 24}px ${mob ? 18 : 24}px 0 0`,
      }} />

      <div style={{ padding: mob ? "28px 20px 24px" : "44px 44px 40px" }}>

        {/* Header row */}
        <div style={{ display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "flex-start" : "flex-end", justifyContent: "space-between", gap: mob ? 12 : 0, marginBottom: mob ? 24 : 38 }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase" as const, color: t.sectionKicker,
            }}>
              Efficiency Ranking
            </p>
            <p style={{
              margin: 0, marginTop: 10, fontSize: 20, fontWeight: 600,
              letterSpacing: "-0.035em", color: t.chartTitle,
            }}>
              Score per Billion Parameters
            </p>
          </div>
          {/* Axis key */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "6px 14px", borderRadius: 10,
            background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#4F7CFF" : "#0066DC"} strokeWidth="2" strokeLinecap="round" opacity={0.5}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span style={{ fontSize: 11, color: t.chartSub, fontWeight: 600 }}>Higher = more efficient</span>
            </div>
          </div>
        </div>

        {/* ── Nucleus Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            position: "relative",
            borderRadius: 22,
            marginBottom: 28,
            overflow: "hidden",
          }}
        >
          {/* Background gradient fill */}
          <div style={{
            position: "absolute", inset: 0,
            background: isDark
              ? "linear-gradient(135deg, rgba(59,158,255,0.05) 0%, rgba(129,140,248,0.025) 50%, rgba(192,132,252,0.015) 100%)"
              : "linear-gradient(135deg, rgba(0,102,220,0.035) 0%, rgba(79,70,229,0.018) 50%, rgba(147,51,234,0.01) 100%)",
          }} />
          {/* Border */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 22,
            border: `1px solid ${isDark ? "rgba(59,158,255,0.07)" : "rgba(0,102,220,0.07)"}`,
            pointerEvents: "none",
          }} />

          {/* Ambient glows */}
          <div style={{
            position: "absolute", top: -60, right: -40, width: 260, height: 260,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(59,158,255,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(0,102,220,0.045) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: -30, width: 180, height: 180,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(192,132,252,0.035) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(147,51,234,0.025) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: mob ? "24px 20px 22px" : "32px 34px 28px" }}>
            {/* Top row: rank + name + score */}
            <div style={{ display: "flex", alignItems: mob ? "center" : "flex-start", justifyContent: "space-between", marginBottom: mob ? 20 : 24, gap: 12, flexWrap: "wrap" as const }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Rank badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDark
                    ? "linear-gradient(135deg, rgba(59,158,255,0.14), rgba(129,140,248,0.08))"
                    : "linear-gradient(135deg, rgba(0,102,220,0.09), rgba(79,70,229,0.05))",
                  border: `1px solid ${isDark ? "rgba(59,158,255,0.1)" : "rgba(0,102,220,0.08)"}`,
                  boxShadow: isDark ? "0 2px 10px rgba(59,158,255,0.07)" : "0 2px 10px rgba(0,102,220,0.04)",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: nucleusColor, ...mono }}>1</span>
                </div>
                <div>
                  <p style={{
                    margin: 0, fontSize: 17, fontWeight: 600,
                    color: isDark ? "rgba(255,255,255,0.93)" : "rgba(0,0,0,0.88)",
                    letterSpacing: "-0.025em",
                  }}>
                    Nucleus-Image
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <span style={{
                      fontSize: 10.5,
                      color: isDark ? "rgba(255,255,255,0.64)" : "rgba(0,0,0,0.66)",
                      ...mono, letterSpacing: "-0.005em",
                    }}>
                      2B active · 17B total
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      padding: "2px 8px", borderRadius: 5,
                      background: isDark ? "rgba(59,158,255,0.08)" : "rgba(0,102,220,0.06)",
                      border: `1px solid ${isDark ? "rgba(59,158,255,0.1)" : "rgba(0,102,220,0.08)"}`,
                      color: isDark ? "rgba(126,197,255,0.98)" : "rgba(0,102,220,0.92)",
                    }}>
                      MoE
                    </span>
                  </div>
                </div>
              </div>

              {/* Large gradient score */}
              <div style={{ textAlign: "right" }}>
                <p style={{
                  margin: 0, fontSize: mob ? 32 : 42, fontWeight: 800,
                  letterSpacing: "-0.04em", lineHeight: 1,
                  ...mono,
                  backgroundImage: isDark
                    ? "linear-gradient(135deg, #4F7CFF 0%, #818cf8 55%, #c084fc 100%)"
                    : "linear-gradient(135deg, #0066DC 0%, #4F46E5 55%, #7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {nucleusEntry.efficiency.toFixed(3)}
                </p>
                <p style={{
                  margin: 0, marginTop: 5, fontSize: 9.5,
                  color: isDark ? "rgba(126,197,255,0.84)" : "rgba(0,102,220,0.78)",
                  letterSpacing: "0.06em", fontWeight: 600,
                  textTransform: "uppercase" as const,
                }}>
                  score / billion
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", flexDirection: mob ? "column" as const : "row" as const, gap: 1, marginBottom: 22,
              borderRadius: 14, overflow: "hidden",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}`,
            }}>
              {[
                { label: "Score", value: nucleusEntry.score.toFixed(3), sub: "Overall" },
                { label: "vs #2", value: `${multiplier}x`, sub: "ahead" },
                { label: "vs Median", value: `${(nucleusEntry.efficiency / median).toFixed(1)}x`, sub: "above" },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, padding: mob ? "12px 16px" : "14px 18px",
                  background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
                  borderRight: !mob && i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}` : "none",
                  borderBottom: mob && i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}` : "none",
                }}>
                  <HeroStat label={s.label} value={s.value} sub={s.sub} isDark={isDark} />
                </div>
              ))}
            </div>

            {/* Gradient progress bar */}
            <div style={{
              height: 5, borderRadius: 100,
              background: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  height: "100%", borderRadius: 100,
                  background: isDark
                    ? "linear-gradient(90deg, #4F7CFF 0%, #818cf8 40%, #c084fc 100%)"
                    : "linear-gradient(90deg, #0066DC 0%, #4F46E5 40%, #7C3AED 100%)",
                  opacity: isDark ? 0.95 : 0.92,
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Scale divider ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 14,
        }}>
          <div style={{
            flex: 1, height: 1,
            background: isDark
              ? "linear-gradient(90deg, rgba(255,255,255,0.035), transparent)"
              : "linear-gradient(90deg, rgba(0,0,0,0.05), transparent)",
          }} />
          <span style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: "0.05em",
            color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
            textTransform: "uppercase" as const, flexShrink: 0,
          }}>
            All other models
          </span>
          <div style={{
            flex: 1, height: 1,
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.035))"
              : "linear-gradient(90deg, transparent, rgba(0,0,0,0.05))",
          }} />
        </div>

        {/* ── Column header ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mob ? "18px 1fr 44px" : "22px 140px 1fr 50px 50px",
          alignItems: "center",
          gap: mob ? 6 : 10,
          padding: mob ? "0 10px 6px" : "0 14px 8px",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const, textAlign: "center" }}>#</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Model</span>
          {!mob && <span />}
          {!mob && <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const, textAlign: "right" }}>Params</span>}
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const, textAlign: "right" }}>Score/B</span>
        </div>

        {/* ── Bars ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {restData.map((entry, i) => {
            const mc = modelColors[entry.id] ?? fallback;
            const color = isDark ? mc.dark : mc.light;
            const barPct = (entry.efficiency / maxEfficiency) * 100;
            const rank = i + 2;
            const isHovered = hoveredId === entry.id;
            const relToNucleus = (entry.efficiency / nucleusEntry.efficiency * 100).toFixed(0);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.03, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  display: "grid",
                  gridTemplateColumns: mob ? "18px 1fr 44px" : "22px 140px 1fr 50px 50px",
                  alignItems: "center",
                  gap: mob ? 6 : 10,
                  padding: mob ? "8px 10px" : "9px 14px",
                  borderRadius: 11,
                  background: isHovered
                    ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)")
                    : "transparent",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Rank */}
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)",
                  ...mono, textAlign: "center",
                }}>
                  {rank}
                </span>

                {/* Name + dot */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div style={{
                    width: 5, height: 5,
                    borderRadius: "50%", flexShrink: 0,
                    background: color,
                    opacity: isDark ? 0.7 : 0.75,
                    boxShadow: isHovered ? `0 0 8px ${color}40` : `0 0 4px ${color}20`,
                    transition: "box-shadow 0.2s ease",
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: isHovered ? 500 : 450,
                    color: isHovered
                      ? (isDark ? "rgba(255,255,255,0.86)" : "rgba(0,0,0,0.84)")
                      : (isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.76)"),
                    letterSpacing: "-0.015em",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    transition: "color 0.2s ease",
                  }}>
                    {entry.name}
                  </span>
                </div>

                {/* Bar */}
                {!mob && (
                <div style={{ position: "relative" }}>
                  <div style={{
                    height: 10, borderRadius: 100,
                    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.14)",
                    overflow: "hidden",
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.85 + i * 0.03, duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
                      style={{
                        height: "100%", borderRadius: 100,
                        background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                        opacity: isHovered ? 1 : (isDark ? 0.88 : 0.84),
                        transition: "opacity 0.2s ease",
                      }}
                    />
                  </div>
                  {/* Relative % label on hover */}
                  {isHovered && (
                    <span style={{
                      position: "absolute", right: 4, top: -1,
                      fontSize: 9.5, fontWeight: 600,
                      color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
                      ...mono,
                    }}>
                      {relToNucleus}% of #1
                    </span>
                  )}
                </div>
                )}

                {/* Params */}
                {!mob && <span style={{
                  fontSize: 11.5, fontWeight: 600,
                  color: isDark ? "rgba(255,255,255,0.56)" : "rgba(0,0,0,0.62)",
                  ...mono, letterSpacing: "-0.02em", textAlign: "right",
                }}>
                  {entry.activeParams}B
                </span>}

                {/* Efficiency value */}
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: isHovered
                    ? (isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.84)")
                    : (isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.76)"),
                  ...mono, letterSpacing: "-0.02em", textAlign: "right",
                  transition: "color 0.2s ease",
                }}>
                  {entry.efficiency.toFixed(3)}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ── Key Insights Row ── */}
        <div style={{
          display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
          gap: 12, marginTop: mob ? 24 : 32,
        }}>
          {/* Insight 1: Multiplier callout */}
          <div style={{
            padding: mob ? "18px 18px" : "22px 24px",
            borderRadius: mob ? 14 : 18,
            background: isDark ? "rgba(59,158,255,0.02)" : "rgba(0,102,220,0.015)",
            border: `1px solid ${isDark ? "rgba(59,158,255,0.045)" : "rgba(0,102,220,0.045)"}`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isDark
                ? "linear-gradient(135deg, rgba(59,158,255,0.1), rgba(129,140,248,0.05))"
                : "linear-gradient(135deg, rgba(0,102,220,0.06), rgba(79,70,229,0.03))",
              border: `1px solid ${isDark ? "rgba(59,158,255,0.08)" : "rgba(0,102,220,0.06)"}`,
              boxShadow: isDark ? "0 2px 12px rgba(59,158,255,0.05)" : "0 2px 10px rgba(0,102,220,0.03)",
            }}>
              <span style={{
                fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em",
                ...mono,
                  backgroundImage: isDark
                  ? "linear-gradient(135deg, #4F7CFF, #818cf8)"
                  : "linear-gradient(135deg, #0066DC, #4F46E5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {multiplier}x
              </span>
            </div>
            <div>
              <p style={{
                margin: 0, fontSize: 13, fontWeight: 600,
                color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
                letterSpacing: "-0.02em", lineHeight: 1.4,
              }}>
                Leads next-best model
              </p>
              <p style={{
                margin: 0, marginTop: 4, fontSize: 11,
                color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
                letterSpacing: "-0.005em", lineHeight: 1.45,
              }}>
                {secondEntry.name} achieves {secondEntry.efficiency.toFixed(3)} score/B
              </p>
            </div>
          </div>

          {/* Insight 2: Architecture advantage */}
          <div style={{
            padding: mob ? "18px 18px" : "22px 24px",
            borderRadius: mob ? 14 : 18,
            background: isDark ? "rgba(52,211,153,0.015)" : "rgba(5,150,105,0.012)",
            border: `1px solid ${isDark ? "rgba(52,211,153,0.04)" : "rgba(5,150,105,0.04)"}`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isDark
                ? "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))"
                : "linear-gradient(135deg, rgba(5,150,105,0.06), rgba(5,150,105,0.02))",
              border: `1px solid ${isDark ? "rgba(52,211,153,0.07)" : "rgba(5,150,105,0.06)"}`,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={isDark ? "#34d399" : "#059669"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.7}>
                <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
              </svg>
            </div>
            <div>
              <p style={{
                margin: 0, fontSize: 13, fontWeight: 600,
                color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
                letterSpacing: "-0.02em", lineHeight: 1.4,
              }}>
                MoE architecture
              </p>
              <p style={{
                margin: 0, marginTop: 4, fontSize: 11,
                color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
                letterSpacing: "-0.005em", lineHeight: 1.45,
              }}>
                Activates only {((nucleusEntry.activeParams / nucleusEntry.totalParams) * 100).toFixed(0)}% of 17B total params per inference
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
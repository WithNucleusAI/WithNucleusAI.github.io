import { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { useIsMobile } from "./use-mobile";

/* ── Data ── */

interface DpgModel {
  id: string;
  name: string;
  global: number | null;
  entity: number | null;
  attribute: number | null;
  relation: number | null;
  other: number | null;
  overall: number;
  color: string;
  lightColor: string;
}

const models: DpgModel[] = [
  { id: "nucleus", name: "Nucleus-Image", global: 85.10, entity: 93.08, attribute: 92.20, relation: 93.56, other: 93.62, overall: 88.79, color: "#4F7CFF", lightColor: "#0066DC" },
  { id: "qwen-img", name: "Qwen-Image", global: 91.32, entity: 91.56, attribute: 92.02, relation: 94.31, other: 92.73, overall: 88.32, color: "#34EAD0", lightColor: "#0A7D6E" },
  { id: "seedream", name: "Seedream 3.0", global: 94.31, entity: 92.65, attribute: 91.36, relation: 92.78, other: 88.24, overall: 88.27, color: "#FFD04A", lightColor: "#B45309" },
  { id: "cogview4", name: "CogView 4", global: 85.13, entity: 83.85, attribute: 90.35, relation: 91.17, other: 91.14, overall: 87.29, color: "#FF9F43", lightColor: "#C56A00" },
  { id: "lumina2", name: "Lumina-Image 2.0", global: null, entity: 91.97, attribute: 90.20, relation: 94.85, other: null, overall: 87.20, color: "#E879F9", lightColor: "#A21CAF" },
  { id: "showo2-7b", name: "Show-o2 7B", global: 89.00, entity: 91.78, attribute: 89.96, relation: 91.81, other: 91.64, overall: 86.14, color: "#34D399", lightColor: "#059669" },
  { id: "hidream", name: "HiDream-I1-Full", global: 76.44, entity: 90.22, attribute: 89.48, relation: 93.74, other: 91.83, overall: 85.89, color: "#A78BFA", lightColor: "#7C3AED" },
  { id: "gpt-img", name: "GPT Image 1 High", global: 88.89, entity: 88.94, attribute: 89.84, relation: 92.63, other: 90.96, overall: 85.15, color: "#FF7A90", lightColor: "#C01040" },
  { id: "bagel", name: "BAGEL", global: 88.94, entity: 90.37, attribute: 91.29, relation: 90.82, other: 88.67, overall: 85.07, color: "#FBBF24", lightColor: "#B45309" },
  { id: "showo2-15b", name: "Show-o2 1.5B", global: 87.53, entity: 90.38, attribute: 91.34, relation: 90.30, other: 91.21, overall: 85.02, color: "#4ADE80", lightColor: "#16A34A" },
  { id: "sana15", name: "SANA-1.5", global: null, entity: 91.50, attribute: 88.90, relation: 91.90, other: null, overall: 84.80, color: "#2DD4BF", lightColor: "#0D9488" },
  { id: "janus-pro-7b", name: "Janus-Pro-7B", global: 86.90, entity: 88.90, attribute: 89.40, relation: 89.32, other: 89.48, overall: 84.19, color: "#FB923C", lightColor: "#C2410C" },
  { id: "sd3", name: "SD3 Medium", global: 87.90, entity: 91.01, attribute: 88.83, relation: 80.70, other: 88.68, overall: 84.08, color: "#94A3B8", lightColor: "#64748B" },
  { id: "flux-dev", name: "FLUX.1 Dev", global: 82.10, entity: 89.50, attribute: 88.70, relation: 91.10, other: 89.40, overall: 84.00, color: "#FF85C8", lightColor: "#B91C5C" },
  { id: "dalle3", name: "DALL·E 3", global: 90.97, entity: 89.61, attribute: 88.39, relation: 90.58, other: 89.83, overall: 83.50, color: "#94A3B8", lightColor: "#64748B" },
  { id: "omnigen2", name: "OmniGen2", global: 88.81, entity: 88.83, attribute: 90.18, relation: 89.37, other: 90.27, overall: 83.57, color: "#F472B6", lightColor: "#DB2777" },
  { id: "janus-pro-1b", name: "Janus-Pro-1B", global: 87.58, entity: 88.63, attribute: 88.17, relation: 88.98, other: 88.30, overall: 82.63, color: "#94A3B8", lightColor: "#64748B" },
  { id: "blip3o", name: "BLIP3-o 8B", global: null, entity: null, attribute: null, relation: null, other: null, overall: 81.60, color: "#60A5FA", lightColor: "#2563EB" },
  { id: "emu3", name: "Emu3-Gen", global: 85.21, entity: 86.68, attribute: 86.84, relation: 90.22, other: 83.15, overall: 80.60, color: "#C084FC", lightColor: "#9333EA" },
];

const sorted = [...models].sort((a, b) => b.overall - a.overall);
const nucleusEntry = sorted.find(m => m.id === "nucleus")!;
const top10 = sorted.slice(0, 10);

/* Categories Nucleus leads */
const categories = [
  { key: "entity", label: "Entity" },
  { key: "attribute", label: "Attribute" },
  { key: "relation", label: "Relation" },
  { key: "other", label: "Other" },
  { key: "global", label: "Global" },
  { key: "overall", label: "Overall" },
] as const;

type CatKey = typeof categories[number]["key"];

function getCategoryLeader(key: CatKey): DpgModel {
  let best: DpgModel = models[0];
  let bestVal = 0;
  for (const m of models) {
    const v = m[key];
    if (v != null && v > bestVal) { bestVal = v; best = m; }
  }
  return best;
}

const nucleusLeads = categories.filter(c => getCategoryLeader(c.key).id === "nucleus").map(c => c.key);

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  fontVariantNumeric: "tabular-nums",
};

/* ── Radar-like category display ── */

function CategoryBar({ cat, nucleusVal, bestVal, bestModel, index, isDark, mob }: {
  cat: { key: CatKey; label: string };
  nucleusVal: number | null;
  bestVal: number;
  bestModel: DpgModel;
  index: number;
  isDark: boolean;
  mob?: boolean;
}) {
  const isLeader = bestModel.id === "nucleus";
  const nucleusColor = isDark ? "#4F7CFF" : "#0066DC";
  const onBarText = isDark ? "rgba(245,250,255,0.98)" : "rgba(255,255,255,0.98)";
  const barMax = 100;
  const nPct = nucleusVal != null ? ((nucleusVal - 70) / (barMax - 70)) * 100 : 0;
  const bPct = ((bestVal - 70) / (barMax - 70)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.06, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ display: "flex", alignItems: "center", gap: mob ? 8 : 12 }}
    >
      {/* Label */}
      <div style={{ width: mob ? 52 : 72, flexShrink: 0, textAlign: "right" }}>
        <span style={{
          fontSize: mob ? 10 : 11.5, fontWeight: 500,
          color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.76)",
          letterSpacing: "-0.01em",
        }}>{cat.label}</span>
      </div>

      {/* Bar track */}
      <div style={{ flex: 1, position: "relative", height: 22 }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: 6,
          background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.14)",
        }} />
        {/* Nucleus bar */}
        {nucleusVal != null && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${nPct}%` }}
            transition={{ delay: 0.7 + index * 0.06, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              position: "absolute", top: 0, left: 0, bottom: 0,
              borderRadius: 6,
              background: isLeader
                ? `linear-gradient(90deg, ${nucleusColor}, ${nucleusColor}aa)`
                : `linear-gradient(90deg, ${nucleusColor}bb, ${nucleusColor}77)`,
              opacity: isDark ? 0.95 : 0.9,
            }}
          />
        )}
        {/* Value inside */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center",
          padding: "0 10px", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 10.5, fontWeight: 600,
            ...mono,
            color: isLeader
              ? onBarText
              : (isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.78)"),
            position: "relative", zIndex: 1,
            textShadow: isLeader ? "0 1px 2px rgba(0,0,0,0.35)" : "none",
          }}>
            {nucleusVal != null ? nucleusVal.toFixed(2) : "—"}
          </span>
          {isLeader && (
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: onBarText,
              opacity: isDark ? 0.88 : 0.9,
              position: "relative", zIndex: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
            }}>
              #1
            </span>
          )}
          {!isLeader && nucleusVal != null && (
            <span style={{
              fontSize: 9.5, fontWeight: 600,
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.64)",
              ...mono, position: "relative", zIndex: 1,
            }}>
              {(bestVal - nucleusVal).toFixed(2)} behind
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════ */

export function DpgBench() {
  const { theme, t } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nucleusColor = isDark ? "#4F7CFF" : "#0066DC";
  const nucleusRank = sorted.findIndex(m => m.id === "nucleus") + 1;
  const lead = nucleusEntry.overall - sorted[1].overall;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
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

        {/* ── Header ── */}
        <div style={{ display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "flex-start" : "flex-end", justifyContent: "space-between", gap: mob ? 12 : 0, marginBottom: mob ? 24 : 38 }}>
          <div>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase" as const, color: t.sectionKicker,
            }}>
              Benchmark
            </p>
            <p style={{
              margin: 0, marginTop: 10, fontSize: 20, fontWeight: 600,
              letterSpacing: "-0.035em", color: t.chartTitle,
            }}>
              DPG-Bench{" "}
              <span style={{ fontWeight: 400, fontSize: 16, color: isDark ? "rgba(129,140,248,0.35)" : "rgba(79,70,229,0.3)" }}>·</span>{" "}
              <span style={{ fontWeight: 500, fontSize: 16, color: isDark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.72)" }}>
                Dense Prompt Following
              </span>
            </p>
            <p style={{
              margin: 0, marginTop: 8, fontSize: 12,
              color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.64)",
              letterSpacing: "-0.005em",
            }}>
              Evaluates compositional text-to-image generation across 6 semantic dimensions
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 8,
            background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}`,
          }}>
            <span style={{ fontSize: 10, color: t.chartSub, fontWeight: 500 }}>Scale 0–100</span>
          </div>
        </div>

        {/* ── Nucleus Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            position: "relative",
            borderRadius: 22,
            marginBottom: 32,
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", inset: 0,
            background: isDark
              ? "linear-gradient(135deg, rgba(59,158,255,0.05) 0%, rgba(129,140,248,0.025) 50%, rgba(192,132,252,0.015) 100%)"
              : "linear-gradient(135deg, rgba(0,102,220,0.035) 0%, rgba(79,70,229,0.018) 50%, rgba(147,51,234,0.01) 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: 22,
            border: `1px solid ${isDark ? "rgba(59,158,255,0.07)" : "rgba(0,102,220,0.07)"}`,
            pointerEvents: "none",
          }} />
          {/* Glows */}
          <div style={{
            position: "absolute", top: -50, right: -40, width: 240, height: 240,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(59,158,255,0.06) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(0,102,220,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: mob ? "24px 20px 22px" : "32px 34px 28px" }}>
            <div style={{ display: "flex", alignItems: mob ? "center" : "flex-start", justifyContent: "space-between", marginBottom: mob ? 20 : 26, gap: 12, flexWrap: "wrap" as const }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                      color: isDark ? "rgba(255,255,255,0.64)" : "rgba(0,0,0,0.68)",
                      letterSpacing: "-0.005em",
                    }}>
                      Leads {nucleusLeads.length} of 6 categories
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      padding: "2px 8px", borderRadius: 5,
                      background: isDark ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)",
                      border: `1px solid ${isDark ? "rgba(52,211,153,0.1)" : "rgba(5,150,105,0.08)"}`,
                      color: isDark ? "rgba(52,211,153,0.6)" : "rgba(5,150,105,0.6)",
                    }}>
                      +{lead.toFixed(2)} over #2
                    </span>
                  </div>
                </div>
              </div>

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
                  {nucleusEntry.overall.toFixed(2)}
                </p>
                <p style={{
                  margin: 0, marginTop: 5, fontSize: 9.5,
                  color: isDark ? "rgba(126,197,255,0.84)" : "rgba(0,102,220,0.78)",
                  letterSpacing: "0.06em", fontWeight: 600,
                  textTransform: "uppercase" as const,
                }}>
                  Overall Score
                </p>
              </div>
            </div>

            {/* Category breakdown for Nucleus */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {categories.map((cat, i) => {
                const nv = nucleusEntry[cat.key];
                const leader = getCategoryLeader(cat.key);
                const bestVal = leader[cat.key]!;
                return (
                  <CategoryBar
                    key={cat.key}
                    cat={cat}
                    nucleusVal={nv}
                    bestVal={bestVal}
                    bestModel={leader}
                    index={i}
                    isDark={isDark}
                    mob={mob}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Divider ── */}
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
            Overall Score Ranking · Top 10
          </span>
          <div style={{
            flex: 1, height: 1,
            background: isDark
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.035))"
              : "linear-gradient(90deg, transparent, rgba(0,0,0,0.05))",
          }} />
        </div>

        {/* ── Column headers ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mob ? "18px 1fr 52px" : "22px 150px 1fr 56px",
          alignItems: "center",
          gap: mob ? 6 : 10,
          padding: mob ? "0 10px 6px" : "0 14px 8px",
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const, textAlign: "center" }}>#</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Model</span>
          {!mob && <span />}
          <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)", letterSpacing: "0.06em", textTransform: "uppercase" as const, textAlign: "right" }}>Overall</span>
        </div>

        {/* ── Ranking bars ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {top10.map((entry, i) => {
            const isNucleus = entry.id === "nucleus";
            const color = isDark ? entry.color : entry.lightColor;
            const barMin = 80;
            const barPct = ((entry.overall - barMin) / (sorted[0].overall - barMin)) * 100;
            const rank = i + 1;
            const isHovered = hoveredId === entry.id;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.04, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  display: "grid",
                  gridTemplateColumns: mob ? "18px 1fr 52px" : "22px 150px 1fr 56px",
                  alignItems: "center",
                  gap: mob ? 6 : 10,
                  padding: isNucleus ? (mob ? "10px 10px" : "11px 14px") : (mob ? "8px 10px" : "9px 14px"),
                  borderRadius: 11,
                  background: isNucleus
                    ? (isDark ? "rgba(59,158,255,0.03)" : "rgba(0,102,220,0.02)")
                    : isHovered
                      ? (isDark ? "rgba(255,255,255,0.018)" : "rgba(0,0,0,0.012)")
                      : "transparent",
                  border: isNucleus
                    ? `1px solid ${isDark ? "rgba(59,158,255,0.06)" : "rgba(0,102,220,0.05)"}`
                    : "1px solid transparent",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Rank */}
                <span style={{
                  fontSize: isNucleus ? 11 : 10, fontWeight: isNucleus ? 700 : 500,
                  color: isNucleus ? nucleusColor : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)"),
                  ...mono, textAlign: "center",
                }}>
                  {rank}
                </span>

                {/* Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div style={{
                    width: isNucleus ? 6 : 5, height: isNucleus ? 6 : 5,
                    borderRadius: "50%", flexShrink: 0,
                    background: color,
                    opacity: isDark ? 0.75 : 0.8,
                    boxShadow: isNucleus ? `0 0 8px ${color}40` : (isHovered ? `0 0 6px ${color}30` : `0 0 4px ${color}15`),
                    transition: "box-shadow 0.2s ease",
                  }} />
                  <span style={{
                    fontSize: isNucleus ? 13 : 12,
                    fontWeight: isNucleus ? 600 : 450,
                    color: isNucleus
                      ? (isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)")
                      : isHovered
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
                <div style={{
                  height: isNucleus ? 12 : 10, borderRadius: 100,
                  background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.14)",
                  overflow: "hidden",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ delay: 0.9 + i * 0.04, duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
                    style={{
                      height: "100%", borderRadius: 100,
                      background: isNucleus
                        ? (isDark
                          ? "linear-gradient(90deg, #4F7CFF 0%, #818cf8 50%, #c084fc 100%)"
                          : "linear-gradient(90deg, #0066DC 0%, #4F46E5 50%, #7C3AED 100%)")
                        : `linear-gradient(90deg, ${color}, ${color}CC)`,
                      opacity: isNucleus
                        ? (isDark ? 0.95 : 0.92)
                        : isHovered
                          ? 1
                          : (isDark ? 0.88 : 0.84),
                      transition: "opacity 0.2s ease",
                    }}
                  />
                </div>
                )}

                {/* Score */}
                <span style={{
                  fontSize: 11, fontWeight: isNucleus ? 600 : 500,
                  color: isNucleus
                    ? nucleusColor
                    : isHovered
                      ? (isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.84)")
                      : (isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.76)"),
                  ...mono, letterSpacing: "-0.02em", textAlign: "right",
                  transition: "color 0.2s ease",
                }}>
                  {entry.overall.toFixed(2)}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom insight cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
          gap: 12, marginTop: mob ? 24 : 32,
        }}>
          {/* Leading categories */}
          <div style={{
            padding: mob ? "18px 18px" : "22px 24px",
            borderRadius: mob ? 14 : 18,
            background: isDark ? "rgba(59,158,255,0.02)" : "rgba(0,102,220,0.015)",
            border: `1px solid ${isDark ? "rgba(59,158,255,0.045)" : "rgba(0,102,220,0.045)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={nucleusColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.6}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
                letterSpacing: "-0.02em",
              }}>
                Category Leadership
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {categories.map(cat => {
                const isLead = nucleusLeads.includes(cat.key);
                return (
                  <span key={cat.key} style={{
                    fontSize: 10.5, fontWeight: 500,
                    padding: "4px 10px", borderRadius: 6,
                    background: isLead
                      ? (isDark ? "rgba(59,158,255,0.08)" : "rgba(0,102,220,0.06)")
                      : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                    border: `1px solid ${isLead
                      ? (isDark ? "rgba(59,158,255,0.12)" : "rgba(0,102,220,0.1)")
                      : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)")}`,
                    color: isLead
                      ? nucleusColor
                      : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)"),
                    letterSpacing: "-0.005em",
                  }}>
                    {isLead && "★ "}{cat.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Closest competitor */}
          <div style={{
            padding: mob ? "18px 18px" : "22px 24px",
            borderRadius: mob ? 14 : 18,
            background: isDark ? "rgba(52,211,153,0.015)" : "rgba(5,150,105,0.012)",
            border: `1px solid ${isDark ? "rgba(52,211,153,0.04)" : "rgba(5,150,105,0.04)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={isDark ? "#34d399" : "#059669"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.6}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
                letterSpacing: "-0.02em",
              }}>
                Competitive Edge
              </span>
            </div>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 450,
              color: isDark ? "rgba(255,255,255,0.66)" : "rgba(0,0,0,0.7)",
              lineHeight: 1.55, letterSpacing: "-0.005em",
            }}>
              Nucleus leads Qwen-Image by <span style={{ fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)", ...mono }}>+{lead.toFixed(2)}</span> and
              Seedream 3.0 by <span style={{ fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)", ...mono }}>+{(nucleusEntry.overall - sorted[2].overall).toFixed(2)}</span> overall,
              with the strongest margins in Entity and Other categories.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
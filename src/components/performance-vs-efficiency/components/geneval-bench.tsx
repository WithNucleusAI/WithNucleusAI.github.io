import { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { useIsMobile } from "./use-mobile";

/* ── Data ── */

interface GenEvalModel {
  id: string;
  name: string;
  singleObj: number | null;
  twoObj: number | null;
  counting: number | null;
  colors: number | null;
  position: number | null;
  attrBinding: number | null;
  overall: number;
  color: string;
  lightColor: string;
}

const models: GenEvalModel[] = [
  { id: "nucleus", name: "Nucleus-Image", singleObj: 0.99, twoObj: 0.95, counting: 0.78, colors: 0.92, position: 0.85, attrBinding: 0.71, overall: 0.87, color: "#3B9EFF", lightColor: "#0066DC" },
  { id: "qwen-img", name: "Qwen-Image", singleObj: 0.99, twoObj: 0.92, counting: 0.89, colors: 0.88, position: 0.76, attrBinding: 0.77, overall: 0.87, color: "#34EAD0", lightColor: "#0A7D6E" },
  { id: "cogview4", name: "CogView 4", singleObj: 0.99, twoObj: 0.86, counting: 0.66, colors: 0.79, position: 0.48, attrBinding: 0.58, overall: 0.87, color: "#FF9F43", lightColor: "#C56A00" },
  { id: "seedream", name: "Seedream 3.0", singleObj: 0.99, twoObj: 0.96, counting: 0.91, colors: 0.93, position: 0.47, attrBinding: 0.80, overall: 0.84, color: "#FFD04A", lightColor: "#B45309" },
  { id: "gpt-img", name: "GPT Image 1 High", singleObj: 0.99, twoObj: 0.92, counting: 0.85, colors: 0.92, position: 0.75, attrBinding: 0.61, overall: 0.84, color: "#FF7A90", lightColor: "#C01040" },
  { id: "blip3o", name: "BLIP3-o 8B", singleObj: null, twoObj: null, counting: null, colors: null, position: null, attrBinding: null, overall: 0.84, color: "#60A5FA", lightColor: "#2563EB" },
  { id: "hidream", name: "HiDream-I1-Full", singleObj: 1.00, twoObj: 0.98, counting: 0.79, colors: 0.91, position: 0.60, attrBinding: 0.72, overall: 0.83, color: "#A78BFA", lightColor: "#7C3AED" },
  { id: "bagel", name: "BAGEL", singleObj: 0.99, twoObj: 0.94, counting: 0.81, colors: 0.88, position: 0.64, attrBinding: 0.63, overall: 0.82, color: "#FBBF24", lightColor: "#B45309" },
  { id: "omnigen2", name: "OmniGen2", singleObj: 1.00, twoObj: 0.95, counting: 0.64, colors: 0.88, position: 0.55, attrBinding: 0.76, overall: 0.80, color: "#F472B6", lightColor: "#DB2777" },
  { id: "janusflow", name: "JanusFlow", singleObj: 0.87, twoObj: 0.87, counting: 0.87, colors: 0.89, position: 0.88, attrBinding: 0.88, overall: 0.80, color: "#94A3B8", lightColor: "#64748B" },
  { id: "janus-pro-7b", name: "Janus-Pro-7B", singleObj: 0.99, twoObj: 0.89, counting: 0.59, colors: 0.90, position: 0.79, attrBinding: 0.66, overall: 0.80, color: "#FB923C", lightColor: "#C2410C" },
  { id: "showo2-7b", name: "Show-o2 7B", singleObj: 1.00, twoObj: 0.87, counting: 0.58, colors: 0.92, position: 0.52, attrBinding: 0.62, overall: 0.76, color: "#34D399", lightColor: "#059669" },
  { id: "showo2-15b", name: "Show-o2 1.5B", singleObj: 0.99, twoObj: 0.86, counting: 0.55, colors: 0.86, position: 0.46, attrBinding: 0.63, overall: 0.73, color: "#4ADE80", lightColor: "#16A34A" },
  { id: "lumina2", name: "Lumina-Image 2.0", singleObj: null, twoObj: 0.87, counting: 0.67, colors: 0.62, position: null, attrBinding: null, overall: 0.73, color: "#E879F9", lightColor: "#A21CAF" },
  { id: "janus-pro-1b", name: "Janus-Pro-1B", singleObj: 0.98, twoObj: 0.82, counting: 0.51, colors: 0.89, position: 0.65, attrBinding: 0.56, overall: 0.73, color: "#94A3B8", lightColor: "#64748B" },
  { id: "sd35l", name: "SD3.5 Large", singleObj: 0.98, twoObj: 0.89, counting: 0.73, colors: 0.83, position: 0.34, attrBinding: 0.47, overall: 0.71, color: "#94A3B8", lightColor: "#64748B" },
];

const sorted = [...models].sort((a, b) => b.overall - a.overall);
const nucleusEntry = sorted.find((m) => m.id === "nucleus")!;
const top10 = sorted.slice(0, 10);

type CatKey = "singleObj" | "twoObj" | "counting" | "colors" | "position" | "attrBinding" | "overall";

const categories: { key: CatKey; label: string; shortLabel: string }[] = [
  { key: "singleObj", label: "Single Object", shortLabel: "Single" },
  { key: "twoObj", label: "Two Objects", shortLabel: "Two Obj" },
  { key: "counting", label: "Counting", shortLabel: "Count" },
  { key: "colors", label: "Colors", shortLabel: "Colors" },
  { key: "position", label: "Position", shortLabel: "Position" },
  { key: "attrBinding", label: "Attribute Binding", shortLabel: "Attr. Bind" },
];

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  fontVariantNumeric: "tabular-nums",
};

/* ── Nucleus category performance mini-bars ── */

function NucleusCategoryGrid({ isDark, mob }: { isDark: boolean; mob: boolean }) {
  const nucleusColor = isDark ? "#3B9EFF" : "#0066DC";

  return (
    <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 8 }}>
      {categories.map((cat, i) => {
        const val = nucleusEntry[cat.key];
        if (val == null) return null;
        const pct = val * 100;

        // Find rank for this category
        let rank = 1;
        for (const m of models) {
          const mv = m[cat.key];
          if (mv != null && mv > val) rank++;
        }

        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.05, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              padding: "14px 16px 12px",
              borderRadius: 14,
              background: isDark ? "rgba(255,255,255,0.012)" : "rgba(0,0,0,0.01)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 500,
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.74)",
                letterSpacing: "-0.005em",
              }}>
                {cat.shortLabel}
              </span>
              {rank <= 3 && (
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  padding: "1.5px 6px", borderRadius: 4,
                  background: rank === 1
                    ? (isDark ? "rgba(59,158,255,0.1)" : "rgba(0,102,220,0.07)")
                    : (isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)"),
                  color: rank === 1
                    ? nucleusColor
                    : (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.25)"),
                  border: `1px solid ${rank === 1
                    ? (isDark ? "rgba(59,158,255,0.12)" : "rgba(0,102,220,0.08)")
                    : "transparent"}`,
                }}>
                  #{rank}
                </span>
              )}
            </div>
            <p style={{
              margin: 0, fontSize: 20, fontWeight: 700,
              letterSpacing: "-0.03em", lineHeight: 1,
              ...mono,
              color: isDark ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)",
            }}>
              {val.toFixed(2)}
            </p>
            {/* Mini bar */}
            <div style={{
              marginTop: 10, height: 3, borderRadius: 100,
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.14)",
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.75 + i * 0.05, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  height: "100%", borderRadius: 100,
                  background: `linear-gradient(90deg, ${nucleusColor}, ${nucleusColor}88)`,
                  opacity: isDark ? 0.95 : 0.9,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */

export function GenEvalBench() {
  const { theme, t } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nucleusColor = isDark ? "#3B9EFF" : "#0066DC";

  // Nucleus is tied #1 with CogView4 and Qwen-Image at 0.87
  const tiedModels = sorted.filter((m) => m.overall === nucleusEntry.overall && m.id !== "nucleus");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        borderRadius: mob ? 18 : 24,
        background: t.panelBg,
        backdropFilter: "blur(24px) saturate(1.3)",
        WebkitBackdropFilter: "blur(24px) saturate(1.3)",
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
        borderRadius: "24px 24px 0 0",
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
              GenEval{" "}
              <span style={{ fontWeight: 400, fontSize: 16, color: isDark ? "rgba(129,140,248,0.35)" : "rgba(79,70,229,0.3)" }}>·</span>{" "}
              <span style={{ fontWeight: 500, fontSize: 16, color: isDark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.72)" }}>
                Compositional Generation
              </span>
            </p>
            <p style={{
              margin: 0, marginTop: 8, fontSize: 12,
              color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.64)",
              letterSpacing: "-0.005em",
            }}>
              Evaluates object compositionality, spatial reasoning, and attribute binding
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 8,
            background: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}`,
          }}>
            <span style={{ fontSize: 10, color: t.chartSub, fontWeight: 500 }}>Scale 0–1</span>
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
          {/* Glow */}
          <div style={{
            position: "absolute", top: -50, right: -30, width: 220, height: 220,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(59,158,255,0.055) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(0,102,220,0.04) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, padding: mob ? "24px 20px 22px" : "32px 34px 28px" }}>

            {/* Top: rank + name + score */}
            <div style={{ display: "flex", alignItems: mob ? "center" : "flex-start", justifyContent: "space-between", marginBottom: mob ? 20 : 28, gap: 12, flexWrap: "wrap" as const }}>
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
                      Tied #1 with {tiedModels.map((m) => m.name).join(" & ")}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      padding: "2px 8px", borderRadius: 5,
                      background: isDark ? "rgba(59,158,255,0.08)" : "rgba(0,102,220,0.06)",
                      border: `1px solid ${isDark ? "rgba(59,158,255,0.1)" : "rgba(0,102,220,0.08)"}`,
                      color: isDark ? "rgba(59,158,255,0.6)" : "rgba(0,102,220,0.6)",
                    }}>
                      Joint #1
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
                    ? "linear-gradient(135deg, #3B9EFF 0%, #818cf8 55%, #c084fc 100%)"
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

            {/* Category grid */}
            <NucleusCategoryGrid isDark={isDark} mob={mob} />
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
          gridTemplateColumns: mob ? "18px 1fr 48px" : "22px 160px 1fr 52px",
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
            const isTied = entry.overall === nucleusEntry.overall;
            const color = isDark ? entry.color : entry.lightColor;
            const barMin = 0.7;
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
                  gridTemplateColumns: mob ? "18px 1fr 48px" : "22px 160px 1fr 52px",
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

                {/* Name + dot */}
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
                  {!isNucleus && isTied && (
                    <span style={{
                      fontSize: 8, fontWeight: 600, letterSpacing: "0.05em",
                      padding: "1px 5px", borderRadius: 3,
                      background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)",
                      color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.22)",
                    }}>
                      T1
                    </span>
                  )}
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
                          ? "linear-gradient(90deg, #3B9EFF 0%, #818cf8 50%, #c084fc 100%)"
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
          {/* Strongest categories */}
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
                Standout Dimensions
              </span>
            </div>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 450,
              color: isDark ? "rgba(255,255,255,0.66)" : "rgba(0,0,0,0.7)",
              lineHeight: 1.55, letterSpacing: "-0.005em",
            }}>
              Nucleus excels in{" "}
              <span style={{ fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>Position</span>{" "}
              (<span style={{ ...mono, fontWeight: 600, color: nucleusColor }}>0.85</span>) and{" "}
              <span style={{ fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>Two Objects</span>{" "}
              (<span style={{ ...mono, fontWeight: 600, color: nucleusColor }}>0.95</span>),
              among the strongest spatial reasoning results in the field.
            </p>
          </div>

          {/* Efficiency note */}
          <div style={{
            padding: mob ? "18px 18px" : "22px 24px",
            borderRadius: mob ? 14 : 18,
            background: isDark ? "rgba(52,211,153,0.015)" : "rgba(5,150,105,0.012)",
            border: `1px solid ${isDark ? "rgba(52,211,153,0.04)" : "rgba(5,150,105,0.04)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={isDark ? "#34d399" : "#059669"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.6}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span style={{
                fontSize: 12.5, fontWeight: 600,
                color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
                letterSpacing: "-0.02em",
              }}>
                Efficiency Context
              </span>
            </div>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 450,
              color: isDark ? "rgba(255,255,255,0.66)" : "rgba(0,0,0,0.7)",
              lineHeight: 1.55, letterSpacing: "-0.005em",
            }}>
              Achieves joint-leading{" "}
              <span style={{ ...mono, fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>0.87</span>{" "}
              overall with only{" "}
              <span style={{ fontWeight: 600, color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.65)" }}>2B active params</span>
              —co-leaders Qwen-Image (20B) and CogView 4 (6B) require 3–10× more.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
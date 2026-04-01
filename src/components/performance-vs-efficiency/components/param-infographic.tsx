import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { useIsMobile } from "./use-mobile";

interface ModelEntry {
  name: string;
  activeParams: number;
  totalParams: number;
  score: number;
  family: string;
  color: string;
  lightColor: string;
}

const top5: ModelEntry[] = [
  { name: "Nucleus-Image", activeParams: 2.0, totalParams: 17, score: 0.76, family: "Nucleus", color: "#4F7CFF", lightColor: "#0066DC" },
  { name: "Qwen-Image", activeParams: 20, totalParams: 20, score: 0.765, family: "Qwen", color: "#34EAD0", lightColor: "#0A7D6E" },
  { name: "CogView 4", activeParams: 6.0, totalParams: 6, score: 0.72, family: "CogView", color: "#FF9F43", lightColor: "#C56A00" },
  { name: "HiDream-1-Full", activeParams: 13.2, totalParams: 17, score: 0.72, family: "HiDream", color: "#A78BFA", lightColor: "#7C3AED" },
  { name: "OmniGen2", activeParams: 7.0, totalParams: 7, score: 0.70, family: "OmniGen", color: "#F472B6", lightColor: "#DB2777" },
];

interface UnknownModel {
  name: string;
  score: number;
  family: string;
  color: string;
  lightColor: string;
}

const unknownParamModels: UnknownModel[] = [
  { name: "Seedream 3.0", score: 0.75, family: "Seedream", color: "#FFD04A", lightColor: "#B45309" },
  { name: "GPT Image 1 High", score: 0.74, family: "GPT", color: "#FF7A90", lightColor: "#C01040" },
];

const sorted = [...top5].sort((a, b) => b.score - a.score);
const nucleusEntry = sorted.find((m) => m.family === "Nucleus")!;
const others = sorted.filter((m) => m.family !== "Nucleus");
const centeredOrder = [...others.slice(0, 2), nucleusEntry, ...others.slice(2)];

const maxTotal = Math.max(...sorted.map((m) => m.totalParams));

const MIN_RING = 58;
const MAX_RING = 152;

function getRingSize(totalParams: number) {
  return MIN_RING + ((totalParams / maxTotal) * (MAX_RING - MIN_RING));
}

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  fontVariantNumeric: "tabular-nums",
};

function Ring({
  model,
  index,
  isDark,
  compact,
}: {
  model: ModelEntry;
  index: number;
  isDark: boolean;
  compact?: boolean;
}) {
  const color = isDark ? model.color : model.lightColor;
  const rawSize = getRingSize(model.totalParams);
  const size = compact ? rawSize * 0.6 : rawSize;
  const activeRatio = model.activeParams / model.totalParams;
  const isNucleus = model.family === "Nucleus";

  const cx = size / 2;
  const cy = size / 2;
  const strokeW = isNucleus ? (compact ? 4 : 6) : (compact ? 2.5 : 3.5);
  const r = (size - strokeW * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const activeArc = circumference * activeRatio;
  const totalArc = circumference;

  const scaleFactor = isNucleus ? 1.15 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 1,
        delay: 0.35 + index * 0.09,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 10 : 18,
        flex: 1,
        minWidth: 0,
        transform: `scale(${scaleFactor})`,
        zIndex: isNucleus ? 2 : 1,
        position: "relative",
      }}
    >
      {/* Ring container */}
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Nucleus ambient glow */}
        {isNucleus && (
          <div
            style={{
              position: "absolute",
              inset: -28,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}${isDark ? "18" : "12"} 0%, transparent 60%)`,
              pointerEvents: "none",
            }}
          />
        )}

        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
          {/* Background ring */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.05)"}
            strokeWidth={strokeW}
          />
          {/* Total params ring (faint) */}
          <motion.circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke={color}
            strokeWidth={strokeW} strokeLinecap="round"
            opacity={isDark ? 0.2 : 0.24}
            strokeDasharray={`${totalArc} ${circumference}`}
            initial={{ strokeDashoffset: totalArc }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.3, delay: 0.5 + index * 0.09, ease: [0.22, 0.61, 0.36, 1] }}
          />
          {/* Active params ring (bright) */}
          <motion.circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke={color}
            strokeWidth={strokeW} strokeLinecap="round"
            opacity={isNucleus ? 1 : 0.9}
            strokeDasharray={`${activeArc} ${circumference}`}
            initial={{ strokeDashoffset: activeArc }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.5, delay: 0.6 + index * 0.09, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              filter: isNucleus
                ? `drop-shadow(0 0 10px ${color}${isDark ? "77" : "55"})`
                : undefined,
            }}
          />
        </svg>

        {/* Center text */}
        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: isNucleus ? (compact ? 16 : 22) : (rawSize > 90 ? (compact ? 11 : 15) : (compact ? 10 : 13)),
              fontWeight: 700,
              letterSpacing: "-0.04em",
              ...mono,
              color: isNucleus ? color : (isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.68)"),
              lineHeight: 1,
            }}
          >
            {model.activeParams}B
          </span>
          {isNucleus && (
            <span
              style={{
                fontSize: 9.5, fontWeight: 600,
                color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
                marginTop: 4, letterSpacing: "-0.01em",
                ...mono,
              }}
            >
              / {model.totalParams}B total
            </span>
          )}
          {!isNucleus && (
            <span
              style={{
                fontSize: 7.5, fontWeight: 500,
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.56)",
                marginTop: 3, letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
              }}
            >
              params
            </span>
          )}
        </div>

        {/* Nucleus pulsing outer glow */}
        {isNucleus && (
          <>
            <div
              style={{
                position: "absolute", inset: -7, borderRadius: "50%",
                border: `1.5px solid ${color}`,
                opacity: 0,
                animation: "nucleusRingPulse 3s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute", inset: -14, borderRadius: "50%",
                border: `1px solid ${color}`,
                opacity: 0,
                animation: "nucleusRingPulse 3s ease-in-out 0.4s infinite",
              }}
            />
          </>
        )}
      </div>

      {/* Label area */}
      <div style={{ textAlign: "center", maxWidth: size + 36 }}>
        <p
          style={{
            margin: 0, fontSize: 12,
            fontWeight: isNucleus ? 600 : 450,
            letterSpacing: "-0.02em",
            color: isNucleus ? color : (isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.8)"),
            lineHeight: 1.3,
          }}
        >
          {model.name}
        </p>
        <p
          style={{
            margin: 0, marginTop: 5, fontSize: 10.5,
            fontWeight: 500,
            color: isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.66)",
            letterSpacing: "0.01em",
            ...mono,
          }}
        >
          {model.score.toFixed(3)}
        </p>
        {isNucleus && (
          <div
            style={{
              margin: "10px auto 0", display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 100,
              background: isDark ? "rgba(52,211,153,0.07)" : "rgba(5,150,105,0.05)",
              border: `1px solid ${isDark ? "rgba(52,211,153,0.1)" : "rgba(5,150,105,0.1)"}`,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#34d399" : "#059669"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.65}>
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            </svg>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const,
              color: isDark ? "rgba(110,231,183,0.95)" : "rgba(5,150,105,0.9)",
            }}>
              10x efficient
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ParamInfographic() {
  const { t, theme } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        background: t.panelBg,
        ...(mob
          ? {}
          : {
              backdropFilter: "blur(24px) saturate(1.3)",
              WebkitBackdropFilter: "blur(24px) saturate(1.3)",
            }),
        border: `1px solid ${t.panelBorder}`,
        borderRadius: mob ? 18 : 24,
       
        padding: mob ? "28px 20px 32px" : "44px 44px 48px",
        transition: "background 0.5s, border-color 0.5s, box-shadow 0.5s",
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      {/* Keyframes */}
      <style>{`
        @keyframes nucleusRingPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.08); }
        }
      `}</style>

      {/* Top highlight */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: isDark
          ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 75%, transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.8) 75%, transparent)",
      }} />

      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <p
          style={{
            margin: 0, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
            color: t.sectionKicker, marginBottom: 10,
          }}
        >
          Size Comparison
        </p>
        <p
          style={{
            margin: 0, fontSize: 19, fontWeight: 600,
            letterSpacing: "-0.03em", color: t.chartTitle,
          }}
        >
          Model Scale
        </p>
      </div>

      {/* Legend strip */}
      <div style={{
        display: "flex", gap: 20, marginBottom: 8,
        padding: "8px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 16, height: 3, borderRadius: 2,
            background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          }} />
          <span style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.28)", fontWeight: 500 }}>
            Total params
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 16, height: 3, borderRadius: 2,
            background: isDark ? "rgba(59,158,255,0.6)" : "rgba(0,102,220,0.5)",
          }} />
          <span style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.28)", fontWeight: 500 }}>
            Active params
          </span>
        </div>
      </div>

      {/* Rings row */}
      <div
        style={{
          display: "flex",
          alignItems: mob ? "center" : "flex-end",
          justifyContent: "center",
          flexWrap: mob ? "wrap" : "nowrap",
          gap: mob ? 16 : 14,
          padding: mob ? "24px 0 20px" : "44px 0 32px",
        }}
      >
        {(mob ? centeredOrder.slice(0, 3) : centeredOrder).map((model, i) => (
          <Ring key={model.name} model={model} index={i} isDark={isDark} compact={mob} />
        ))}
      </div>

      {/* Divider */}
      <div style={{
        height: 1, margin: "8px 0 22px",
        background: isDark
          ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.035) 20%, rgba(255,255,255,0.035) 80%, transparent)"
          : "linear-gradient(90deg, transparent, rgba(0,0,0,0.045) 20%, rgba(0,0,0,0.045) 80%, transparent)",
      }} />

      {/* Unknown param models note */}
      <div style={{
        display: "flex", flexDirection: mob ? "column" as const : "row" as const, alignItems: mob ? "flex-start" : "center", gap: mob ? 12 : 20,
        padding: mob ? "14px 16px" : "14px 22px", marginBottom: mob ? 16 : 22,
        borderRadius: mob ? 11 : 13,
        background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
        border: `1px dashed ${isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.06)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.22)"} strokeWidth="2" strokeLinecap="round">
            <path d="M13 16h-1v-4h-1" /><circle cx="12" cy="12" r="10" /><circle cx="12" cy="8" r="0.5" fill={isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.22)"} />
          </svg>
          <p style={{
            margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.58)",
          }}>
            Undisclosed
          </p>
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          {unknownParamModels.map((m) => {
            const c = isDark ? m.color : m.lightColor;
            return (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  border: `1.5px dashed ${c}`,
                  opacity: isDark ? 0.4 : 0.45,
                }} />
                <div>
                  <span style={{
                    fontSize: 11.5, fontWeight: 500,
                    color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.76)",
                    letterSpacing: "-0.01em",
                  }}>
                    {m.name}
                  </span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 400, marginLeft: 8,
                    color: isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.62)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {m.score.toFixed(3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom callout */}
      <div
        style={{
          padding: mob ? "18px 18px" : "22px 26px",
          borderRadius: mob ? 14 : 18,
          background: isDark ? "rgba(59,158,255,0.025)" : "rgba(0,102,220,0.02)",
          border: `1px solid ${isDark ? "rgba(59,158,255,0.06)" : "rgba(0,102,220,0.06)"}`,
          display: "flex",
          flexDirection: mob ? "column" as const : "row" as const,
          alignItems: mob ? "flex-start" : "center",
          gap: mob ? 14 : 18,
        }}
      >
        <div
          style={{
            width: 44, height: 44, borderRadius: 13,
            background: isDark
              ? "linear-gradient(135deg, rgba(59,158,255,0.08), rgba(129,140,248,0.05))"
              : "linear-gradient(135deg, rgba(0,102,220,0.06), rgba(79,70,229,0.03))",
            border: `1px solid ${isDark ? "rgba(59,158,255,0.08)" : "rgba(0,102,220,0.07)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={isDark ? "#4F7CFF" : "#0066DC"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            opacity={0.75}
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div>
          <p
            style={{
              margin: 0, fontSize: 13.5, fontWeight: 500,
              letterSpacing: "-0.015em",
              color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.78)",
              lineHeight: 1.55,
            }}
          >
            Nucleus achieves{" "}
            <span style={{ color: isDark ? "#4F7CFF" : "#0066DC", fontWeight: 600 }}>
              leading performance
            </span>
            {" "}with only 2B active parameters
          </p>
          <p
            style={{
              margin: 0, marginTop: 5, fontSize: 11.5,
              color: isDark ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.66)",
              letterSpacing: "-0.005em", lineHeight: 1.5,
            }}
          >
            Competing models require 3–10× more active parameters to reach comparable scores.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
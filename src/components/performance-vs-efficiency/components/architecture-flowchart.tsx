import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useTheme } from "./theme-context";
import { useIsMobile } from "./use-mobile";

/* ═══════════════════════════════════════════════════════════
   Nucleus-Image · Architecture Flowchart  (v5 — pinnacle)

   Every element is a tangible UI surface:
     • 6-layer node system: ambient glow → gradient fill →
       noise texture → inner highlight → color accent bar →
       text hierarchy with monospace metadata
     • Hero nodes (GQA/MoE) get CSS shimmer animation,
       inner pinstripe texture, amplified glow halos
     • Animated flowing-particle overlay on main data path
     • Warm-amber residual skip connections with glow
     • Zoom-funnel connector with gradient fill
     • Plus circles as floating action buttons with pulse rings
     • Block labels as integrated corner badges
     • HTML glassmorphism annotation cards with accent borders
     • Data flow direction indicator
     • Expert bracket with label badge
   ═══════════════════════════════════════════════════════════ */

export function ArchitectureFlowchart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { t, theme } = useTheme();
  const isDark = theme === "dark";
  const mob = useIsMobile();
  const u = isDark ? "d" : "l";

  if (!mounted) return <div style={{ minHeight: 400 }} />;

  /* ═══════════ COLOUR SYSTEM ═══════════ */
  const C = {
    txt:      isDark ? "#D8DCE8" : "#1C2028",
    txtHi:    isDark ? "#F4F6FC" : "#0C0E12",
    txtSoft:  isDark ? "rgba(255,255,255,.50)" : "rgba(0,0,0,.30)",
    txtMuted: isDark ? "rgba(255,255,255,.30)" : "rgba(0,0,0,.16)",
    line:     isDark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)",
    lineHi:   isDark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.30)",
    skipLine: isDark ? "rgba(255,183,77,.12)"  : "rgba(180,100,0,.12)",
    skipHi:   isDark ? "rgba(255,183,77,.28)"  : "rgba(180,100,0,.28)",
    dash:     isDark ? "rgba(92,179,255,.20)"  : "rgba(0,113,227,.18)",
    blu:      isDark ? "#5CB3FF"  : "#0071E3",
    org:      isDark ? "#FFB45E"  : "#BF5A00",
    grn:      isDark ? "#6EE7B7"  : "#15803D",
    indigo:   isDark ? "#818CF8"  : "#6366F1",
    teal:     isDark ? "#2DD4BF"  : "#0D9488",

    n:  { f0: isDark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.68)",
          f1: isDark ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.92)",
          s:  isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.07)",
          hi: isDark ? "rgba(255,255,255,.14)"  : "rgba(255,255,255,.80)",
          sh: isDark ? "rgba(0,0,0,.15)"        : "rgba(0,0,0,.02)",
          bar: "transparent" },
    d:  { f0: isDark ? "rgba(40,42,70,.85)"    : "rgba(26,28,46,.86)",
          f1: isDark ? "rgba(60,64,100,.90)"   : "rgba(42,46,74,.94)",
          s:  isDark ? "rgba(129,140,248,.30)" : "rgba(99,102,241,.22)",
          hi: isDark ? "rgba(129,140,248,.20)" : "rgba(255,255,255,.05)",
          sh: isDark ? "rgba(0,0,0,.25)"       : "rgba(0,0,0,.04)",
          bar: isDark ? "#818CF8"              : "#6366F1" },
    a:  { f0: isDark ? "rgba(59,130,246,.02)"  : "rgba(0,113,227,.008)",
          f1: isDark ? "rgba(59,130,246,.07)"  : "rgba(0,113,227,.035)",
          s:  isDark ? "rgba(59,130,246,.13)"  : "rgba(0,113,227,.12)",
          hi: isDark ? "rgba(92,179,255,.09)"  : "rgba(0,113,227,.05)",
          sh: isDark ? "rgba(0,0,0,.08)"       : "rgba(0,0,0,.015)",
          bar: isDark ? "#5CB3FF"              : "#0071E3" },
    m:  { f0: isDark ? "rgba(45,212,191,.015)" : "rgba(13,148,136,.008)",
          f1: isDark ? "rgba(45,212,191,.07)"  : "rgba(13,148,136,.04)",
          s:  isDark ? "rgba(45,212,191,.13)"  : "rgba(13,148,136,.14)",
          hi: isDark ? "rgba(45,212,191,.09)"  : "rgba(13,148,136,.05)",
          sh: isDark ? "rgba(0,0,0,.08)"       : "rgba(0,0,0,.015)",
          bar: isDark ? "#2DD4BF"              : "#0D9488" },

    p:  { f0: isDark ? "rgba(255,255,255,.012)" : "rgba(255,255,255,.66)",
          f1: isDark ? "rgba(255,255,255,.055)" : "rgba(255,255,255,.90)",
          s:  isDark ? "rgba(255,255,255,.07)"  : "rgba(0,0,0,.09)",
          g:  isDark ? "rgba(99,170,255,.055)"  : "rgba(0,113,227,.03)" },

    gy: { f0: isDark ? "rgba(255,255,255,.003)" : "rgba(0,0,0,.006)",
          f1: isDark ? "rgba(255,255,255,.016)" : "rgba(0,0,0,.025)",
          s:  isDark ? "rgba(255,255,255,.028)" : "rgba(0,0,0,.055)" },
    gr: { f0: isDark ? "rgba(110,231,183,.012)" : "rgba(21,128,61,.015)",
          f1: isDark ? "rgba(110,231,183,.055)" : "rgba(21,128,61,.065)",
          s:  isDark ? "rgba(110,231,183,.10)"  : "rgba(21,128,61,.13)",
          hi: isDark ? "rgba(110,231,183,.04)"  : "rgba(21,128,61,.035)" },
  };

  /* ═══════════ LAYOUT ═══════════ */
  const BW = 156, BH = 36, GH = 52, PR = 14;
  const CX = 278;

  const OUT = 62, LIN = 132, ADA = 198, P2 = 264;
  const MOE = 312, MD2 = 380, RM2 = 442, P1 = 506;
  const GQA = 556, MD1 = 636, RM1 = 700, INP = 836;

  const GRAY = { x: 6, y: 108, w: 444, h: 756 };
  const GRN  = { x: 164, y: P2 - 24, w: 232, h: (RM1 + BH + 20) - (P2 - 24) };

  const SC_CX = 66, SC_CY = GQA + GH / 2, SC_W = 102, SC_H = 40;
  const SK = CX - BW / 2 - 22;

  const ED = { x: 482, y: 284, w: 454, h: 366 };
  const EI = 622, RO = 540, EX = 452, EP = 374;
  const eXcx = 518, eUcx = 676, eTcx = 852, eRcx = 756;
  const eScx = 538, e1cx = 698, e64cx = 862, ePcx = 706;

  /* ═══════════ NODE RENDERER ═══════════ */

  type V = "default" | "dark" | "accent" | "moe";
  const vp = (v: V) => v === "dark" ? C.d : v === "accent" ? C.a : v === "moe" ? C.m : C.n;

  const Nd = (cx: number, cy: number, w: number, h: number,
    label: string | string[], v: V = "default", fs = 11,
    opts?: { sub?: string; icon?: string }) => {
    const lines = Array.isArray(label) ? label : [label];
    const p = vp(v);
    const id = `n${u}${Math.round(cx)}${Math.round(cy)}`;
    const rx = v === "dark" || v === "moe" ? 12 : 10;
    const isSpecial = v !== "default";
    const isHero = v === "dark" || v === "moe";
    const tc = v === "dark" ? "#E2E4E8" : C.txt;
    const sub = opts?.sub;
    const icon = opts?.icon;
    return (
      <g key={id}>
        {/* ① ambient glow (larger for hero nodes) */}
        {isSpecial && (
          <ellipse cx={cx} cy={cy}
            rx={w * (isHero ? 0.75 : 0.58)} ry={h * (isHero ? 1.0 : 0.75)}
            fill={
              v === "dark" ? (isDark ? "rgba(129,140,248,.018)" : "rgba(99,102,241,.008)")
              : v === "accent" ? (isDark ? "rgba(92,179,255,.012)" : "rgba(0,113,227,.006)")
              : (isDark ? "rgba(45,212,191,.015)" : "rgba(13,148,136,.007)")
            }
            filter={`url(#amb${u})`} />
        )}

        {/* ② shadow group */}
        <g filter={isHero ? `url(#heroSh${u})` : `url(#ndSh${u})`}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.f1} />
              <stop offset="100%" stopColor={p.f0} />
            </linearGradient>
          </defs>

          {/* ③ main rect */}
          <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={rx}
            fill={`url(#${id})`} stroke={p.s} strokeWidth={isHero ? 0.8 : 0.6} />

          {/* ④ noise texture overlay */}
          <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={rx}
            fill={`url(#noise${u})`} opacity={isHero ? 0.4 : 0.2} />

          {/* ⑤ inner pinstripe for hero nodes */}
          {isHero && (
            <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={rx}
              fill={`url(#pinstripe${u})`} opacity={isDark ? 0.12 : 0.06} />
          )}

          {/* ⑥ colour accent bar (left edge) */}
          {isSpecial && p.bar !== "transparent" && (
            <rect x={cx - w / 2 + 4} y={cy - h / 2 + 7}
              width={3} height={h - 14} rx={1.5}
              fill={p.bar} opacity={isHero ? 0.6 : 0.4} />
          )}

          {/* ⑦ top inner highlight */}
          <line x1={cx - w / 2 + rx + 3} y1={cy - h / 2 + 0.5}
            x2={cx + w / 2 - rx - 3} y2={cy - h / 2 + 0.5}
            stroke={p.hi} strokeWidth={isHero ? 0.7 : 0.45} strokeLinecap="round" />

          {/* ⑧ bottom edge shadow */}
          <line x1={cx - w / 2 + rx + 3} y1={cy + h / 2 - 0.5}
            x2={cx + w / 2 - rx - 3} y2={cy + h / 2 - 0.5}
            stroke={p.sh} strokeWidth={0.4} strokeLinecap="round" />

          {/* ⑨ type icon badge */}
          {icon && (() => {
            const ix = cx - w / 2 + (isSpecial ? 14 : 10);
            const col = v === "dark" ? C.indigo : v === "moe" ? C.teal : v === "accent" ? C.blu : C.txtSoft;
            return (
              <g>
                <circle cx={ix} cy={cy + (sub ? -2 : 0)} r={6}
                  fill={isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"}
                  stroke={col + (isDark ? "22" : "18")} strokeWidth={0.5} />
                <text x={ix} y={cy + (sub ? -1.5 : 0.5)} textAnchor="middle" dominantBaseline="central"
                  fill={col} fontSize={7} fontFamily="'JetBrains Mono',monospace" fontWeight={700}>
                  {icon}
                </text>
              </g>
            );
          })()}

          {/* ⑩ label(s) */}
          {lines.map((l, i) => {
            const yOff = sub ? -4 : 0;
            const xOff = icon ? 6 : (isSpecial && p.bar !== "transparent" ? 4 : 0);
            return (
              <text key={i} x={cx + xOff}
                y={cy + (i - (lines.length - 1) / 2) * (isHero ? 15 : 14) + yOff + 0.5}
                textAnchor="middle" dominantBaseline="central"
                fill={tc} fontSize={fs} fontFamily="'Inter',sans-serif"
                fontWeight={isHero ? 560 : 480} letterSpacing="-0.01em">
                {l}
              </text>
            );
          })}

          {/* ⑪ sub text */}
          {sub && (
            <text x={cx + (icon ? 6 : isSpecial ? 4 : 0)}
              y={cy + (lines.length > 1 ? 18 : 10)}
              textAnchor="middle" dominantBaseline="central"
              fill={isDark ? "rgba(255,255,255,.20)" : "rgba(0,0,0,.18)"}
              fontSize={8} fontFamily="'JetBrains Mono',monospace" fontWeight={500}
              letterSpacing="0.03em">
              {sub}
            </text>
          )}
        </g>

        {/* shimmer overlay for hero nodes */}
        {isHero && (
          <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={rx}
            fill={`url(#shimmer${v}${u})`} className={`shimmer${u}`}
            style={{ mixBlendMode: "overlay" as const }} />
        )}
      </g>
    );
  };

  /* ── Plus circle ── */
  const Pl = (cx: number, cy: number) => {
    const id = `p${u}${Math.round(cx)}${Math.round(cy)}`;
    return (
      <g>
        {/* outer pulse ring */}
        <circle cx={cx} cy={cy} r={PR + 4}
          fill="none" stroke={C.p.g} strokeWidth={0.5}
          className={`pulse${u}`} />
        {/* ambient glow */}
        <circle cx={cx} cy={cy} r={PR + 8} fill={C.p.g} filter={`url(#amb${u})`} />
        <g filter={`url(#plGl${u})`}>
          <defs>
            <radialGradient id={id} cx="50%" cy="26%" r="72%">
              <stop offset="0%" stopColor={C.p.f1} />
              <stop offset="100%" stopColor={C.p.f0} />
            </radialGradient>
          </defs>
          {/* main circle */}
          <circle cx={cx} cy={cy} r={PR} fill={`url(#${id})`} stroke={C.p.s} strokeWidth={0.6} />
          {/* noise texture */}
          <circle cx={cx} cy={cy} r={PR} fill={`url(#noise${u})`} opacity={0.15} />
          {/* specular catchlight */}
          <ellipse cx={cx - 0.5} cy={cy - 5} rx={5.5} ry={2.8}
            fill={isDark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.5)"} />
          {/* inner ring */}
          <circle cx={cx} cy={cy} r={PR - 2.5}
            fill="none" stroke={isDark ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.035)"}
            strokeWidth={0.4} />
          {/* + sign */}
          <line x1={cx - 4.5} y1={cy} x2={cx + 4.5} y2={cy}
            stroke={C.txtHi} strokeWidth={1.2} strokeLinecap="round" />
          <line x1={cx} y1={cy - 4.5} x2={cx} y2={cy + 4.5}
            stroke={C.txtHi} strokeWidth={1.2} strokeLinecap="round" />
        </g>
      </g>
    );
  };

  /* ── Connection helpers ── */
  const Ar = (x1: number, y1: number, x2: number, y2: number, dash = false) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={dash ? C.dash : C.line} strokeWidth={dash ? 0.85 : 0.75}
      strokeDasharray={dash ? "7 4" : undefined}
      markerEnd={`url(#ah${u})`} />
  );

  const SkipPath = (sx: number, sy: number, gx: number, ex: number, ey: number) => {
    const r = 14;
    const d = `M${sx},${sy} L${gx + r},${sy} Q${gx},${sy} ${gx},${sy - r} L${gx},${ey + r} Q${gx},${ey} ${gx + r},${ey} L${ex},${ey}`;
    return (
      <g>
        <path d={d} fill="none" stroke={C.skipLine} strokeWidth={4}
          filter={`url(#amb${u})`} />
        <path d={d} fill="none" stroke={C.skipLine} strokeWidth={0.85}
          strokeDasharray="6 3.5" markerEnd={`url(#ahSkip${u})`} />
        {/* label */}
        <text x={gx - 5} y={(sy + ey) / 2 + 1} textAnchor="end"
          fill={C.skipHi} fontSize={7} fontFamily="'JetBrains Mono',monospace"
          fontWeight={600} letterSpacing="0.04em" opacity={0.7}>
          residual
        </text>
      </g>
    );
  };

  const Ln = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.line} strokeWidth={0.75} />
  );

  /* ── Pill badge ── */
  const Pill = (cx: number, cy: number, text: string, col: string) => {
    const pw = text.length * 5.2 + 22;
    return (
      <g filter={`url(#ndSh${u})`}>
        <rect x={cx - pw / 2} y={cy - 10} width={pw} height={20} rx={10}
          fill={isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.02)"}
          stroke={isDark ? "rgba(255,255,255,.045)" : "rgba(0,0,0,.055)"}
          strokeWidth={0.5} />
        <rect x={cx - pw / 2} y={cy - 10} width={pw} height={20} rx={10}
          fill={`url(#noise${u})`} opacity={0.15} />
        <line x1={cx - pw / 2 + 12} y1={cy - 10 + 0.5} x2={cx + pw / 2 - 12} y2={cy - 10 + 0.5}
          stroke={isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.4)"}
          strokeWidth={0.35} strokeLinecap="round" />
        <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="central"
          fill={col} fontSize={7.5} fontFamily="'Inter',sans-serif"
          fontWeight={660} letterSpacing="0.08em">
          {text}
        </text>
      </g>
    );
  };

  /* ═══════════ FLOW PATH ═══════════ */
  const flowPath = `
    M${CX},${INP - 15} L${CX},${RM1 + BH}
    M${CX},${RM1} L${CX},${MD1 + BH}
    M${CX},${MD1} L${CX},${GQA + GH}
    M${CX},${GQA} L${CX},${P1 + PR}
    M${CX},${P1 - PR} L${CX},${RM2 + BH}
    M${CX},${RM2} L${CX},${MD2 + BH}
    M${CX},${MD2} L${CX},${MOE + BH}
    M${CX},${MOE} L${CX},${P2 + PR}
    M${CX},${P2 - PR} L${CX},${ADA + BH}
    M${CX},${ADA} L${CX},${LIN + BH}
    M${CX},${LIN} L${CX},${OUT + BH}
  `;

  /* ── Zoom funnel ── */
  const funnel = (() => {
    const sx = CX + BW / 2 + 2;
    const sy1 = MOE + BH / 2 - 7;
    const sy2 = MOE + BH / 2 + 7;
    const ex = ED.x;
    const ey1 = ED.y + 10;
    const ey2 = ED.y + ED.h - 10;
    const cp = (sx + ex) / 2;
    return `M${sx},${sy1} C${cp},${sy1} ${cp},${ey1} ${ex},${ey1} L${ex},${ey2} C${cp},${ey2} ${cp},${sy2} ${sx},${sy2} Z`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      style={{
        borderRadius: mob ? 18 : 24,
        background: isDark ? "rgba(8,8,20,0.85)" : "rgba(255,255,255,0.90)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        border: isDark ? "1px solid rgba(100,160,255,0.15)" : `1px solid ${t.panelBorder}`,
        boxShadow: t.panelShadow,
        overflow: "hidden",
        position: "relative" as const,
      }}
    >
      {/* top hairline */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1, zIndex: 1,
        background: isDark
          ? "linear-gradient(90deg,transparent,rgba(255,255,255,.05) 25%,rgba(255,255,255,.05) 75%,transparent)"
          : "linear-gradient(90deg,transparent,rgba(255,255,255,.8) 25%,rgba(255,255,255,.8) 75%,transparent)",
        borderRadius: `${mob ? 18 : 24}px ${mob ? 18 : 24}px 0 0`,
      }} />

      <div style={{ padding: mob ? "28px 16px 24px" : "48px 48px 40px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: mob ? 20 : 36 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: t.sectionKicker, marginBottom: 10 }}>
            Architecture
          </p>
          <p style={{ margin: 0, fontSize: mob ? 16 : 20, fontWeight: 650, letterSpacing: "-0.03em", color: t.chartTitle }}>
            Nucleus-Image{" "}
            <span style={{ fontWeight: 400, fontSize: mob ? 13 : 16, color: isDark ? "rgba(129,140,248,.26)" : "rgba(79,70,229,.20)" }}>·</span>{" "}
            <span style={{ fontWeight: 420, fontSize: mob ? 13 : 16, color: isDark ? "rgba(255,255,255,.32)" : "rgba(0,0,0,.32)" }}>
              Transformer Block Diagram
            </span>
          </p>
        </div>


        {/* ══════════════════ SVG ══════════════════ */}
        <div style={{ overflowX: "auto", margin: mob ? "0 -8px" : 0, padding: mob ? "0 8px 8px" : 0 }}>
          <svg viewBox="0 0 480 900"
            style={{ width: "100%", minWidth: mob ? 700 : undefined, maxWidth: 940, display: "block" }}>

            <defs>
              {/* ── CSS animations ── */}
              <style>{`
                @keyframes flow${u} {
                  from { stroke-dashoffset: 24; }
                  to { stroke-dashoffset: 0; }
                }
                .flow${u} {
                  stroke-dasharray: 3 21;
                  animation: flow${u} 2s linear infinite;
                }
                @keyframes shimmer${u} {
                  0%, 100% { opacity: 0; }
                  50% { opacity: 1; }
                }
                .shimmer${u} {
                  animation: shimmer${u} 4s ease-in-out infinite;
                }
                @keyframes pulse${u} {
                  0%, 100% { opacity: 0.15; r: ${PR + 4}; }
                  50% { opacity: 0.35; r: ${PR + 7}; }
                }
                .pulse${u} {
                  animation: pulse${u} 3s ease-in-out infinite;
                }
              `}</style>

              {/* ── Markers ── */}
              <marker id={`ah${u}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <path d="M1.5,1.5 L8,4 L1.5,6.5" fill="none"
                  stroke={C.lineHi} strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <marker id={`ahSkip${u}`} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <path d="M1.5,1.5 L8,4 L1.5,6.5" fill="none"
                  stroke={C.skipHi} strokeWidth={0.8} strokeLinecap="round" strokeLinejoin="round" />
              </marker>

              {/* ── Filters ── */}
              <filter id={`ndSh${u}`} x="-12%" y="-12%" width="124%" height="134%">
                <feDropShadow dx="0" dy="0.4" stdDeviation="1"
                  floodColor={isDark ? "rgba(0,0,0,.35)" : "rgba(0,0,0,.04)"} />
                <feDropShadow dx="0" dy="2.5" stdDeviation="5"
                  floodColor={isDark ? "rgba(0,0,0,.18)" : "rgba(0,0,0,.018)"} />
              </filter>
              <filter id={`heroSh${u}`} x="-14%" y="-14%" width="128%" height="140%">
                <feDropShadow dx="0" dy="0.5" stdDeviation="1.5"
                  floodColor={isDark ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.06)"} />
                <feDropShadow dx="0" dy="4" stdDeviation="8"
                  floodColor={isDark ? "rgba(0,0,0,.24)" : "rgba(0,0,0,.025)"} />
                <feDropShadow dx="0" dy="8" stdDeviation="16"
                  floodColor={isDark ? "rgba(0,0,0,.12)" : "rgba(0,0,0,.01)"} />
              </filter>
              <filter id={`plGl${u}`} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor={C.p.g} />
                <feDropShadow dx="0" dy="0.5" stdDeviation="1.5"
                  floodColor={isDark ? "rgba(0,0,0,.25)" : "rgba(0,0,0,.03)"} />
              </filter>
              <filter id={`amb${u}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="18" />
              </filter>
              <filter id={`softGlow${u}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" />
              </filter>

              {/* ── Gradients ── */}
              <linearGradient id={`gyG${u}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.gy.f1} />
                <stop offset="100%" stopColor={C.gy.f0} />
              </linearGradient>
              <linearGradient id={`grG${u}`} x1=".1" y1="0" x2=".9" y2="1">
                <stop offset="0%" stopColor={C.gr.f1} />
                <stop offset="100%" stopColor={C.gr.f0} />
              </linearGradient>
              <linearGradient id={`funnelG${u}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={isDark ? "rgba(45,212,191,.035)" : "rgba(13,148,136,.018)"} />
                <stop offset="50%" stopColor={isDark ? "rgba(45,212,191,.012)" : "rgba(13,148,136,.006)"} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* shimmer gradients for hero nodes */}
              <linearGradient id={`shimmerdark${u}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="40%" stopColor={isDark ? "rgba(129,140,248,.03)" : "rgba(99,102,241,.015)"} />
                <stop offset="60%" stopColor={isDark ? "rgba(129,140,248,.05)" : "rgba(99,102,241,.025)"} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id={`shimmermoe${u}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="40%" stopColor={isDark ? "rgba(45,212,191,.03)" : "rgba(13,148,136,.015)"} />
                <stop offset="60%" stopColor={isDark ? "rgba(45,212,191,.05)" : "rgba(13,148,136,.025)"} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* ── Patterns ── */}
              <pattern id={`dots${u}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.35"
                  fill={isDark ? "rgba(255,255,255,.02)" : "rgba(0,0,0,.018)"} />
              </pattern>
              <pattern id={`noise${u}`} width="100" height="100" patternUnits="userSpaceOnUse">
                <filter id={`noiseF${u}`}>
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100" height="100" filter={`url(#noiseF${u})`} opacity={isDark ? "0.04" : "0.025"} />
              </pattern>
              <pattern id={`pinstripe${u}`} width="4" height="4" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="4" y2="4"
                  stroke={isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"} strokeWidth="0.5" />
              </pattern>
            </defs>


            {/* ═══════════ BACKGROUND ═══════════ */}

            {/* Gray block */}
            <rect x={GRAY.x} y={GRAY.y} width={GRAY.w} height={GRAY.h}
              rx={22} fill={`url(#gyG${u})`} stroke={C.gy.s} strokeWidth={0.6} />
            <rect x={GRAY.x} y={GRAY.y} width={GRAY.w} height={GRAY.h}
              rx={22} fill={`url(#dots${u})`} />
            {/* inset shadow at top */}
            <rect x={GRAY.x + 1} y={GRAY.y + 1} width={GRAY.w - 2} height={18}
              rx={22} fill={isDark ? "rgba(0,0,0,.04)" : "rgba(0,0,0,.008)"}
              style={{ clipPath: `inset(0 0 ${GRAY.h - 19}px 0 round 22px)` } as React.CSSProperties} />
            {/* top highlight */}
            <line x1={GRAY.x + 36} y1={GRAY.y + 0.5} x2={GRAY.x + GRAY.w - 36} y2={GRAY.y + 0.5}
              stroke={isDark ? "rgba(255,255,255,.018)" : "rgba(255,255,255,.32)"}
              strokeWidth={0.5} strokeLinecap="round" />
            {/* block label */}
            {(() => {
              const lx = GRAY.x + 18, ly = GRAY.y + 22;
              return (
                <text x={lx} y={ly} fill={C.txtMuted} fontSize={8.5}
                  fontFamily="'Inter',sans-serif" fontWeight={600} letterSpacing="0.06em"
                  style={{ textTransform: "uppercase" }}>
                  TRANSFORMER BLOCK
                </text>
              );
            })()}

            {/* Green block */}
            <rect x={GRN.x} y={GRN.y} width={GRN.w} height={GRN.h}
              rx={16} fill={`url(#grG${u})`} stroke={C.gr.s} strokeWidth={0.65} />
            {/* green dot overlay */}
            <rect x={GRN.x} y={GRN.y} width={GRN.w} height={GRN.h}
              rx={16} fill={`url(#dots${u})`} />
            <line x1={GRN.x + 24} y1={GRN.y + 0.5} x2={GRN.x + GRN.w - 24} y2={GRN.y + 0.5}
              stroke={C.gr.hi} strokeWidth={0.35} strokeLinecap="round" />
            {/* green block label */}
            <text x={GRN.x + 14} y={GRN.y + 18} fill={C.grn} fontSize={8}
              fontFamily="'Inter',sans-serif" fontWeight={600} letterSpacing="0.05em"
              opacity={0.5}>
              REPEAT BLOCK
            </text>

            {/* 32× badge */}
            {(() => {
              const bx = GRN.x + GRN.w + 9;
              const cy = GRN.y + GRN.h / 2;
              return (
                <g>
                  <path
                    d={`M${bx},${GRN.y + 16} C${bx + 15},${GRN.y + 16} ${bx + 15},${cy - 48} ${bx + 18},${cy}
                        C${bx + 15},${cy + 48} ${bx + 15},${GRN.y + GRN.h - 16} ${bx},${GRN.y + GRN.h - 16}`}
                    fill="none" stroke={C.txtMuted} strokeWidth={0.6} />
                  {/* badge */}
                  <g filter={`url(#ndSh${u})`}>
                    <rect x={bx + 24} y={cy - 16} width={42} height={32} rx={9}
                      fill={isDark ? "rgba(255,183,77,.025)" : "rgba(180,100,0,.015)"}
                      stroke={isDark ? "rgba(255,183,77,.09)" : "rgba(180,100,0,.07)"}
                      strokeWidth={0.5} />
                    <rect x={bx + 24} y={cy - 16} width={42} height={32} rx={9}
                      fill={`url(#noise${u})`} opacity={0.2} />
                    <line x1={bx + 33} y1={cy - 16 + 0.5} x2={bx + 57} y2={cy - 16 + 0.5}
                      stroke={isDark ? "rgba(255,183,77,.06)" : "rgba(180,100,0,.04)"}
                      strokeWidth={0.35} strokeLinecap="round" />
                    <text x={bx + 45} y={cy - 3} textAnchor="middle"
                      fill={C.org} fontSize={14} fontFamily="'JetBrains Mono',monospace" fontWeight={700}>
                      32
                    </text>
                    <text x={bx + 45} y={cy + 12} textAnchor="middle"
                      fill={C.txtSoft} fontSize={9} fontFamily="'Inter',sans-serif" fontWeight={600}>
                      ×
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* Ambient glows */}
            <ellipse cx={CX} cy={GQA + GH / 2} rx={110} ry={72}
              fill={isDark ? "rgba(129,140,248,.015)" : "rgba(99,102,241,.006)"}
              filter={`url(#amb${u})`} />
            <ellipse cx={CX} cy={MOE + BH / 2} rx={90} ry={50}
              fill={isDark ? "rgba(45,212,191,.012)" : "rgba(13,148,136,.005)"}
              filter={`url(#amb${u})`} />
            <ellipse cx={CX} cy={OUT + BH / 2} rx={80} ry={40}
              fill={isDark ? "rgba(92,179,255,.008)" : "rgba(0,113,227,.004)"}
              filter={`url(#amb${u})`} />

            {/* ═══════════ ANIMATED FLOW ═══════════ */}
            <path d={flowPath} fill="none"
              stroke={isDark ? "rgba(92,179,255,.10)" : "rgba(0,113,227,.07)"}
              strokeWidth={1.5} className={`flow${u}`} />

            {/* flow direction indicator */}
            {(() => {
              const fx = CX + BW / 2 + 28, fy = (INP + RM1 + BH) / 2;
              return (
                <g opacity={0.35}>
                  <text x={fx} y={fy} textAnchor="start" fill={C.blu}
                    fontSize={7} fontFamily="'JetBrains Mono',monospace"
                    fontWeight={600} letterSpacing="0.06em">
                    DATA FLOW
                  </text>
                  <path d={`M${fx + 2},${fy - 8} L${fx + 6},${fy - 14} L${fx + 10},${fy - 8}`}
                    fill="none" stroke={C.blu} strokeWidth={0.8} strokeLinecap="round" />
                </g>
              );
            })()}

            {/* ═══════════ MAIN COLUMN ═══════════ */}

            {/* Inputs */}
            {Nd(SC_CX, INP, 114, 32, "Condition", "accent", 10.5, { icon: "C" })}
            {Nd(CX, INP, 136, 32, "Noisy latents", "accent", 10.5, { icon: "z" })}

            {Ar(SC_CX, INP - 16, SC_CX, SC_CY + SC_H / 2)}
            {Nd(SC_CX, SC_CY, SC_W, SC_H, "RMSNorm", "default", 11, { icon: "N" })}

            {/* Cross-attention */}
            {Ar(SC_CX + SC_W / 2, SC_CY, CX - (BW + 18) / 2, GQA + GH / 2)}
            {Pill(
              (SC_CX + SC_W / 2 + CX - (BW + 18) / 2) / 2,
              SC_CY - 18, "CROSS ATTN", C.indigo
            )}

            {Ar(CX, INP - 16, CX, RM1 + BH)}

            {/* ── Green interior ── */}
            {Nd(CX, RM1 + BH / 2, BW, BH, "RMSNorm 1", "default", 11, { icon: "N" })}
            {Ar(CX, RM1, CX, MD1 + BH)}

            {Nd(CX, MD1 + BH / 2, BW, BH, "Modulation", "default", 11, { icon: "M" })}
            {Ar(CX, MD1, CX, GQA + GH)}

            {/* ★ GQA hero node */}
            {Nd(CX, GQA + GH / 2, BW + 22, GH,
              ["Grouped-Query", "Attention"], "dark", 11.5,
              { sub: "d_model = 3,072", icon: "A" })}
            {Ar(CX, GQA, CX, P1 + PR)}

            {/* Residual skip 1 */}
            {SkipPath(CX, RM1 + BH + 14, SK, CX - PR, P1)}

            {Pl(CX, P1)}
            {Ar(CX, P1 - PR, CX, RM2 + BH)}

            {Nd(CX, RM2 + BH / 2, BW, BH, "RMSNorm 2", "default", 11, { icon: "N" })}
            {Ar(CX, RM2, CX, MD2 + BH)}

            {Nd(CX, MD2 + BH / 2, BW, BH, "Modulation", "default", 11, { icon: "M" })}
            {Ar(CX, MD2, CX, MOE + BH)}

            {/* ★ MoE hero node */}
            {Nd(CX, MOE + BH / 2, BW + 4, BH + 2, "Expert-Choice MoE", "moe", 11,
              { sub: "64 experts · top-k", icon: "E" })}
            {Ar(CX, MOE, CX, P2 + PR)}

            {/* Residual skip 2 */}
            {SkipPath(CX, RM2 + BH + 14, SK, CX - PR, P2)}

            {Pl(CX, P2)}

            {/* Above green */}
            {Ar(CX, P2 - PR, CX, ADA + BH)}
            {Nd(CX, ADA + BH / 2, BW, BH, "AdaLayerNorm", "default", 11, { icon: "N" })}
            {Ar(CX, ADA, CX, LIN + BH)}
            {Nd(CX, LIN + BH / 2, BW + 16, BH, "Linear output proj", "default", 10.5, { icon: "L" })}
            {Ar(CX, LIN, CX, OUT + BH)}
            {Nd(CX, OUT + BH / 2, BW + 6, BH, "Denoised latents", "accent", 11, { icon: "z\u0302" })}


            {/* ═══════════ ZOOM FUNNEL ═══════════ */}
            <path d={funnel}
              fill={`url(#funnelG${u})`}
              stroke={isDark ? "rgba(45,212,191,.05)" : "rgba(13,148,136,.035)"}
              strokeWidth={0.5} />
            {/* zoom label */}
            <text x={(CX + BW / 2 + ED.x) / 2 + 10} y={MOE + BH / 2 - 18}
              textAnchor="middle" fill={C.teal}
              fontSize={7} fontFamily="'JetBrains Mono',monospace"
              fontWeight={600} letterSpacing="0.05em" opacity={0.4}>
              EXPAND
            </text>


            {/* ═══════════ EXPERT-CHOICE MoE ═══════════ */}

            {/* Background panel */}
            <rect x={ED.x} y={ED.y} width={ED.w} height={ED.h} rx={18}
              fill={isDark ? "rgba(255,255,255,.004)" : "rgba(0,0,0,.005)"}
              stroke={isDark ? "rgba(255,255,255,.045)" : "rgba(0,0,0,.07)"}
              strokeWidth={0.8} strokeDasharray="6 4" />
            <rect x={ED.x} y={ED.y} width={ED.w} height={ED.h} rx={18}
              fill={`url(#dots${u})`} />

            {/* Title badge */}
            {(() => {
              const tw = 160, th = 26;
              const tx = ED.x + ED.w / 2 - tw / 2;
              const ty = ED.y - th / 2;
              return (
                <g filter={`url(#ndSh${u})`}>
                  <rect x={tx} y={ty} width={tw} height={th} rx={th / 2}
                    fill={isDark ? "rgba(45,212,191,.05)" : "rgba(13,148,136,.03)"}
                    stroke={isDark ? "rgba(45,212,191,.10)" : "rgba(13,148,136,.08)"}
                    strokeWidth={0.6} />
                  <rect x={tx} y={ty} width={tw} height={th} rx={th / 2}
                    fill={`url(#noise${u})`} opacity={0.15} />
                  <line x1={tx + th / 2 + 2} y1={ty + 0.5} x2={tx + tw - th / 2 - 2} y2={ty + 0.5}
                    stroke={isDark ? "rgba(45,212,191,.07)" : "rgba(13,148,136,.05)"}
                    strokeWidth={0.35} strokeLinecap="round" />
                  {/* small icon */}
                  <circle cx={tx + 18} cy={ty + th / 2} r={4}
                    fill={isDark ? "rgba(45,212,191,.08)" : "rgba(13,148,136,.05)"}
                    stroke={C.teal + "25"} strokeWidth={0.4} />
                  <text x={tx + 18} y={ty + th / 2 + 0.5} textAnchor="middle" dominantBaseline="central"
                    fill={C.teal} fontSize={5.5} fontFamily="'JetBrains Mono',monospace" fontWeight={700}>
                    E
                  </text>
                  <text x={ED.x + ED.w / 2 + 6} y={ty + th / 2 + 0.5}
                    textAnchor="middle" dominantBaseline="central"
                    fill={C.teal} fontSize={9.5}
                    fontFamily="'Inter',sans-serif" fontWeight={660} letterSpacing="0.04em">
                    Expert-Choice MoE
                  </text>
                </g>
              );
            })()}


          </svg>
        </div>


        {/* ══════════════════ HTML ANNOTATION CARDS ══════════════════ */}
        <div style={{
          display: "flex",
          gap: mob ? 10 : 16,
          marginTop: mob ? 16 : 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {/* Architecture Note card */}
          <div style={{
            padding: 0, borderRadius: 16, overflow: "hidden",
            background: isDark ? "rgba(15,15,35,.9)" : "rgba(0,0,0,.012)",
            backdropFilter: "blur(16px) saturate(1.3)",
            WebkitBackdropFilter: "blur(16px) saturate(1.3)",
            border: `1px solid ${isDark ? "rgba(100,160,255,.12)" : "rgba(0,0,0,.055)"}`,
            flex: "1 1 220px", maxWidth: 320, minWidth: 200,
          }}>
            {/* accent bar top */}
            <div style={{
              height: 2, background: isDark
                ? "linear-gradient(90deg, transparent, rgba(255,183,77,.6) 30%, rgba(255,183,77,.6) 70%, transparent)"
                : "linear-gradient(90deg, transparent, rgba(180,100,0,.3) 30%, rgba(180,100,0,.3) 70%, transparent)",
            }} />
            <div style={{ padding: "14px 18px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 6,
                  background: isDark ? "rgba(255,183,77,.12)" : "rgba(180,100,0,.06)",
                  border: `1px solid ${isDark ? "rgba(255,183,77,.25)" : "rgba(180,100,0,.12)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: C.org, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
                }}>!</div>
                <span style={{
                  fontSize: 8.5, fontWeight: 660, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                  color: C.org, fontFamily: "'Inter',sans-serif",
                }}>
                  Architecture Note
                </span>
              </div>
              <div style={{
                fontSize: 11.5, color: C.txt, lineHeight: 1.6, fontFamily: "'Inter',sans-serif", fontWeight: 400,
              }}>
                First <span style={{ color: C.org, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>3</span> blocks use dense FFN with hidden size{" "}
                <span style={{
                  color: C.blu, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
                  padding: "1px 5px", borderRadius: 4,
                  background: isDark ? "rgba(92,179,255,.06)" : "rgba(0,113,227,.04)",
                }}>2,048</span>{" "}
                instead of MoE.
              </div>
            </div>
          </div>

          {/* Model Specifications card */}
          <div style={{
            padding: 0, borderRadius: 16, overflow: "hidden",
            background: isDark ? "rgba(15,15,35,.9)" : "rgba(0,0,0,.012)",
            backdropFilter: "blur(16px) saturate(1.3)",
            WebkitBackdropFilter: "blur(16px) saturate(1.3)",
            border: `1px solid ${isDark ? "rgba(100,160,255,.12)" : "rgba(0,0,0,.055)"}`,
            flex: "1 1 220px", maxWidth: 320, minWidth: 200,
          }}>
            {/* accent bar top */}
            <div style={{
              height: 2, background: isDark
                ? "linear-gradient(90deg, transparent, rgba(45,212,191,.6) 30%, rgba(45,212,191,.6) 70%, transparent)"
                : "linear-gradient(90deg, transparent, rgba(13,148,136,.3) 30%, rgba(13,148,136,.3) 70%, transparent)",
            }} />
            <div style={{ padding: "14px 20px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 6,
                  background: isDark ? "rgba(45,212,191,.12)" : "rgba(13,148,136,.06)",
                  border: `1px solid ${isDark ? "rgba(45,212,191,.25)" : "rgba(13,148,136,.12)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: C.teal, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
                }}>≡</div>
                <span style={{
                  fontSize: 8.5, fontWeight: 660, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                  color: C.teal, fontFamily: "'Inter',sans-serif",
                }}>
                  Model Specifications
                </span>
              </div>
              {[
                ["Total Parameters", "17B"],
                ["Active Parameters", "2B"],
                ["Transformer Blocks", "32"],
                ["Attention", "GQA"],
              ].map(([k, v], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 0",
                  borderTop: i > 0 ? `1px solid ${isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.035)"}` : "none",
                }}>
                  <span style={{
                    fontSize: 10.5, color: C.txtSoft, fontFamily: "'Inter',sans-serif", fontWeight: 440,
                  }}>{k}</span>
                  <span style={{
                    fontSize: 11, color: C.blu, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                    padding: "1px 6px", borderRadius: 4,
                    background: isDark ? "rgba(92,179,255,.04)" : "rgba(0,113,227,.025)",
                  }}>{v}</span>
                </div>
              ))}
              {/* capacity factor sub-card */}
              <div style={{
                marginTop: 10, padding: "10px 12px", borderRadius: 10,
                background: isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)",
                border: `1px solid ${isDark ? "rgba(100,160,255,.08)" : "rgba(0,0,0,.04)"}`,
              }}>
                <div style={{
                  fontSize: 8.5, fontWeight: 620, color: C.txtSoft, marginBottom: 6,
                  fontFamily: "'Inter',sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" as const,
                }}>Capacity Factor</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["4.0", "layers 1–2"], ["2.0", "layers 5+"]].map(([val, label], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{
                        color: C.blu, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
                      }}>{val}</span>
                      <span style={{ color: C.txtMuted, fontSize: 9.5, fontFamily: "'Inter',sans-serif" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

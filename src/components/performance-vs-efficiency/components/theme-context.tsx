import { useMemo } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { useIsMobile } from "./use-mobile";

export type Theme = "dark" | "light";

/* ── Semantic tokens for dark & light ── */
export interface ThemeTokens {
  bg: string;
  bloomA: string;
  bloomB: string;
  bloomC: string;
  bloomD: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardInset: string;
  cardHover: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipShadow: string;
  tooltipTitle: string;
  tooltipSub: string;
  tooltipDivider: string;
  tooltipLabel: string;
  tooltipValue: string;
  tooltipAccentBar: string;
  gridStroke: string;
  axisStroke: string;
  tickFill: string;
  labelFill: string;
  refLineStroke: string;
  quadrantA: string;
  quadrantB: string;
  quadrantLabelA: string;
  quadrantLabelB: string;
  heading: string;
  headingFade: string;
  subtitle: string;
  tagline: string;
  statLabel: string;
  statValue: string;
  statSub: string;
  legendDot: number;
  legendText: string;
  sizeLegendText: string;
  footnote: string;
  toggleBg: string;
  toggleBorder: string;
  toggleColor: string;
  chartTitle: string;
  chartSub: string;
  xLabelFill: string;
  yLabelFill: string;
  bubbleGlowOpacity: number;
  bubbleShadowOpacity: string;
  bubbleCrescentOpacity: number;
  catchlightOpacity: number;
  arcStroke: string;
  divider: string;
  sectionKicker: string;
  /* noise & grain */
  noiseOpacity: number;
  /* section divider decoration */
  sectionDividerA: string;
  sectionDividerB: string;
}

const dark: ThemeTokens = {
  bg: "#030308",
  bloomA: "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(79,124,255,0.05) 0%, transparent 60%)",
  bloomB: "radial-gradient(ellipse 70% 50% at 90% 80%, rgba(79,124,255,0.03) 0%, transparent 55%)",
  bloomC: "radial-gradient(ellipse 90% 40% at 50% 40%, rgba(79,124,255,0.02) 0%, transparent 55%)",
  bloomD: "radial-gradient(ellipse 60% 40% at 70% 10%, rgba(79,124,255,0.015) 0%, transparent 50%)",
  cardBg: "rgba(8,8,16,0.7)",
  cardBorder: "rgba(79,124,255,0.06)",
  cardShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 32px -4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",
  cardInset: "blur(24px) saturate(1.2)",
  cardHover: "rgba(79,124,255,0.04)",
  panelBg: "rgba(8,8,16,0.7)",
  panelBorder: "rgba(79,124,255,0.04)",
  panelShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 24px 80px -16px rgba(0,0,0,0.5)",
  tooltipBg: "rgba(3,3,8,0.95)",
  tooltipBorder: "rgba(79,124,255,0.08)",
  tooltipShadow: "0 16px 48px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
  tooltipTitle: "rgba(255,255,255,0.95)",
  tooltipSub: "rgba(255,255,255,0.55)",
  tooltipDivider: "rgba(79,124,255,0.06)",
  tooltipLabel: "rgba(255,255,255,0.40)",
  tooltipValue: "rgba(255,255,255,0.90)",
  tooltipAccentBar: "rgba(79,124,255,0.06)",
  gridStroke: "rgba(79,124,255,0.04)",
  axisStroke: "rgba(79,124,255,0.08)",
  tickFill: "rgba(255,255,255,0.50)",
  labelFill: "rgba(255,255,255,0.40)",
  refLineStroke: "rgba(79,124,255,0.12)",
  quadrantA: "rgba(52,211,153,0.015)",
  quadrantB: "rgba(251,146,60,0.008)",
  quadrantLabelA: "rgba(52,211,153,0.10)",
  quadrantLabelB: "rgba(251,146,60,0.08)",
  heading: "rgba(255,255,255,0.95)",
  headingFade: "rgba(255,255,255,0.45)",
  subtitle: "rgba(255,255,255,0.50)",
  tagline: "rgba(255,255,255,0.55)",
  statLabel: "rgba(255,255,255,0.40)",
  statValue: "rgba(255,255,255,0.92)",
  statSub: "rgba(255,255,255,0.45)",
  legendDot: 0.75,
  legendText: "rgba(255,255,255,0.48)",
  sizeLegendText: "rgba(255,255,255,0.35)",
  footnote: "rgba(255,255,255,0.35)",
  toggleBg: "rgba(79,124,255,0.04)",
  toggleBorder: "rgba(79,124,255,0.08)",
  toggleColor: "rgba(255,255,255,0.50)",
  chartTitle: "rgba(255,255,255,0.88)",
  chartSub: "rgba(255,255,255,0.48)",
  xLabelFill: "rgba(79,124,255,0.50)",
  yLabelFill: "rgba(52,211,153,0.50)",
  bubbleGlowOpacity: 0.12,
  bubbleShadowOpacity: "0.4",
  bubbleCrescentOpacity: 0.35,
  catchlightOpacity: 0.9,
  arcStroke: "rgba(79,124,255,0.12)",
  divider: "rgba(79,124,255,0.04)",
  sectionKicker: "rgba(79,124,255,0.35)",
  noiseOpacity: 0.018,
  sectionDividerA: "rgba(79,124,255,0.08)",
  sectionDividerB: "rgba(79,124,255,0.05)",
};

const light: ThemeTokens = {
  bg: "#F5F5F7",
  bloomA: "radial-gradient(ellipse 80% 60% at 10% 20%, rgba(0,102,220,0.05) 0%, transparent 55%)",
  bloomB: "radial-gradient(ellipse 70% 50% at 90% 80%, rgba(147,51,234,0.04) 0%, transparent 50%)",
  bloomC: "radial-gradient(ellipse 90% 40% at 50% 40%, rgba(5,150,105,0.03) 0%, transparent 50%)",
  bloomD: "radial-gradient(ellipse 60% 40% at 70% 10%, rgba(194,65,12,0.025) 0%, transparent 50%)",
  cardBg: "rgba(255,255,255,0.15)",
  cardBorder: "rgba(0,0,0,0.065)",
  cardShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 32px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
  cardInset: "blur(28px) saturate(1.3)", 
  cardHover: "rgba(255,255,255,0.95)",
  panelBg: "rgba(255,255,255,0.78)",
  panelBorder: "rgba(0,0,0,0.065)",
  panelShadow: "0 1px 0 rgba(255,255,255,1) inset, 0 24px 64px -12px rgba(0,0,0,0.08)",
  tooltipBg: "rgba(255,255,255,0.97)",
  tooltipBorder: "rgba(0,0,0,0.065)",
  tooltipShadow: "0 16px 48px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
  tooltipTitle: "rgba(0,0,0,0.92)",
  tooltipSub: "rgba(0,0,0,0.66)",
  tooltipDivider: "rgba(0,0,0,0.055)",
  tooltipLabel: "rgba(0,0,0,0.55)",
  tooltipValue: "rgba(0,0,0,0.85)",
  tooltipAccentBar: "rgba(0,0,0,0.03)",
  gridStroke: "rgba(0,0,0,0.07)",
  axisStroke: "rgba(0,0,0,0.12)",
  tickFill: "rgba(0,0,0,0.62)",
  labelFill: "rgba(0,0,0,0.52)",
  refLineStroke: "rgba(0,102,220,0.14)",
  quadrantA: "rgba(5,150,105,0.035)",
  quadrantB: "rgba(194,65,12,0.02)",
  quadrantLabelA: "rgba(5,150,105,0.2)",
  quadrantLabelB: "rgba(194,65,12,0.16)",
  heading: "rgba(0,0,0,0.93)",
  headingFade: "rgba(0,0,0,0.48)",
  subtitle: "rgba(0,0,0,0.62)",
  tagline: "rgba(0,0,0,0.64)",
  statLabel: "rgba(0,0,0,0.58)",
  statValue: "rgba(0,0,0,0.9)",
  statSub: "rgba(0,0,0,0.56)",
  legendDot: 0.95,
  legendText: "rgba(0,0,0,0.6)",
  sizeLegendText: "rgba(0,0,0,0.5)",
  footnote: "rgba(0,0,0,0.46)",
  toggleBg: "rgba(0,0,0,0.035)",
  toggleBorder: "rgba(0,0,0,0.08)",
  toggleColor: "rgba(0,0,0,0.52)",
  chartTitle: "rgba(0,0,0,0.87)",
  chartSub: "rgba(0,0,0,0.6)",
  xLabelFill: "rgba(79,70,229,0.68)",
  yLabelFill: "rgba(6,150,110,0.68)",
  bubbleGlowOpacity: 0.18,
  bubbleShadowOpacity: "0.2",
  bubbleCrescentOpacity: 0.2,
  catchlightOpacity: 1,
  arcStroke: "rgba(255,255,255,0.5)",
  divider: "rgba(0,0,0,0.055)",
  sectionKicker: "rgba(0,0,0,0.42)",
  noiseOpacity: 0.012,
  sectionDividerA: "rgba(0,102,220,0.12)",
  sectionDividerB: "rgba(147,51,234,0.08)",
};

export const tokens = { dark, light };

export function useTheme(): { theme: Theme; t: ThemeTokens; toggle: () => void } {
  const { resolvedTheme, setTheme } = useNextTheme();
  const mob = useIsMobile();
  const theme: Theme = resolvedTheme === "light" ? "light" : "dark";
  const baseTokens = tokens[theme];

  const t = useMemo(() => {
    if (!mob) return baseTokens;

    if (theme === "dark") {
      return {
        ...baseTokens,
        cardBg: "#060610",
        panelBg: "#060610",
        tooltipBg: "#050510",
        toggleBg: "#080818",
        cardInset: "none",
      };
    }

    return {
      ...baseTokens,
      cardBg: "#ffffff",
      panelBg: "#ffffff",
      tooltipBg: "#ffffff",
      toggleBg: "#f3f5f8",
      cardInset: "none",
    };
  }, [baseTokens, mob, theme]);

  return useMemo(
    () => ({
      theme,
      t,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [setTheme, t, theme],
  );
}
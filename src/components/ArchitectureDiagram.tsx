"use client";

import { motion } from "framer-motion";

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

const L = "rgba(79,124,255,0.25)";      // line
const LB = "rgba(79,124,255,0.45)";     // line bright
const F = "rgba(79,124,255,0.04)";      // fill
const FA = "rgba(79,124,255,0.08)";     // fill accent
const T = "rgba(255,255,255,0.75)";     // text
const TD = "rgba(255,255,255,0.45)";    // text dim
const TA = "rgba(79,124,255,0.70)";     // text accent
const GR = "rgba(52,211,153,0.50)";     // green
const GO = "rgba(255,208,74,0.50)";     // gold
const FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";

function Box({ x, y, w, h, label, accent, fs }: {
  x: number; y: number; w: number; h: number; label: string; accent?: boolean; fs?: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5}
        fill={accent ? FA : F} stroke={accent ? LB : L} strokeWidth={accent ? 1.2 : 0.7} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle"
        fill={accent ? TA : T} fontSize={fs || 9} fontFamily={FONT} fontWeight={accent ? 500 : 400}>
        {label}
      </text>
    </g>
  );
}

function Arr({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const tipX = x2, tipY = y2;
  const baseX = tipX - ux * 6, baseY = tipY - uy * 6;
  const px = -uy * 3, py = ux * 3;
  return (
    <g>
      <line x1={x1} y1={y1} x2={baseX} y2={baseY} stroke={L} strokeWidth={0.7} />
      <polygon points={`${tipX},${tipY} ${baseX + px},${baseY + py} ${baseX - px},${baseY - py}`} fill={L} />
    </g>
  );
}

function Dash({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={TA} strokeWidth={0.6} strokeDasharray="4 3" />;
}

function Plus({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={F} stroke={L} strokeWidth={0.7} />
      <text x={x} y={y + 4} textAnchor="middle" fill={TA} fontSize={13} fontFamily="monospace">+</text>
    </g>
  );
}

function Lbl({ x, y, text, color, size, anchor }: { x: number; y: number; text: string; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
  return <text x={x} y={y} fill={color || TD} fontSize={size || 8} fontFamily={FONT} fontWeight={400} letterSpacing="0.05em" textAnchor={anchor}>{text}</text>;
}

export default function ArchitectureDiagram() {
  // Layout
  const cx = 150; // center x of main block
  const bw = 150; // block width
  const bx = cx - bw / 2; // block left
  const moeX = 370; // MoE detail panel left

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: EASE_OUT }}
    >
      <div className="mb-8 sm:mb-10">
        <div className="mb-3 text-[9px] sm:text-[10px] tracking-[0.35em] font-light text-[rgba(79,124,255,0.25)]">
          f(x) = Σ Eᵢ(x) · gᵢ(x)
        </div>
        <h3 className="text-2xl sm:text-3xl font-extralight tracking-[0.08em] text-gray-900 dark:text-white"
          style={{ textShadow: "0 0 30px rgba(79,124,255,0.08)" }}>
          Architecture
        </h3>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-8 h-px bg-[rgba(79,124,255,0.15)]" />
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[rgba(255,255,255,0.3)] tracking-[0.15em] font-light">
            Sparse MoE Diffusion Transformer
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 590 660" className="w-full max-w-[590px] mx-auto"
          style={{ filter: "drop-shadow(0 0 20px rgba(79,124,255,0.04))" }}>

          {/* ═══ OUTPUT ═══ */}
          <Box x={bx} y={10} w={bw} h={26} label="Denoised latents" />
          <Arr x1={cx} y1={36} x2={cx} y2={55} />

          <Box x={bx} y={55} w={bw} h={26} label="Linear output proj" />
          <Arr x1={cx} y1={81} x2={cx} y2={100} />

          <Box x={bx} y={100} w={bw} h={26} label="AdaLayerNorm" />
          <Arr x1={cx} y1={126} x2={cx} y2={148} />

          {/* ═══ MAIN TRANSFORMER BLOCK ═══ */}
          {/* Outer container */}
          <rect x={20} y={148} width={260} height={370} rx={10}
            fill="rgba(79,124,255,0.015)" stroke={L} strokeWidth={0.5} />

          {/* Inner green region → blue themed */}
          <rect x={bx - 10} y={160} width={bw + 20} height={335} rx={8}
            fill="rgba(79,124,255,0.035)" stroke={LB} strokeWidth={0.6} />

          {/* ×32 label */}
          <Lbl x={bx + bw + 18} y={505} text="32 ×" color={GO} size={11} />

          {/* Top + residual */}
          <Plus x={cx} y={175} />
          <Arr x1={cx} y1={184} x2={cx} y2={203} />

          {/* MoE */}
          <Box x={bx} y={203} w={bw} h={28} label="MoE" accent />
          <Arr x1={cx} y1={231} x2={cx} y2={250} />

          {/* Modulation */}
          <Box x={bx} y={250} w={bw} h={26} label="Modulation" />
          <Arr x1={cx} y1={276} x2={cx} y2={295} />

          {/* RMSNorm 2 */}
          <Box x={bx} y={295} w={bw} h={26} label="RMSNorm 2" />
          <Arr x1={cx} y1={321} x2={cx} y2={340} />

          {/* Bottom + residual */}
          <Plus x={cx} y={350} />
          <Arr x1={cx} y1={359} x2={cx} y2={378} />

          {/* Grouped-Query Attention */}
          <Box x={bx} y={378} w={bw} h={30} label="Grouped–Query Attention" accent fs={8} />
          <Arr x1={cx} y1={408} x2={cx} y2={427} />

          {/* Modulation */}
          <Box x={bx} y={427} w={bw} h={26} label="Modulation" />
          <Arr x1={cx} y1={453} x2={cx} y2={472} />

          {/* RMSNorm 1 */}
          <Box x={bx} y={472} w={bw} h={26} label="RMSNorm 1" />

          {/* ═══ INPUTS ═══ */}
          {/* Noisy latents */}
          <Arr x1={cx} y1={498} x2={cx} y2={530} />
          <Box x={bx} y={530} w={bw} h={28} label="Noisy latents" />

          {/* Condition → RMSNorm → Cross Attn arrow */}
          <Box x={5} y={580} w={90} h={28} label="Condition" />
          <Arr x1={50} y1={580} x2={50} y2={545} />
          <Box x={5} y={520} w={90} h={28} label="RMSNorm" />
          <Lbl x={7} y={515} text="Cross" color={TD} />
          <Lbl x={7} y={505} text="Attn" color={TD} />
          <Arr x1={95} y1={534} x2={bx} y2={393} />

          {/* ═══ MOE DETAIL PANEL ═══ */}
          <rect x={moeX - 15} y={155} width={225} height={280} rx={10}
            fill="rgba(79,124,255,0.015)" stroke={L} strokeWidth={0.5} strokeDasharray="5 3" />
          <Lbl x={moeX + 30} y={175} text="Expert-Choice MoE" color={TA} size={10} />

          {/* Dashed connection from MoE block */}
          <Dash x1={bx + bw} y1={217} x2={moeX - 15} y2={230} />

          {/* Bottom inputs: x, Unmodulated x, Timestep */}
          <Box x={moeX - 5} y={395} w={45} h={22} label="x" fs={8} />
          <Box x={moeX + 55} y={395} w={90} h={22} label="Unmodulated x" fs={7} />
          <Box x={moeX + 160} y={395} w={55} h={22} label="Timestep" fs={7} />

          {/* Unmod x + Timestep → Router */}
          <Arr x1={moeX + 100} y1={395} x2={moeX + 100} y2={370} />
          <Arr x1={moeX + 187} y1={395} x2={moeX + 140} y2={370} />

          {/* Router */}
          <Box x={moeX + 50} y={345} w={110} h={26} label="Router" />

          {/* Router → Experts */}
          <Arr x1={moeX + 105} y1={345} x2={moeX + 105} y2={315} />
          <Arr x1={moeX + 105} y1={325} x2={moeX + 155} y2={315} />
          <Arr x1={moeX + 105} y1={325} x2={moeX + 55} y2={315} />

          {/* Expert blocks */}
          <Box x={moeX + 30} y={290} w={55} h={24} label="Expert 1" fs={7} />
          <Lbl x={moeX + 95} y={306} text=". . ." color={TD} size={10} />
          <Box x={moeX + 120} y={290} w={65} h={24} label="Expert 64" fs={7} />

          {/* x → Shared Expert (direct, bypasses router) */}
          <Arr x1={moeX + 17} y1={395} x2={moeX + 17} y2={315} />
          <Box x={moeX - 15} y={290} w={65} h={24} label="Shared Exp." fs={7} />

          {/* All experts → Plus */}
          <Arr x1={moeX + 17} y1={290} x2={moeX + 95} y2={255} />
          <Arr x1={moeX + 57} y1={290} x2={moeX + 95} y2={255} />
          <Arr x1={moeX + 152} y1={290} x2={moeX + 95} y2={255} />

          <Plus x={moeX + 95} y={245} />

          {/* Output arrow */}
          <Arr x1={moeX + 95} y1={236} x2={moeX + 95} y2={200} />
          <Lbl x={moeX + 55} y={195} text="MoE output" color={GR} size={9} />

          {/* ═══ MODEL DETAILS ═══ */}
          <rect x={moeX - 5} y={440} width={210} height={120} rx={8}
            fill={F} stroke={L} strokeWidth={0.5} />

          <text x={moeX + 10} y={460} fill={T} fontSize={10} fontFamily={FONT} fontWeight={500}>
            Model Details
          </text>
          <line x1={moeX + 10} y1={466} x2={moeX + 190} y2={466} stroke={L} strokeWidth={0.3} />

          <text x={moeX + 10} y={484} fill={TD} fontSize={8.5} fontFamily={FONT}>
            Model Size: <tspan fill={TA}>17B</tspan>
          </text>
          <text x={moeX + 10} y={498} fill={TD} fontSize={8.5} fontFamily={FONT}>
            Active params: <tspan fill={GR}>2B</tspan>
          </text>
          <text x={moeX + 10} y={512} fill={TD} fontSize={8.5} fontFamily={FONT}>
            Capacity factor: <tspan fill={T}>4.0</tspan> first 2 MoE layers
          </text>
          <text x={moeX + 10} y={524} fill={TD} fontSize={8.5} fontFamily={FONT}>
            {'                                '}<tspan fill={T}>2.0</tspan> for layers 5+
          </text>
          <text x={moeX + 10} y={540} fill={TD} fontSize={8.5} fontFamily={FONT}>
            Experts: <tspan fill={T}>64 routed + 1 shared</tspan>
          </text>
          <text x={moeX + 10} y={554} fill={TD} fontSize={8.5} fontFamily={FONT}>
            Blocks: <tspan fill={T}>32 × transformer</tspan>
          </text>

          {/* ═══ FIRST 3 BLOCKS NOTE ═══ */}
          <text x={moeX - 5} y={585} fill={TD} fontSize={8} fontFamily={FONT}>
            First <tspan fill={TA}>3</tspan> blocks use dense FFN with
          </text>
          <text x={moeX - 5} y={597} fill={TD} fontSize={8} fontFamily={FONT}>
            hidden size of <tspan fill={GO}>2,048</tspan> instead of MoE
          </text>

        </svg>
      </div>
    </motion.div>
  );
}

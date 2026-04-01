"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getIntroPlayed } from "./IntroOverlay";
import { getAudioState } from "@/lib/audioReactive";

const PHI = 1.6180339887;
const TAU = Math.PI * 2;

// Pure math & computation symbols
const AI_SYMBOLS = [
    // Calculus & optimization
    "∇", "∂", "∫", "Σ", "∏", "lim",
    // Greek (variables & parameters)
    "θ", "σ", "λ", "α", "β", "γ", "ε", "μ", "η", "ω", "ζ", "τ", "ρ", "φ", "π", "δ",
    // Operators
    "⊗", "⊕", "⊙", "⟨·⟩", "×",
    // Probability & statistics
    "𝔼", "ℙ", "ℋ", "𝒟", "ℒ",
    // Set theory & logic
    "∀", "∃", "∈", "⊂", "∅", "¬", "∧", "∨",
    // Relations
    "≈", "≡", "∝", "≠", "≤", "≥", "≪", "≫",
    // Arrows & limits
    "∞", "→", "↦", "⇒", "⇔",
    // Special
    "Ω", "Δ", "Φ", "Ψ", "Γ", "Λ",
];
// Mathematical expressions (no buzzwords — pure notation)
const AI_WORDS = [
    // Functions
    "f(x)", "g(x)", "p(x)", "q(z)", "h(θ)",
    // Operations
    "∇L", "∇f", "W·x", "xᵀ", "AᵀA", "A⁻¹",
    // Norms & distances
    "‖x‖₂", "‖∇f‖", "d(x,y)",
    // Derivatives
    "∂f/∂x", "∂L/∂θ", "dy/dx",
    // Expressions
    "Σᵢ xᵢ", "∏ᵢ pᵢ", "∫ f dx",
    // Matrix notation
    "det(A)", "tr(A)", "rank",
    // Probability
    "P(A|B)", "𝔼[X]", "Var(X)",
    // Activation / transforms
    "σ(z)", "log(p)", "exp(x)", "max(0,x)",
    // Convergence
    "ε → 0", "n → ∞", "Δt",
];

function rF(min: number, max: number, d: number) { return (min + Math.random() * (max - min)).toFixed(d); }

// ── Orbit ring definitions: each ring is a category of AI computation ──
interface OrbitRing {
    label: string;
    radiusX: number; // ellipse width (fraction of screen)
    radiusY: number; // ellipse height
    speed: number;    // radians per second (negative = clockwise)
    tilt: number;     // rotation of the ellipse itself
    count: number;    // how many equations on this ring
    category: string;
    genText: () => string;
    color: { dark: string; light: string };
}

const ORBIT_RINGS: OrbitRing[] = [
    {
        label: "attention",
        radiusX: 0.52, radiusY: 0.46,
        speed: 0.03, tilt: -0.15,
        count: 8,
        category: "attention",
        genText: () => [
            `Q·Kᵀ/√${[64,128,256][Math.floor(Math.random()*3)]} → attn`,
            `head_${Math.floor(Math.random()*12)}: softmax(${rF(0,1,3)})`,
            `MultiHead(Q,K,V) = Concat·Wᴼ`,
            `Attn(Q,K,V) = softmax(QKᵀ/√d)V`,
            `pos_embed[${Math.floor(Math.random()*512)}] = sin(p/10000^(2i/d))`,
            `causal_mask: triu(−∞)  →  autoregressive`,
            `flash_attn: O(N) memory  ✓`,
            `KV_cache[${Math.floor(Math.random()*32)}]: ${rF(0,1,3)}`,
        ][Math.floor(Math.random() * 8)],
        color: { dark: "170, 150, 255", light: "80, 50, 180" },
    },
    {
        label: "forward",
        radiusX: 0.44, radiusY: 0.38,
        speed: -0.04, tilt: 0.1,
        count: 7,
        category: "forward",
        genText: () => [
            `z = W·x + b = ${rF(-2,2,4)}`,
            `h = σ(${rF(-2,2,3)}) = ${rF(0,1,4)}`,
            `ŷ = softmax([${rF(-2,2,1)}, ${rF(-2,2,1)}, ${rF(-2,2,1)}])`,
            `LayerNorm(x): μ=${rF(-1,1,3)} σ=${rF(0.1,2,3)}`,
            `FFN(x) = GELU(xW₁+b₁)W₂+b₂`,
            `residual: x + Sublayer(x)`,
            `dropout(p=0.1): ${Math.random() < 0.5 ? "active" : "eval_mode"}`,
        ][Math.floor(Math.random() * 7)],
        color: { dark: "130, 200, 255", light: "30, 80, 160" },
    },
    {
        label: "optimization",
        radiusX: 0.58, radiusY: 0.50,
        speed: 0.02, tilt: 0.2,
        count: 8,
        category: "optim",
        genText: () => [
            `θ ← θ − α·∇ℒ(θ)   α=${rF(0.0001,0.01,5)}`,
            `Adam: m̂/(√v̂+ε)  β₁=0.9  β₂=0.999`,
            `‖∇ℒ‖₂ = ${rF(0.01,3,4)}  → ${parseFloat(rF(0.01,3,4)) < 1 ? "converging" : "training"}`,
            `lr_schedule: cosine_decay(${rF(0.0001,0.001,5)})`,
            `grad_clip: max_norm=${rF(0.5,2,1)}  ✓`,
            `warmup: ${Math.floor(Math.random()*2000+500)} steps → peak`,
        ][Math.floor(Math.random() * 6)],
        color: { dark: "130, 255, 170", light: "20, 120, 60" },
    },
    {
        label: "loss",
        radiusX: 0.36, radiusY: 0.30,
        speed: -0.05, tilt: -0.08,
        count: 6,
        category: "loss",
        genText: () => [
            `ℒ = −Σ yᵢ·log(ŷᵢ) = ${rF(0.001,1.5,6)}`,
            `epoch ${Math.floor(Math.random()*500)}: loss↓ ${rF(0.001,0.5,5)}`,
            `perplexity = e^ℒ = ${rF(1,20,2)}`,
            `KL(p‖q) = ${rF(0,0.5,5)}  ↓`,
            `val_loss: ${rF(0.01,0.8,5)} (no overfit ✓)`,
        ][Math.floor(Math.random() * 5)],
        color: { dark: "255, 210, 110", light: "140, 100, 20" },
    },
];

export default function SubtleParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isIntroDone, setIsIntroDone] = useState(() => getIntroPlayed());
    const fadeAppliedRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef(resolvedTheme);

    useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);
    useEffect(() => { if (!isIntroDone) { const h = () => setIsIntroDone(true); window.addEventListener("intro-done", h, { once: true }); return () => window.removeEventListener("intro-done", h); } }, [isIntroDone]);
    useEffect(() => { if (!isIntroDone || !containerRef.current || fadeAppliedRef.current) return; fadeAppliedRef.current = true; const el = containerRef.current; const t = setTimeout(() => { el.style.transition = "opacity 4s cubic-bezier(0.16,1,0.3,1)"; el.style.opacity = "1"; setTimeout(() => { el.style.transition = ""; }, 4100); }, 1500); return () => clearTimeout(t); }, [isIntroDone]);
    useEffect(() => { if (!containerRef.current) return; const el = containerRef.current; const onScroll = () => { const y = window.scrollY || 0; const vh = window.innerHeight || 1; const s = vh * 0.2; const e = vh * 1.5; let f = 1; if (y > s) f = Math.max(0, 1 - (y - s) / (e - s)); if (fadeAppliedRef.current) el.style.opacity = String(f); }; window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const FRAME_INTERVAL = isMobile ? 1000 / 30 : 0;
        let lastFrameTime = 0;
        let mouseX = 0.5, mouseY = 0.5;
        const handleMouseMove = (e: MouseEvent) => { if (!isMobile) { mouseX = e.clientX / window.innerWidth; mouseY = e.clientY / window.innerHeight; } };
        if (!isMobile) window.addEventListener("mousemove", handleMouseMove, { passive: true });

        let w = 0, h = 0;

        // ── Orbiting equation nodes ──
        interface OrbitNode {
            ringIdx: number;
            angleOffset: number; // fixed offset on the ring
            text: string;
            phase: number;
            highlightUntil: number;
        }

        const orbitNodes: OrbitNode[] = [];

        for (let ri = 0; ri < ORBIT_RINGS.length; ri++) {
            const ring = ORBIT_RINGS[ri];
            const count = isMobile ? Math.ceil(ring.count * 0.6) : ring.count;
            for (let i = 0; i < count; i++) {
                orbitNodes.push({
                    ringIdx: ri,
                    angleOffset: (i / count) * TAU + Math.random() * 0.2,
                    text: ring.genText(),
                    phase: Math.random() * TAU,
                    highlightUntil: 0,
                });
            }
        }

        // ── Corner matrix blocks — arranged in bracket patterns ──
        interface CornerBlock {
            lines: string[];
            x: number; y: number; // normalized 0-1
            driftPhase: number;
        }

        const cornerBlocks: CornerBlock[] = [];
        const genMatrix = (rows: number, cols: number): string[] => {
            const lines: string[] = [];
            for (let r = 0; r < rows; r++) {
                const bl = r === 0 ? "⌈" : r === rows - 1 ? "⌊" : "│";
                const br = r === 0 ? "⌉" : r === rows - 1 ? "⌋" : "│";
                lines.push(`${bl} ${Array.from({ length: cols }, () => rF(-1, 1, 2).padStart(6)).join(" ")} ${br}`);
            }
            return lines;
        };

        if (!isMobile) {
            // Top-left: weight matrix
            cornerBlocks.push({ lines: ["W_q (query weights):", ...genMatrix(3, 4)], x: 0.02, y: 0.03, driftPhase: 0 });
            // Top-right: key matrix
            cornerBlocks.push({ lines: ["K (key matrix):", ...genMatrix(3, 4)], x: 0.98, y: 0.03, driftPhase: 1.5 });
            // Bottom-left: gradient matrix
            cornerBlocks.push({ lines: ["∇W (gradients):", ...genMatrix(3, 3)], x: 0.02, y: 0.84, driftPhase: 3.0 });
            // Bottom-right: output
            cornerBlocks.push({ lines: ["V·attn (values):", ...genMatrix(3, 3)], x: 0.98, y: 0.84, driftPhase: 4.5 });
        } else {
            cornerBlocks.push({ lines: ["W_q:", ...genMatrix(2, 3)], x: 0.02, y: 0.04, driftPhase: 0 });
            cornerBlocks.push({ lines: ["∇W:", ...genMatrix(2, 3)], x: 0.98, y: 0.82, driftPhase: 2 });
        }

        // ── Fibonacci spiral — AI symbols and keywords ──
        interface SpiralChar { index: number; baseAngle: number; baseRadius: number; char: string; fontSize: number; baseOpacity: number; phase: number; isAccent: boolean; isWord: boolean; }
        const spiralCount = isMobile ? 100 : 220;
        const spiralChars: SpiralChar[] = [];
        for (let i = 0; i < spiralCount; i++) {
            const goldenAngle = i * TAU / (PHI * PHI);
            const radius = 90 + Math.sqrt(i) * (isMobile ? 26 : 20);
            // 30% are AI keywords, 70% are single symbols
            const isWord = Math.random() < 0.30;
            const char = isWord
                ? AI_WORDS[Math.floor(Math.random() * AI_WORDS.length)]
                : AI_SYMBOLS[Math.floor(Math.random() * AI_SYMBOLS.length)];
            const distFactor = Math.min(1, radius / 550);
            // Words are slightly smaller so they fit; symbols can be larger
            const fontSize = isWord
                ? (isMobile ? 6 : 8) + (1 - distFactor) * (isMobile ? 4 : 7)
                : (isMobile ? 9 : 11) + (1 - distFactor) * (isMobile ? 8 : 12);
            spiralChars.push({
                index: i, baseAngle: goldenAngle, baseRadius: radius, char, fontSize,
                baseOpacity: 0.08 + (1 - distFactor) * 0.18,
                phase: i * 0.15,
                isAccent: Math.random() < 0.25, // more accent blue for AI feel
                isWord,
            });
        }

        // ── Shooting stars ──
        interface NaturalStar { x: number; y: number; angle: number; speed: number; tailLength: number; life: number; maxLife: number; brightness: number; width: number; }
        const naturalStars: NaturalStar[] = [];
        let nextStarTime = 5000 + Math.random() * 8000;
        const spawnStar = () => { if (naturalStars.length >= 1) return; naturalStars.push({ x: 0.15 + Math.random() * 0.7, y: -0.02 - Math.random() * 0.05, angle: Math.PI * 0.52 + (Math.random() - 0.5) * 0.3, speed: 0.012 + Math.random() * 0.008, tailLength: (80 + Math.random() * 120) * dpr, life: 0, maxLife: 30 + Math.random() * 20, brightness: 0.5 + Math.random() * 0.5, width: (0.4 + Math.random() * 0.6) * dpr }); };

        const resize = () => { w = Math.max(1, Math.floor(container.clientWidth * dpr)); h = Math.max(1, Math.floor(container.clientHeight * dpr)); canvas.width = w; canvas.height = h; };
        resize();

        // Cascade refresh for orbit nodes
        let lastCascade = 0;

        // Periodically refresh corner matrix values
        let lastMatrixRefresh = 0;

        let animId = 0, isVisible = true, isWindowFocused = true;

        const render = (now: number) => {
            if (!isVisible || document.hidden || !isWindowFocused) return;
            animId = requestAnimationFrame(render);
            if (FRAME_INTERVAL > 0) { const elapsed = now - lastFrameTime; if (elapsed < FRAME_INTERVAL) return; lastFrameTime = now - (elapsed % FRAME_INTERVAL); }

            const isDark = themeRef.current === "dark";
            const time = now * 0.001;
            ctx.clearRect(0, 0, w, h);

            const cx = w * 0.5, cy = h * 0.48;
            const mx = (mouseX - 0.5) * 2, my = (mouseY - 0.5) * 2;

            // ── Audio reactivity — smoothed so nothing jerks ──
            const audio = getAudioState();
            // NO speed changes from audio — orbits stay at constant smooth speed
            const orbitSpeedMult = 1;
            // Only brightness responds to music, and very gently
            const brightnessBoost = audio.isPlaying ? audio.amplitude * 0.06 : 0;
            const spiralPulse = audio.isPlaying ? audio.bass * 0.02 : 0;

            // Cascade: every 1.5s refresh a node and mark neighbors for staggered update
            if (now - lastCascade > 1500) {
                lastCascade = now;
                const idx = Math.floor(Math.random() * orbitNodes.length);
                const node = orbitNodes[idx];
                const ring = ORBIT_RINGS[node.ringIdx];
                node.text = ring.genText();
                node.highlightUntil = now + 1000;
                // Queue neighbors for staggered cascade (no setTimeout — frame-based)
                for (const n of orbitNodes) {
                    if (n !== node && n.ringIdx === node.ringIdx && Math.random() < 0.4) {
                        n.highlightUntil = now + 600 + Math.random() * 400; // stagger via future highlight
                        n.text = ORBIT_RINGS[n.ringIdx].genText();
                    }
                }
            }

            // Refresh corner matrices every 4s
            if (now - lastMatrixRefresh > 4000) {
                lastMatrixRefresh = now;
                const blockIdx = Math.floor(Math.random() * cornerBlocks.length);
                const block = cornerBlocks[blockIdx];
                const label = block.lines[0];
                const matSize = block.lines.length - 1;
                block.lines = [label, ...genMatrix(matSize, matSize + 1)];
            }

            // ── Layer 1: Orbit ring paths (faint ellipses) ──
            for (const ring of ORBIT_RINGS) {
                const rx = ring.radiusX * w * 0.5;
                const ry = ring.radiusY * h * 0.5;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(ring.tilt);

                // Draw faint orbit path
                ctx.beginPath();
                ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
                ctx.strokeStyle = isDark ? `rgba(255,255,255,0.05)` : `rgba(0,0,0,0.03)`;
                ctx.lineWidth = 0.5 * dpr;
                ctx.setLineDash([4 * dpr, 8 * dpr]);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.restore();
            }

            // ── Layer 2: Orbiting equation nodes ──
            const orbitFontSize = (isMobile ? 7 : 9) * dpr;
            ctx.font = `400 ${orbitFontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            ctx.textBaseline = "middle";

            for (const node of orbitNodes) {
                const ring = ORBIT_RINGS[node.ringIdx];
                const rx = ring.radiusX * w * 0.5;
                const ry = ring.radiusY * h * 0.5;

                // Constant smooth orbit — no audio speed changes
                const angle = node.angleOffset + time * ring.speed;
                const tilt = ring.tilt; // fixed tilt, no rotation over time

                // Position on tilted ellipse
                const ex = Math.cos(angle) * rx;
                const ey = Math.sin(angle) * ry;
                const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
                const y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);

                // Mouse parallax
                const px = x + mx * 8 * dpr;
                const py = y + my * 8 * dpr;

                // Opacity: clearly visible on sides, fade only when crossing near center
                const sideVisibility = Math.abs(Math.sin(angle));
                const distFromCenter = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
                const centerClearance = Math.min(1, Math.max(0, (distFromCenter - w * 0.15) / (w * 0.10)));
                let opacity = (0.15 + sideVisibility * 0.20) * centerClearance;

                // Highlight flash (subtle)
                const isHL = now < node.highlightUntil;
                if (isHL) {
                    const hlProg = (node.highlightUntil - now) / 1000;
                    opacity = Math.min(0.40, opacity + hlProg * 0.15);
                }

                // Very slow opacity breathing + music brightness
                opacity += Math.sin(time * 0.2 + node.phase) * 0.02 + brightnessBoost;

                if (opacity < 0.02) continue;

                const rgb = isDark ? ring.color.dark : ring.color.light;

                // Align text to face outward from center
                const textAngle = Math.atan2(py - cy, px - cx);
                const alignRight = Math.abs(textAngle) > Math.PI * 0.5;

                ctx.textAlign = alignRight ? "right" : "left";
                ctx.fillStyle = `rgba(${rgb}, ${opacity})`;
                ctx.fillText(node.text, px, py);
            }

            // ── Layer 3: Corner matrix blocks ──
            const cornerFontSize = (isMobile ? 8 : 10) * dpr;
            ctx.font = `400 ${cornerFontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            ctx.textBaseline = "top";

            for (const block of cornerBlocks) {
                const isRight = block.x > 0.5;
                ctx.textAlign = isRight ? "right" : "left";

                // Gentle floating drift
                const driftX = Math.sin(time * 0.15 + block.driftPhase) * 3 * dpr;
                const driftY = Math.cos(time * 0.12 + block.driftPhase * 1.3) * 2 * dpr;

                const bx = block.x * w + driftX;
                const by = block.y * h + driftY;
                const lineH = cornerFontSize * 1.5;

                for (let i = 0; i < block.lines.length; i++) {
                    const isLabel = i === 0;
                    const opacity = (isLabel ? 0.28 : 0.22) + brightnessBoost;

                    ctx.fillStyle = isDark
                        ? `rgba(110, 165, 255, ${opacity})`
                        : `rgba(40, 80, 180, ${opacity * 0.7})`;

                    if (isLabel) {
                        ctx.font = `500 ${cornerFontSize * 0.9}px ui-monospace, SFMono-Regular, Menlo, monospace`;
                    } else {
                        ctx.font = `400 ${cornerFontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
                    }

                    ctx.fillText(block.lines[i], bx, by + i * lineH);
                }
            }

            // ── Layer 4: Fibonacci spiral ──
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for (const sc of spiralChars) {
                const wavePhase = time * 0.5 - sc.baseRadius * 0.008 + sc.phase * 0.3;
                const wave = Math.sin(wavePhase) * 0.4 + Math.sin(wavePhase * 0.6 + 1.2) * 0.2;
                const angle = sc.baseAngle + time * 0.015 + Math.sin(time * 0.08 + sc.index * 0.02) * 0.06;
                const r = sc.baseRadius * (1 + wave * 0.08 + spiralPulse) * dpr;
                let x = cx + Math.cos(angle) * r + mx * (1 - Math.min(1, sc.baseRadius / 500)) * 15 * dpr;
                let y = cy + Math.sin(angle) * r + my * (1 - Math.min(1, sc.baseRadius / 500)) * 15 * dpr;
                const opacityWave = 0.5 + wave * 0.5;
                const opacity = sc.baseOpacity * (0.3 + opacityWave * 0.7) + brightnessBoost;
                if (opacity < 0.01) continue;
                ctx.font = `${sc.isWord ? "500" : "normal"} ${sc.fontSize * dpr}px ui-monospace, SFMono-Regular, Menlo, monospace`;
                if (sc.isAccent) {
                    const b = 0.6 + opacityWave * 0.4;
                    ctx.fillStyle = isDark
                        ? `rgba(${Math.round(60+40*b)},${Math.round(100+55*b)},255,${opacity})`
                        : `rgba(40,80,200,${opacity*0.8})`;
                } else {
                    ctx.fillStyle = isDark
                        ? `rgba(200,210,230,${opacity*0.6})`
                        : `rgba(20,30,50,${opacity*0.5})`;
                }
                ctx.fillText(sc.char, x, y);
            }

            // ── Layer 5: Shooting stars ──
            if (now > nextStarTime) { spawnStar(); nextStarTime = now + 6000 + Math.random() * 12000; }
            for (let i = naturalStars.length - 1; i >= 0; i--) {
                const s = naturalStars[i]; s.x += Math.cos(s.angle) * s.speed; s.y += Math.sin(s.angle) * s.speed; s.life++; s.speed *= 0.997;
                if (s.life >= s.maxLife || s.x < -0.1 || s.x > 1.1 || s.y > 1.1) { naturalStars.splice(i, 1); continue; }
                const lr = s.life / s.maxLife; let a = lr < 0.03 ? lr / 0.03 : Math.pow(1 - (lr - 0.03) / 0.97, 1.8); a *= s.brightness;
                const hx = s.x * w, hy = s.y * h; const ct = s.tailLength * Math.min(1, lr * 8) * Math.max(0.2, a); const tx = hx - Math.cos(s.angle) * ct, ty = hy - Math.sin(s.angle) * ct;
                const g = ctx.createLinearGradient(tx, ty, hx, hy);
                if (isDark) { g.addColorStop(0, `rgba(255,255,255,0)`); g.addColorStop(0.6, `rgba(255,255,255,${a*0.08})`); g.addColorStop(0.9, `rgba(255,255,255,${a*0.4})`); g.addColorStop(1, `rgba(255,255,255,${a*0.85})`); }
                else { g.addColorStop(0, `rgba(0,0,0,0)`); g.addColorStop(0.7, `rgba(0,0,0,${a*0.04})`); g.addColorStop(1, `rgba(0,0,0,${a*0.25})`); }
                ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.strokeStyle = g as unknown as string; ctx.lineWidth = s.width; ctx.lineCap = "round"; ctx.stroke();
                if (isDark && a > 0.15) { ctx.beginPath(); ctx.arc(hx, hy, s.width * 0.6, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a*0.9})`; ctx.fill(); }
            }
        };

        if (prefersReduced) { render(0); } else { animId = requestAnimationFrame(render); }
        const observer = new IntersectionObserver((entries) => { entries.forEach((e) => { const was = isVisible; isVisible = e.isIntersecting; if (!was && isVisible && !document.hidden && isWindowFocused) { cancelAnimationFrame(animId); animId = requestAnimationFrame(render); } }); }, { threshold: 0 });
        observer.observe(container);
        const onVisChange = () => { if (document.hidden) { cancelAnimationFrame(animId); return; } if (isVisible && isWindowFocused) { cancelAnimationFrame(animId); animId = requestAnimationFrame(render); } };
        const onBlur = () => { isWindowFocused = false; cancelAnimationFrame(animId); };
        const onFocus = () => { isWindowFocused = true; if (isVisible && !document.hidden) { cancelAnimationFrame(animId); animId = requestAnimationFrame(render); } };
        let resizeTimer = 0;
        const onResize = () => { cancelAnimationFrame(resizeTimer); resizeTimer = requestAnimationFrame(resize); };
        document.addEventListener("visibilitychange", onVisChange); window.addEventListener("blur", onBlur); window.addEventListener("focus", onFocus); window.addEventListener("resize", onResize);
        return () => { cancelAnimationFrame(animId); cancelAnimationFrame(resizeTimer); observer.disconnect(); if (!isMobile) window.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("visibilitychange", onVisChange); window.removeEventListener("blur", onBlur); window.removeEventListener("focus", onFocus); window.removeEventListener("resize", onResize); };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none" style={{ opacity: 0 }}>
            <canvas ref={canvasRef} aria-hidden="true" className="block w-full h-full" style={{ willChange: "transform", transform: "translateZ(0)" }} />
        </div>
    );
}

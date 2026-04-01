"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const RAIN_CHARS = "∇θσ∂Σ∫λαβγεμηφπδΩΔΨΓ∀∃∈≈≡∝≠∞→⇒⊗⊕".split("");
const EXPRESSIONS = ["∂f/∂x", "∇L", "W·x", "xᵀ", "f(x)", "𝔼[X]", "σ(z)", "P(A|B)", "det(A)", "‖x‖₂", "Σᵢ xᵢ", "∫ f dx", "ε→0", "tr(A)", "log p", "∂L/∂θ"];

interface RainColumn {
    x: number;           // normalized 0-1
    chars: string[];
    speed: number;        // fall speed multiplier
    depth: number;        // 0=far, 1=near (affects size, opacity, parallax)
    fontSize: number;
    isAccent: boolean;
    phase: number;        // offset for staggering
}

interface MatrixRainProps {
    /** If true, rain is visible immediately (no scroll-based fade-in) */
    alwaysVisible?: boolean;
}

export default function MatrixRain({ alwaysVisible = false }: MatrixRainProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef(resolvedTheme);

    useEffect(() => setMounted(true), []);
    useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);

    useEffect(() => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const FRAME_INTERVAL = isMobile ? 1000 / 20 : 1000 / 30;
        let lastFrameTime = 0;

        // Build columns with depth layers
        const colCount = isMobile ? 35 : 80;
        const columns: RainColumn[] = [];

        for (let i = 0; i < colCount; i++) {
            const depth = Math.random(); // 0=far, 1=near
            const baseFontSize = isMobile ? 8 : 10;
            const fontSize = baseFontSize + depth * (isMobile ? 5 : 7); // near = bigger

            const charCount = Math.floor(5 + Math.random() * 7 + depth * 5); // near = longer trails
            const chars: string[] = [];
            for (let c = 0; c < charCount; c++) {
                chars.push(
                    Math.random() < 0.18
                        ? EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
                        : RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]
                );
            }

            columns.push({
                x: i / colCount + (Math.random() - 0.5) * (0.8 / colCount),
                chars,
                speed: 0.5 + depth * 1.0, // near = faster
                depth,
                fontSize,
                isAccent: Math.random() < 0.32,
                phase: Math.random() * 1000,
            });
        }

        // Sort by depth so far columns render first (behind near ones)
        columns.sort((a, b) => a.depth - b.depth);

        let w = 0, h = 0;
        let scrollY = 0;
        let smoothScrollY = 0; // smoothed for parallax

        const resize = () => {
            w = Math.floor(window.innerWidth * dpr);
            h = Math.floor(window.innerHeight * dpr);
            canvas.width = w;
            canvas.height = h;
        };
        resize();

        const onScroll = () => { scrollY = window.scrollY || 0; };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        let animId = 0;

        const render = (now: number) => {
            animId = requestAnimationFrame(render);
            if (document.hidden) return;

            const elapsed = now - lastFrameTime;
            if (elapsed < FRAME_INTERVAL) return;
            lastFrameTime = now - (elapsed % FRAME_INTERVAL);

            const isDark = themeRef.current === "dark";
            const time = now * 0.001;

            // Smooth scroll for parallax (lerp toward actual scroll)
            smoothScrollY += (scrollY - smoothScrollY) * 0.1;

            ctx.clearRect(0, 0, w, h);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            const vh = window.innerHeight;
            const scrollProgress = scrollY / vh; // how many viewports scrolled

            // Rain intensity: either always visible or scroll-based fade-in
            const rainIntensity = alwaysVisible
                ? 1
                : Math.min(1, 0.5 + Math.max(0, scrollProgress) * 0.5);
            if (rainIntensity < 0.01) { return; }

            // Scroll-reactive spotlight: chars near viewport center glow brighter
            const viewportCenterY = h * 0.45;

            for (const col of columns) {
                const fSize = col.fontSize * dpr;
                ctx.font = `300 ${fSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
                const lineH = fSize * 1.7;

                // Parallax: deeper columns scroll slower relative to viewport
                const parallaxFactor = 0.3 + col.depth * 0.7; // 0.3 (far) to 1.0 (near)
                const parallaxOffset = smoothScrollY * (1 - parallaxFactor) * dpr;

                // Column X position
                const colX = col.x * w;

                // Fall animation — continuous loop
                const fallSpeed = col.speed * 18 * dpr; // px per second
                const totalTrailH = col.chars.length * lineH;
                const cycleH = h + totalTrailH * 2;
                const baseOffset = ((time + col.phase) * fallSpeed) % cycleH;

                for (let ci = 0; ci < col.chars.length; ci++) {
                    // Y position: falling + parallax offset
                    let charY = baseOffset + ci * lineH - totalTrailH - parallaxOffset;

                    // Wrap to keep on screen
                    charY = ((charY % cycleH) + cycleH) % cycleH - totalTrailH;

                    // Skip if off screen
                    if (charY < -lineH * 2 || charY > h + lineH) continue;

                    // ── Opacity layers ──

                    // 1. Trail fade: head brightest, tail dimmest
                    const isHead = ci === col.chars.length - 1;
                    const trailPos = ci / (col.chars.length - 1 || 1);
                    const trailFade = 0.1 + trailPos * 0.9;

                    // 2. Depth opacity: near columns more visible
                    const depthOpacity = 0.3 + col.depth * 0.7;

                    // 3. Scroll-reactive spotlight: brighter near viewport center
                    const distFromCenter = Math.abs(charY - viewportCenterY) / h;
                    const spotlight = 1 - distFromCenter * 1.2;
                    const spotlightBoost = Math.max(0, spotlight) * 0.4;

                    // 4. Edge fade (top and bottom of viewport)
                    const edgeFadeTop = Math.min(1, charY / (h * 0.15));
                    const edgeFadeBottom = Math.min(1, (h - charY) / (h * 0.15));
                    const edgeFade = Math.max(0, Math.min(edgeFadeTop, edgeFadeBottom));

                    // 5. Twinkle: occasional bright flash
                    const twinkle = Math.sin(time * 1.8 + ci * 7.3 + col.phase * 3) > 0.94 ? 1.5 : 1;

                    // Combine
                    let opacity = trailFade * depthOpacity * edgeFade * rainIntensity * twinkle;
                    opacity = (opacity * 0.28 + spotlightBoost * 0.12);

                    // Head char gets extra brightness
                    if (isHead) opacity *= 1.8;

                    opacity = Math.min(0.6, opacity);
                    if (opacity < 0.006) continue;

                    // ── Color ──
                    if (col.isAccent) {
                        const blue = isHead ? "110, 165, 255" : "79, 124, 255";
                        ctx.fillStyle = `rgba(${blue}, ${opacity})`;
                    } else if (isDark) {
                        const gray = isHead ? "200, 215, 235" : "110, 130, 155";
                        ctx.fillStyle = `rgba(${gray}, ${opacity})`;
                    } else {
                        ctx.fillStyle = `rgba(20, 30, 50, ${opacity * 0.5})`;
                    }

                    ctx.fillText(col.chars[ci], colX, charY);
                }

                // Living data: occasionally swap a char
                if (Math.random() < 0.008) {
                    const idx = Math.floor(Math.random() * col.chars.length);
                    col.chars[idx] = Math.random() < 0.18
                        ? EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]
                        : RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
                }
            }
        };

        if (prefersReduced) {
            render(0);
        } else {
            animId = requestAnimationFrame(render);
        }

        const onVisChange = () => {};
        document.addEventListener("visibilitychange", onVisChange);

        let resizeTimer = 0;
        const onResize = () => { cancelAnimationFrame(resizeTimer); resizeTimer = requestAnimationFrame(resize); };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animId);
            cancelAnimationFrame(resizeTimer);
            document.removeEventListener("visibilitychange", onVisChange);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll);
        };
    }, [mounted]);

    if (!mounted) return null;

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed top-0 left-0 w-full h-full -z-30 pointer-events-none"
            style={{ willChange: "transform", transform: "translateZ(0)" }}
        />
    );
}

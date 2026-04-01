"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { fadeInAudio } from "@/lib/audio";
import { initAudioReactive } from "@/lib/audioReactive";

interface ExtendedWindow extends Window {
    __globalIntroPlayed?: boolean;
}

let globalIntroPlayed = false;

export function setIntroPlayed() {
    globalIntroPlayed = true;
    if (typeof window !== "undefined") {
        (window as ExtendedWindow).__globalIntroPlayed = true;
        window.dispatchEvent(new Event("intro-done"));
    }
}

export function getIntroPlayed(): boolean {
    if (typeof window !== "undefined") {
        return (window as ExtendedWindow).__globalIntroPlayed || false;
    }
    return globalIntroPlayed;
}

// ── Matrix rain column ──
interface MatrixCol {
    x: number;
    chars: string[];
    speed: number;
    offset: number;
    fontSize: number;
    isAccent: boolean;
}

// Math characters for the rain
const RAIN_CHARS = "∇θσ∂Σ∫λαβγεμηφπδΩΔΨΓ∀∃∈⊂≈≡∝≠∞→⇒⊗⊕01".split("");
const EXPRESSIONS = ["∂f/∂x", "∇L", "W·x", "xᵀ", "f(x)", "𝔼[X]", "σ(z)", "P(A|B)", "det(A)", "‖x‖₂", "Σᵢ xᵢ", "∫ f dx", "ε→0", "Ax=λx", "tr(A)", "log p"];

export default function IntroOverlay() {
    const [hasMounted, setHasMounted] = useState(false);
    const [step, setStep] = useState<"showing" | "fading" | "done">("showing");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animIdRef = useRef(0);

    useEffect(() => {
        const t = setTimeout(() => {
            setHasMounted(true);
            if (getIntroPlayed()) setStep("done");
        }, 0);
        return () => clearTimeout(t);
    }, []);

    // ── Matrix rain animation ──
    useEffect(() => {
        if (!hasMounted || step !== "showing") return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        const resize = () => {
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
        };
        resize();
        window.addEventListener("resize", resize);

        // Build columns
        const colCount = isMobile ? 25 : 55;
        const columns: MatrixCol[] = [];

        for (let i = 0; i < colCount; i++) {
            const fontSize = (isMobile ? 11 : 14) + Math.random() * (isMobile ? 4 : 6);
            const charCount = Math.floor(Math.random() * 8) + 4;
            const chars: string[] = [];
            for (let c = 0; c < charCount; c++) {
                // Mix single chars and expressions
                if (Math.random() < 0.2) {
                    chars.push(EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)]);
                } else {
                    chars.push(RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)]);
                }
            }

            columns.push({
                x: (i / colCount) + (Math.random() * 0.5 / colCount),
                chars,
                speed: 0.015 + Math.random() * 0.025,
                offset: Math.random() * 2, // staggered start
                fontSize,
                isAccent: Math.random() < 0.25,
            });
        }

        // Center exclusion zone (where NUCLEUS text is)
        const centerX = 0.5;
        const centerY = 0.42;
        const excludeRadiusX = isMobile ? 0.35 : 0.22;
        const excludeRadiusY = isMobile ? 0.12 : 0.10;

        const render = (now: number) => {
            animIdRef.current = requestAnimationFrame(render);
            const time = now * 0.001;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);
            ctx.textAlign = "center";
            ctx.textBaseline = "top";

            for (const col of columns) {
                const colX = col.x * w;
                const fSize = col.fontSize * dpr;
                ctx.font = `300 ${fSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
                const lineH = fSize * 1.6;

                // Scroll position — continuous downward rain
                const scrollOffset = ((time * col.speed * h * 0.5) + col.offset * h) % (h * 1.5);

                for (let ci = 0; ci < col.chars.length; ci++) {
                    const charY = scrollOffset + ci * lineH - h * 0.3;
                    const normalizedY = charY / h;

                    // Skip chars in the center exclusion zone
                    const dx = (col.x - centerX) / excludeRadiusX;
                    const dy = (normalizedY - centerY) / excludeRadiusY;
                    const inExclusionZone = (dx * dx + dy * dy) < 1;
                    if (inExclusionZone) continue;

                    // Fade near center exclusion zone edge
                    const distFromZone = Math.sqrt(dx * dx + dy * dy);
                    const zoneFade = Math.min(1, Math.max(0, (distFromZone - 1) * 2));

                    // Head char (bottom of column) is brightest
                    const isHead = ci === col.chars.length - 1;
                    const trailFade = isHead ? 1 : 0.15 + (ci / col.chars.length) * 0.5;

                    // Fade at screen edges
                    const edgeFadeY = Math.min(normalizedY * 4, (1 - normalizedY) * 4, 1);
                    const edgeFadeX = Math.min(col.x * 6, (1 - col.x) * 6, 1);

                    // Twinkle: random chars occasionally flash
                    const twinkle = Math.sin(time * 2.5 + ci * 7 + col.x * 100) > 0.92 ? 1.5 : 1;

                    let opacity = trailFade * zoneFade * edgeFadeY * edgeFadeX * twinkle;
                    opacity = Math.min(0.6, opacity * 0.35);

                    if (opacity < 0.01) continue;

                    if (col.isAccent) {
                        if (isHead) {
                            ctx.fillStyle = `rgba(120, 170, 255, ${opacity * 1.8})`;
                        } else {
                            ctx.fillStyle = `rgba(79, 124, 255, ${opacity})`;
                        }
                    } else {
                        if (isHead) {
                            ctx.fillStyle = `rgba(200, 220, 240, ${opacity * 1.5})`;
                        } else {
                            ctx.fillStyle = `rgba(140, 160, 180, ${opacity})`;
                        }
                    }

                    ctx.fillText(col.chars[ci], colX, charY);
                }

                // Periodically swap a random char in the column (living data)
                if (Math.random() < 0.005) {
                    const swapIdx = Math.floor(Math.random() * col.chars.length);
                    if (Math.random() < 0.2) {
                        col.chars[swapIdx] = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
                    } else {
                        col.chars[swapIdx] = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
                    }
                }
            }
        };

        animIdRef.current = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animIdRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [hasMounted, step]);

    const finishIntro = useCallback(() => {
        setStep("fading");
        cancelAnimationFrame(animIdRef.current);
        setTimeout(() => {
            setStep("done");
            setIntroPlayed();
        }, 1200);
    }, []);

    const handleDiscoverClick = () => {
        // Init audio reactive FIRST (must be inside user gesture for AudioContext)
        initAudioReactive();
        fadeInAudio();
        finishIntro();
    };

    if (!hasMounted) {
        return <div className="fixed inset-0 z-[100] bg-black" />;
    }

    if (step === "done") {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#030308] transition-opacity duration-1200
            ${step === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            {/* Matrix rain canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.9 }}
            />

            {/* Radial glow behind center content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-[500px] h-[400px] sm:w-[700px] sm:h-[500px] rounded-full blur-[120px] -translate-y-[8%]"
                    style={{
                        background: "radial-gradient(ellipse, rgba(79,124,255,0.08) 0%, rgba(30,50,120,0.04) 40%, transparent 70%)",
                    }}
                />
            </div>

            {/* Logo */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
                <Image
                    src="/logo.webp"
                    alt="Nucleus Logo"
                    width={80}
                    height={80}
                    className="w-12 h-12 sm:w-16 sm:h-16 invert-0 object-contain opacity-50"
                    style={{ filter: "drop-shadow(0 0 10px rgba(79,124,255,0.25))" }}
                />
            </div>

            {/* Center content */}
            <div className="relative z-10 flex flex-col items-center -translate-y-[8%]">
                {/* Equation above title */}
                <div className="mb-8 text-[rgba(79,124,255,0.3)] text-[10px] sm:text-xs tracking-[0.35em] font-light">
                    ∫ f(x) dx → ∞
                </div>

                {/* NUCLEUS */}
                <h1
                    className="text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-[0.28em] text-white"
                    style={{
                        fontFamily: "var(--font-base)",
                        textShadow: "0 0 40px rgba(79,124,255,0.2), 0 0 80px rgba(79,124,255,0.08)",
                    }}
                >
                    NUCLEUS
                </h1>

                {/* Separator + Subtitle */}
                <div className="mt-5 sm:mt-6 flex flex-col items-center gap-4">
                    <div className="w-12 h-px bg-[rgba(79,124,255,0.15)]" />
                    <p
                        className="text-[11px] sm:text-sm lg:text-base font-light tracking-[0.4em] uppercase text-[rgba(79,124,255,0.55)]"
                        style={{ fontFamily: "var(--font-base)" }}
                    >
                        General Intelligence
                    </p>
                </div>

                {/* Bottom equation */}
                <div className="mt-8 text-[rgba(79,124,255,0.18)] text-[9px] sm:text-[10px] tracking-[0.25em] font-light">
                    ∇ · Φ = ρ
                </div>
            </div>

            {/* Discover button */}
            <button
                type="button"
                onClick={handleDiscoverClick}
                className="fixed bottom-[18vh] left-1/2 -translate-x-1/2 z-[101] cursor-pointer group"
            >
                <div className="relative px-10 py-3.5 rounded-full border border-[rgba(79,124,255,0.3)] bg-[rgba(79,124,255,0.04)] backdrop-blur-sm transition-all duration-500 group-hover:border-[rgba(79,124,255,0.6)] group-hover:bg-[rgba(79,124,255,0.08)] group-hover:shadow-[0_0_40px_rgba(79,124,255,0.15)]">
                    <span className="text-sm sm:text-base tracking-[0.25em] font-light text-[rgba(255,255,255,0.6)] group-hover:text-[rgba(79,124,255,0.9)] transition-colors duration-500">
                        DISCOVER
                    </span>
                </div>
                {/* Subtle pulse ring */}
                <div className="absolute inset-0 rounded-full border border-[rgba(79,124,255,0.15)] animate-[intro-pulse_3s_ease-in-out_infinite]" />
            </button>

            {/* Bottom equation */}
            <div className="fixed bottom-[10vh] left-1/2 -translate-x-1/2 z-10 text-[rgba(255,255,255,0.12)] text-[10px] sm:text-xs tracking-[0.2em] font-light">
                θ ← θ − α · ∇ℒ(θ)
            </div>

            {/* Keyframes */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes intro-pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.08);
                        opacity: 0;
                    }
                }
            `}} />
        </div>
    );
}

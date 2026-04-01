"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { getIntroPlayed } from "./IntroOverlay";
import { getAudioState } from "@/lib/audioReactive";

export default function EscherImage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isIntroDone, setIsIntroDone] = useState(() => getIntroPlayed());
    const [mounted, setMounted] = useState(false);
    const fadeAppliedRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef(resolvedTheme);

    useEffect(() => setMounted(true), []);
    useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);

    useEffect(() => {
        if (!isIntroDone) {
            const handle = () => setIsIntroDone(true);
            window.addEventListener("intro-done", handle, { once: true });
            return () => window.removeEventListener("intro-done", handle);
        }
    }, [isIntroDone]);

    // Cinematic entrance
    const blurWrapRef = useRef<HTMLDivElement>(null);
    const introAlreadyPlayed = useRef(getIntroPlayed()).current;

    useEffect(() => {
        if (!isIntroDone || !containerRef.current || fadeAppliedRef.current) return;
        fadeAppliedRef.current = true;
        const el = containerRef.current;
        const blurWrap = blurWrapRef.current;

        if (introAlreadyPlayed) {
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
            if (blurWrap) blurWrap.style.filter = "blur(0px)";
            return;
        }

        el.style.transform = "scale(0.90)";
        if (blurWrap) blurWrap.style.filter = "blur(12px)";

        const timer = setTimeout(() => {
            el.style.transition = "opacity 5s cubic-bezier(0.16, 1, 0.3, 1), transform 7s cubic-bezier(0.16, 1, 0.3, 1)";
            el.style.opacity = "1";
            el.style.transform = "scale(1)";

            setTimeout(() => {
                if (blurWrap) {
                    blurWrap.style.transition = "filter 4s cubic-bezier(0.16, 1, 0.3, 1)";
                    blurWrap.style.filter = "blur(0px)";
                    setTimeout(() => { blurWrap.style.transition = ""; }, 4100);
                }
            }, 800);

            setTimeout(() => { el.style.transition = ""; }, 7100);
        }, 1800);

        return () => clearTimeout(timer);
    }, [isIntroDone]);

    // Scroll fade
    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const onScroll = () => {
            const y = window.scrollY || 0;
            const vh = window.innerHeight || 1;
            const start = vh * 0.1;
            const end = vh * 1.2;
            let fade = 1;
            if (y > start) fade = Math.max(0, 1 - (y - start) / (end - start));
            if (fadeAppliedRef.current) el.style.opacity = String(fade);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ── Blueprint edge detection + rendering ──
    useEffect(() => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/images/hands2.webp";

        img.onload = () => {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            const isSmallScreen = window.matchMedia("(max-width: 1280px)").matches;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            // Size the canvas — much larger on mobile to fill the screen
            const targetW = isMobile
                ? Math.max(window.innerWidth * 1.4, window.innerHeight * 1.2)
                : isSmallScreen
                    ? Math.min(window.innerHeight * 1.2, window.innerWidth * 1.15)
                    : Math.min(window.innerHeight * 1.1, window.innerWidth);
            const aspect = img.width / img.height;
            const cw = Math.floor(targetW * dpr);
            const ch = Math.floor((targetW / aspect) * dpr);

            canvas.width = cw;
            canvas.height = ch;
            canvas.style.width = `${targetW}px`;
            canvas.style.height = `${targetW / aspect}px`;

            // Draw the image to extract pixel data
            ctx.drawImage(img, 0, 0, cw, ch);
            const imageData = ctx.getImageData(0, 0, cw, ch);
            const pixels = imageData.data;

            // Convert to grayscale luminance array
            const gray = new Float32Array(cw * ch);
            for (let i = 0; i < cw * ch; i++) {
                const idx = i * 4;
                gray[i] = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114) / 255;
            }

            // Sobel edge detection
            const edges = new Float32Array(cw * ch);
            for (let y = 1; y < ch - 1; y++) {
                for (let x = 1; x < cw - 1; x++) {
                    const idx = y * cw + x;
                    // Sobel X
                    const gx =
                        -gray[(y - 1) * cw + (x - 1)] + gray[(y - 1) * cw + (x + 1)]
                        - 2 * gray[y * cw + (x - 1)] + 2 * gray[y * cw + (x + 1)]
                        - gray[(y + 1) * cw + (x - 1)] + gray[(y + 1) * cw + (x + 1)];
                    // Sobel Y
                    const gy =
                        -gray[(y - 1) * cw + (x - 1)] - 2 * gray[(y - 1) * cw + x] - gray[(y - 1) * cw + (x + 1)]
                        + gray[(y + 1) * cw + (x - 1)] + 2 * gray[(y + 1) * cw + x] + gray[(y + 1) * cw + (x + 1)];

                    edges[idx] = Math.sqrt(gx * gx + gy * gy);
                }
            }

            // Normalize edges
            let maxEdge = 0;
            for (let i = 0; i < edges.length; i++) {
                if (edges[i] > maxEdge) maxEdge = edges[i];
            }
            if (maxEdge > 0) {
                for (let i = 0; i < edges.length; i++) edges[i] /= maxEdge;
            }

            // Store edge data for animation
            edgeDataRef.current = { edges, width: cw, height: ch, gray };

            // Initial render
            renderBlueprint(ctx, cw, ch, 0);
        };
    }, [mounted]);

    const edgeDataRef = useRef<{ edges: Float32Array; width: number; height: number; gray: Float32Array } | null>(null);

    // Render the blueprint with breathing animation
    const renderBlueprint = (ctx: CanvasRenderingContext2D, cw: number, ch: number, time: number) => {
        const data = edgeDataRef.current;
        if (!data) return;

        const isDark = themeRef.current === "dark";
        const { edges, gray } = data;

        ctx.clearRect(0, 0, cw, ch);

        const imageData = ctx.createImageData(cw, ch);
        const out = imageData.data;

        // Blueprint colors
        const lineR = isDark ? 79 : 30;
        const lineG = isDark ? 124 : 60;
        const lineB = isDark ? 255 : 180;

        // Faint fill for darker regions (gives the drawing some body, not just edges)
        const fillR = isDark ? 40 : 20;
        const fillG = isDark ? 70 : 40;
        const fillB = isDark ? 180 : 120;

        // Stronger edges and fill on smaller screens
        const isMobileCanvas = cw < 900 * (window.devicePixelRatio || 1);
        const isSmall = cw < 1200 * (window.devicePixelRatio || 1);
        const threshold = isMobileCanvas ? 0.05 : isSmall ? 0.06 : 0.08;
        const edgeAlpha = isDark ? (isMobileCanvas ? 1.0 : isSmall ? 0.90 : 0.70) : 0.5;
        const fillAlpha = isDark ? (isMobileCanvas ? 0.18 : isSmall ? 0.12 : 0.06) : 0.04;

        for (let i = 0; i < cw * ch; i++) {
            const edge = edges[i];
            const brightness = gray[i];
            const idx = i * 4;

            if (edge > threshold) {
                const strength = Math.min(1, (edge - threshold) / (0.5 - threshold));
                const alpha = strength * edgeAlpha;
                out[idx] = lineR;
                out[idx + 1] = lineG;
                out[idx + 2] = lineB;
                out[idx + 3] = Math.floor(alpha * 255);
            } else if (brightness < 0.6) {
                const darkness = (0.6 - brightness) / 0.6;
                const alpha = darkness * fillAlpha;
                out[idx] = fillR;
                out[idx + 1] = fillG;
                out[idx + 2] = fillB;
                out[idx + 3] = Math.floor(alpha * 255);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    // Breathing animation — drives canvas opacity + transform
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !mounted) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let animId = 0;
        // Cache viewport check — only changes on resize, not per frame
        let isMobileViewport = window.innerWidth < 768;
        let isSmallViewport = window.innerWidth < 1280;
        const onResizeViewport = () => { isMobileViewport = window.innerWidth < 768; isSmallViewport = window.innerWidth < 1280; };
        window.addEventListener("resize", onResizeViewport);

        // Throttle to 30fps — breathing animation doesn't need 60fps
        const FRAME_MS = 1000 / 30;
        let lastFrame = 0;

        const animate = (now: number) => {
            animId = requestAnimationFrame(animate);
            if (now - lastFrame < FRAME_MS) return;
            lastFrame = now;

            const t = now * 0.001;
            const audio = getAudioState();

            const breath1 = Math.sin(t * 0.65) * 0.5 + 0.5;
            const breath2 = Math.sin(t * 0.38 + 0.5) * 0.5 + 0.5;
            const breathCombined = breath1 * 0.6 + breath2 * 0.4;

            const musicMod = audio.isPlaying ? audio.bass * 0.25 : 0;

            const baseOpacity = isMobileViewport ? 0.65 : isSmallViewport ? 0.50 : 0.35;
            const opacity = baseOpacity + breathCombined * 0.20 + (audio.isPlaying ? audio.amplitude * 0.08 : 0);
            const scale = 0.99 + breathCombined * 0.03 + musicMod * 0.008;

            const tx = Math.sin(t * 0.25) * 1.0;
            const ty = breathCombined * -1.5;
            const rot = -20 + Math.sin(t * 0.15) * 0.3;

            canvas.style.opacity = String(opacity);
            canvas.style.transform = `rotate(${rot}deg) translateX(${tx}px) translateY(calc(-2% + ${ty}px)) scale(${scale})`;
        };

        animId = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", onResizeViewport);
        };
    }, [mounted]);

    // Re-render blueprint when theme changes
    useEffect(() => {
        if (!mounted || !edgeDataRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        const data = edgeDataRef.current;
        renderBlueprint(ctx, data.width, data.height, 0);
    }, [mounted, resolvedTheme]);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-20 pointer-events-none flex items-center justify-center overflow-hidden"
            style={{ opacity: 0 }}
        >
          <div ref={blurWrapRef} className="absolute inset-0 flex items-center justify-center">

            {/* Outer glow — static, GPU-composited */}
            {isDark && (
                <div className="absolute" style={{
                    width: "min(120vh, 110vw)", height: "min(100vh, 90vw)",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(79,124,255,0.04) 0%, rgba(30,50,140,0.02) 50%, transparent 80%)",
                    filter: "blur(80px)", transform: "rotate(-20deg) translateY(-2%) translateZ(0)",
                    contain: "strict",
                }} />
            )}

            {/* Inner glow */}
            {isDark && (
                <div className="absolute" style={{
                    width: "min(70vh, 60vw)", height: "min(60vh, 50vw)",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(79,124,255,0.10) 0%, rgba(50,80,200,0.05) 40%, transparent 70%)",
                    filter: "blur(50px)", transform: "rotate(-20deg) translateY(-2%) translateZ(0)",
                    contain: "strict",
                }} />
            )}

            {/* Blueprint canvas */}
            <canvas
                ref={canvasRef}
                className="select-none"
                aria-hidden="true"
                style={{
                    opacity: 0.10,
                    transform: "rotate(-20deg) translateY(-2%)",
                    maskImage: typeof window !== "undefined" && window.innerWidth < 768
                        ? "radial-gradient(ellipse 95% 85% at 50% 48%, black 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 80%, transparent 100%)"
                        : "radial-gradient(ellipse 72% 68% at 50% 48%, black 25%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.12) 75%, transparent 92%)",
                    WebkitMaskImage: typeof window !== "undefined" && window.innerWidth < 768
                        ? "radial-gradient(ellipse 95% 85% at 50% 48%, black 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 80%, transparent 100%)"
                        : "radial-gradient(ellipse 72% 68% at 50% 48%, black 25%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.12) 75%, transparent 92%)",
                    willChange: "transform, opacity",
                }}
            />

            {/* Edge ring */}
            {isDark && (
                <div className="absolute" style={{
                    width: "min(85vh, 78vw)", height: "min(72vh, 65vw)",
                    borderRadius: "50%",
                    border: "1px solid rgba(79,124,255,0.04)",
                    boxShadow: "0 0 80px rgba(79,124,255,0.03), inset 0 0 80px rgba(79,124,255,0.02)",
                    transform: "rotate(-20deg) translateY(-2%)",
                }} />
            )}

          </div>
        </div>
    );
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { getIntroPlayed } from "./IntroOverlay";

// Dense → sparse ASCII ramp (dark to light)
const ASCII_RAMP = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

export default function EscherAscii() {
    const containerRef = useRef<HTMLDivElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const [isIntroDone, setIsIntroDone] = useState(() => getIntroPlayed());
    const [mounted, setMounted] = useState(false);
    const fadeAppliedRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const asciiRef = useRef<string>("");

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!isIntroDone) {
            const handle = () => setIsIntroDone(true);
            window.addEventListener("intro-done", handle, { once: true });
            return () => window.removeEventListener("intro-done", handle);
        }
    }, [isIntroDone]);

    // Fade in after intro
    useEffect(() => {
        if (!isIntroDone || !containerRef.current || fadeAppliedRef.current) return;
        fadeAppliedRef.current = true;
        const el = containerRef.current;
        const timer = setTimeout(() => {
            el.style.transition = "opacity 3s cubic-bezier(0.16, 1, 0.3, 1)";
            el.style.opacity = "1";
            setTimeout(() => { el.style.transition = ""; }, 3100);
        }, 1000);
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
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Generate ASCII from image
    const generateAscii = useCallback(() => {
        const pre = preRef.current;
        if (!pre) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/images/hands2.webp";

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            // Character aspect ratio correction (chars are taller than wide)
            const charAspect = 0.55;

            // Calculate columns to fill viewport
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            const cols = isMobile ? 80 : 150;
            const imgAspect = img.width / img.height;
            const rows = Math.round(cols / (imgAspect * charAspect));

            canvas.width = cols;
            canvas.height = rows;

            // Draw image rotated
            ctx.translate(cols / 2, rows / 2);
            ctx.rotate((-20 * Math.PI) / 180);
            const scale = 1.4; // zoom in a bit
            const drawW = cols * scale;
            const drawH = rows * scale;
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            const imageData = ctx.getImageData(0, 0, cols, rows);
            const pixels = imageData.data;

            let ascii = "";
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const idx = (y * cols + x) * 4;
                    const r = pixels[idx];
                    const g = pixels[idx + 1];
                    const b = pixels[idx + 2];
                    const a = pixels[idx + 3];

                    if (a < 10) {
                        ascii += " ";
                        continue;
                    }

                    const brightness = (r + g + b) / 3;
                    // Map brightness to ASCII ramp (inverted: dark pixels = dense chars)
                    const charIdx = Math.floor((brightness / 255) * (ASCII_RAMP.length - 1));
                    ascii += ASCII_RAMP[charIdx];
                }
                ascii += "\n";
            }

            asciiRef.current = ascii;
            pre.textContent = ascii;
        };
    }, []);

    // Generate on mount and resize
    useEffect(() => {
        generateAscii();
        const onResize = () => generateAscii();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [generateAscii]);

    // Ink spotlight animation on the pre element
    useEffect(() => {
        const pre = preRef.current;
        if (!pre || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let animId = 0;
        const animate = (now: number) => {
            animId = requestAnimationFrame(animate);
            const t = now * 0.001;
            const x1 = 50 + Math.sin(t * 0.08) * 22 + Math.sin(t * 0.05) * 12;
            const y1 = 48 + Math.cos(t * 0.06) * 18 + Math.cos(t * 0.10) * 10;
            const x2 = 50 + Math.cos(t * 0.11) * 16 + Math.sin(t * 0.04) * 8;
            const y2 = 52 + Math.sin(t * 0.07) * 14 + Math.cos(t * 0.09) * 6;

            const mask = `
                radial-gradient(ellipse 70% 65% at ${x1}% ${y1}%, black 15%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.08) 100%),
                radial-gradient(ellipse 55% 50% at ${x2}% ${y2}%, black 10%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.05) 100%)
            `;
            pre.style.maskImage = mask;
            pre.style.webkitMaskImage = mask;
            pre.style.maskComposite = "add";
            (pre.style as unknown as Record<string, string>).webkitMaskComposite = "source-over";
        };
        animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-20 pointer-events-none flex items-center justify-center overflow-hidden"
            style={{ opacity: 0 }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ascii-breathe {
                    0%, 100% { opacity: 0.18; }
                    30% { opacity: 0.25; }
                    60% { opacity: 0.20; }
                    85% { opacity: 0.24; }
                }
                @keyframes ascii-draw {
                    0%, 100% { transform: translateY(-2%) scale(1); }
                    30% { transform: translateY(-2.3%) scale(1.002); }
                    60% { transform: translateY(-1.7%) scale(0.999); }
                    85% { transform: translateY(-2.1%) scale(1.001); }
                }
            `}} />
            <pre
                ref={preRef}
                aria-hidden="true"
                className="select-none leading-[0.65em] tracking-[0.05em]"
                style={{
                    fontFamily: "var(--font-code), ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
                    fontSize: "clamp(5px, 0.85vw, 10px)",
                    color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
                    animation: "ascii-breathe 10s ease-in-out infinite, ascii-draw 16s ease-in-out infinite",
                    whiteSpace: "pre",
                    willChange: "opacity",
                    lineHeight: "0.65em",
                }}
            />
        </div>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function EscherImage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollWrapRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isMob, setIsMob] = useState(false);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef(resolvedTheme);

    // Scroll rotation state
    const lastScrollY = useRef(0);
    const targetRotation = useRef(0);
    const currentRotation = useRef(0);
    const rafId = useRef(0);

    useEffect(() => {
        setMounted(true);
        setIsMob(window.matchMedia("(max-width: 768px)").matches);
    }, []);
    useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);

    // Scroll-driven rotation — rAF-smoothed, no CSS transition jank
    useEffect(() => {
        if (!mounted) return;
        lastScrollY.current = window.scrollY;

        const onScroll = () => {
            const delta = window.scrollY - lastScrollY.current;
            lastScrollY.current = window.scrollY;
            targetRotation.current += delta * 0.015;
        };

        // Smooth interpolation loop — runs at display refresh rate
        const tick = () => {
            rafId.current = requestAnimationFrame(tick);
            // Lerp toward target — smooth, no jank
            currentRotation.current += (targetRotation.current - currentRotation.current) * 0.08;

            if (scrollWrapRef.current) {
                scrollWrapRef.current.style.transform = `rotate(${currentRotation.current}deg) translate3d(0,0,0)`;
            }
        };

        rafId.current = requestAnimationFrame(tick);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(rafId.current);
        };
    }, [mounted]);

    // Scroll-triggered reveal
    useEffect(() => {
        if (!mounted || !containerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [mounted]);

    // Render edges once — static canvas
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
            // Cap at 2x — 3x creates huge buffers that slow rendering without visible benefit
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            const targetW = isMobile ? window.innerWidth * 0.95 : Math.min(850, window.innerWidth * 0.65);
            const aspect = img.width / img.height;
            const cw = Math.floor(targetW * dpr);
            const ch = Math.floor((targetW / aspect) * dpr);

            canvas.width = cw;
            canvas.height = ch;
            canvas.style.width = `${targetW}px`;
            canvas.style.height = `${targetW / aspect}px`;

            ctx.drawImage(img, 0, 0, cw, ch);
            const imageData = ctx.getImageData(0, 0, cw, ch);
            const pixels = imageData.data;

            // Grayscale — use Uint8 for speed, we don't need float precision
            const gray = new Uint8Array(cw * ch);
            for (let i = 0; i < cw * ch; i++) {
                const idx = i * 4;
                gray[i] = (pixels[idx] * 77 + pixels[idx + 1] * 150 + pixels[idx + 2] * 29) >> 8;
            }

            // Sobel — integer math, avoid sqrt where possible
            const edges = new Uint16Array(cw * ch);
            let maxEdge = 0;
            for (let y = 1; y < ch - 1; y++) {
                for (let x = 1; x < cw - 1; x++) {
                    const idx = y * cw + x;
                    const gx =
                        -gray[(y-1)*cw+(x-1)] + gray[(y-1)*cw+(x+1)]
                        -2*gray[y*cw+(x-1)] + 2*gray[y*cw+(x+1)]
                        -gray[(y+1)*cw+(x-1)] + gray[(y+1)*cw+(x+1)];
                    const gy =
                        -gray[(y-1)*cw+(x-1)] -2*gray[(y-1)*cw+x] -gray[(y-1)*cw+(x+1)]
                        +gray[(y+1)*cw+(x-1)] +2*gray[(y+1)*cw+x] +gray[(y+1)*cw+(x+1)];
                    // Use magnitude squared to avoid sqrt — compare thresholds squared too
                    const mag = gx * gx + gy * gy;
                    edges[idx] = mag > 65535 ? 65535 : mag;
                    if (mag > maxEdge) maxEdge = mag;
                }
            }

            // Render
            const isDark = themeRef.current === "dark";
            ctx.clearRect(0, 0, cw, ch);
            const outData = ctx.createImageData(cw, ch);
            const out = outData.data;

            const lineR = isDark ? 220 : 80;
            const lineG = isDark ? 180 : 55;
            const lineB = isDark ? 120 : 20;

            // Threshold in squared magnitude space
            const threshNorm = isMobile ? 0.18 : 0.22;
            const threshSq = Math.floor(threshNorm * threshNorm * maxEdge * (maxEdge > 0 ? 1 : 0));
            const rangeSq = Math.floor(0.45 * 0.45 * maxEdge) - threshSq;
            const alphaScale = isMobile ? 2.2 : 1.8;

            for (let i = 0; i < cw * ch; i++) {
                const mag = edges[i];
                if (mag > threshSq) {
                    const strength = Math.min(1, (mag - threshSq) / rangeSq);
                    const idx = i * 4;
                    out[idx] = lineR;
                    out[idx + 1] = lineG;
                    out[idx + 2] = lineB;
                    out[idx + 3] = (Math.min(1, strength * alphaScale) * 255) | 0;
                }
            }

            ctx.putImageData(outData, 0, 0);
        };
    }, [mounted, resolvedTheme]);

    return (
        <div
            ref={containerRef}
            className="flex justify-center items-center"
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes hands-breathe {
                    0%   { transform: scale(1)    rotate(0deg); }
                    25%  { transform: scale(1.01) rotate(0.7deg); }
                    50%  { transform: scale(1.02) rotate(0deg); }
                    75%  { transform: scale(1.01) rotate(-0.7deg); }
                    100% { transform: scale(1)    rotate(0deg); }
                }
                @keyframes hands-reveal {
                    0% {
                        opacity: 0;
                        transform: scale(0.95) rotate(-0.5deg);
                    }
                    100% {
                        opacity: 0.85;
                        transform: scale(1) rotate(0deg);
                    }
                }
            `}} />
            <div
                ref={scrollWrapRef}
                style={{ willChange: "transform", transform: "rotate(0deg) translate3d(0,0,0)" }}
            >
                <canvas
                    ref={canvasRef}
                    className="select-none"
                    aria-hidden="true"
                    style={{
                        opacity: isVisible ? undefined : 0,
                        animation: isVisible
                            ? `hands-reveal ${isMob ? '1.5s' : '2s'} cubic-bezier(0.16,1,0.3,1) forwards, hands-breathe 8s ease-in-out ${isMob ? '1.5s' : '2s'} infinite`
                            : "none",
                        maskImage: "radial-gradient(ellipse 85% 80% at 50% 48%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                        WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 48%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                        willChange: "transform, opacity",
                        contain: "layout paint",
                    }}
                />
            </div>
        </div>
    );
}

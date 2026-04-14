"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function EscherImage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const animRef = useRef(0);
    const edgeDataRef = useRef<{ edges: Float32Array; cw: number; ch: number } | null>(null);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef(resolvedTheme);
    useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);

    useEffect(() => setMounted(true), []);

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

            // Grayscale
            const gray = new Float32Array(cw * ch);
            for (let i = 0; i < cw * ch; i++) {
                const idx = i * 4;
                gray[i] = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114) / 255;
            }

            // Sobel
            const edges = new Float32Array(cw * ch);
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
                    edges[idx] = Math.sqrt(gx * gx + gy * gy);
                }
            }

            // Normalize
            let maxEdge = 0;
            for (let i = 0; i < edges.length; i++) if (edges[i] > maxEdge) maxEdge = edges[i];
            if (maxEdge > 0) for (let i = 0; i < edges.length; i++) edges[i] /= maxEdge;

            edgeDataRef.current = { edges, cw, ch };

            // Start animation loop
            const FRAME_MS = 1000 / 24;
            let lastFrame = 0;

            const animate = (now: number) => {
                animRef.current = requestAnimationFrame(animate);
                if (now - lastFrame < FRAME_MS) return;
                lastFrame = now;

                const t = now * 0.001;
                const data = edgeDataRef.current;
                if (!data) return;

                ctx.clearRect(0, 0, cw, ch);
                const outData = ctx.createImageData(cw, ch);
                const out = outData.data;

                const isDark = themeRef.current === "dark";
                const pulse = 0.85 + Math.sin(t * 0.6) * 0.15;
                const threshold = 0.22;

                // Animated draw-on: sweep line reveals edges from left to right over time
                // After full reveal, just show everything with pulse
                const revealDuration = 4; // seconds for full reveal
                const revealProgress = Math.min(1, t / revealDuration);
                const revealX = revealProgress * cw;

                for (let y = 0; y < ch; y++) {
                    for (let x = 0; x < cw; x++) {
                        const i = y * cw + x;
                        const edge = data.edges[i];

                        if (edge > threshold) {
                            // Distance from reveal line — creates a soft glow at the drawing edge
                            let drawAlpha = 1;
                            if (revealProgress < 1) {
                                if (x > revealX) continue; // not yet revealed
                                const distFromEdge = revealX - x;
                                // Bright glow near the "pen tip"
                                const tipGlow = distFromEdge < 30 ? 1 + (1 - distFromEdge / 30) * 2 : 1;
                                drawAlpha = tipGlow;
                            }

                            const strength = Math.min(1, (edge - threshold) / (0.45 - threshold));
                            const alpha = Math.min(1, strength * 1.8 * pulse * drawAlpha);

                            const idx = i * 4;
                            // Brighter near tip during reveal, normal after
                            const tipBoost = (revealProgress < 1 && (revealX - x) < 20) ? 1.5 : 1;
                            out[idx] = isDark ? Math.min(255, Math.floor(130 * tipBoost)) : Math.min(255, Math.floor(30 * tipBoost));
                            out[idx + 1] = isDark ? Math.min(255, Math.floor(190 * tipBoost)) : Math.min(255, Math.floor(60 * tipBoost));
                            out[idx + 2] = isDark ? 255 : Math.min(255, Math.floor(160 * tipBoost));
                            out[idx + 3] = Math.floor(alpha * 255);
                        }
                    }
                }

                ctx.putImageData(outData, 0, 0);
            };

            animRef.current = requestAnimationFrame(animate);
        };

        return () => cancelAnimationFrame(animRef.current);
    }, [mounted]);

    return (
        <div className="flex justify-center items-center">
            <canvas
                ref={canvasRef}
                className="select-none"
                aria-hidden="true"
                style={{
                    opacity: 0.9,
                    maskImage: "radial-gradient(ellipse 85% 80% at 50% 48%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 48%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                }}
            />
        </div>
    );
}

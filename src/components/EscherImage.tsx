"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function EscherImage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef(resolvedTheme);

    useEffect(() => setMounted(true), []);
    useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);

    // Scroll-triggered reveal via IntersectionObserver
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

    // Render edges once — static canvas, animated via CSS
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

            // Render once — static blueprint
            const isDark = themeRef.current === "dark";
            ctx.clearRect(0, 0, cw, ch);
            const outData = ctx.createImageData(cw, ch);
            const out = outData.data;

            const lineR = isDark ? 130 : 30;
            const lineG = isDark ? 190 : 60;
            const lineB = isDark ? 255 : 160;
            const threshold = 0.22;

            for (let i = 0; i < cw * ch; i++) {
                const edge = edges[i];
                if (edge > threshold) {
                    const strength = Math.min(1, (edge - threshold) / (0.45 - threshold));
                    const idx = i * 4;
                    out[idx] = lineR;
                    out[idx + 1] = lineG;
                    out[idx + 2] = lineB;
                    out[idx + 3] = Math.floor(Math.min(1, strength * 1.8) * 255);
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
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes hands-reveal {
                    0% {
                        opacity: 0;
                        transform: scale(0.92);
                        filter: blur(8px);
                    }
                    60% {
                        opacity: 0.85;
                        transform: scale(1.01);
                        filter: blur(0px);
                    }
                    100% {
                        opacity: 0.85;
                        transform: scale(1);
                        filter: blur(0px);
                    }
                }
            `}} />
            <canvas
                ref={canvasRef}
                className="select-none"
                aria-hidden="true"
                style={{
                    opacity: isVisible ? undefined : 0,
                    animation: isVisible
                        ? "hands-reveal 2.5s cubic-bezier(0.16,1,0.3,1) forwards, hands-breathe 8s ease-in-out 2.5s infinite"
                        : "none",
                    maskImage: "radial-gradient(ellipse 85% 80% at 50% 48%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 48%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    willChange: "transform, opacity, filter",
                }}
            />
        </div>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: -100, y: -100 });
    const visibleRef = useRef(false);
    const [isFinePointer, setIsFinePointer] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        setIsFinePointer(window.matchMedia("(pointer: fine)").matches);
    }, []);

    useEffect(() => {
        if (!isFinePointer) return;
        const glow = glowRef.current;
        if (!glow) return;

        let rafId = 0;

        const updatePosition = () => {
            if (glow) glow.style.transform = `translate(${posRef.current.x - 15}px, ${posRef.current.y - 15}px)`;
        };

        const handleMouseMove = (e: MouseEvent) => {
            posRef.current.x = e.clientX;
            posRef.current.y = e.clientY;
            if (!visibleRef.current) {
                visibleRef.current = true;
                if (glow) glow.style.opacity = "1";
            }
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updatePosition);
        };

        const handleMouseLeave = () => { visibleRef.current = false; if (glow) glow.style.opacity = "0"; };
        const handleMouseEnter = () => { visibleRef.current = true; if (glow) glow.style.opacity = "1"; };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
            cancelAnimationFrame(rafId);
        };
    }, [isFinePointer]);

    // Don't render anything until mounted — prevents hydration mismatch
    if (!mounted) return null;
    if (!isFinePointer) return null;

    const isDark = resolvedTheme === "dark";

    return (
        <div
            ref={glowRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: isDark
                    ? "radial-gradient(circle, rgba(79,124,255,0.30) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(79,124,255,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
                zIndex: 9999,
                opacity: 0,
                mixBlendMode: isDark ? "screen" : "multiply",
                willChange: "transform",
                transition: "opacity 0.3s ease",
                transform: "translate(-100px, -100px)",
            }}
        />
    );
}

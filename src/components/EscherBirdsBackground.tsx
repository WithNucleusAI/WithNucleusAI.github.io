"use client";
import { useEffect, useState } from "react";

export default function EscherBirdsBackground() {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        let rafId: number;

        const handleScroll = () => {
            // Fade out over the first 80% of the viewport
            const fadePoint = window.innerHeight * 0.8;
            // Use a slightly eased curve for smoother visual disappearance
            const scrollY = window.scrollY;
            const rawOpacity = 1 - (scrollY / fadePoint);
            const newOpacity = Math.max(0, Math.min(1, rawOpacity));

            setOpacity(newOpacity);
        };

        const onScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(handleScroll);
        };

        // Initial check
        handleScroll();

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 w-full h-full z-0 will-change-opacity"
            style={{
                opacity,
                pointerEvents: opacity > 0.05 ? 'auto' : 'none'
            }}
        >
            <iframe
                src="/illusion-lab.html"
                className="w-full h-full border-none"
                title="Tessellation Background"
            />
        </div>
    );
}

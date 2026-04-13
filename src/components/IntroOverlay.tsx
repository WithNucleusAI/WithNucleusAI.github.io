"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

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

// Happy Mac pixel art — 24x24 grid, 1 = white pixel, 0 = transparent
const HAPPY_MAC: number[][] = [
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,1,0,0,0,0,1,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0],
];

function HappyMacIcon({ size = 6 }: { size?: number }) {
    return (
        <div
            className="inline-grid"
            style={{
                gridTemplateColumns: `repeat(24, ${size}px)`,
                gridTemplateRows: `repeat(24, ${size}px)`,
            }}
            aria-hidden="true"
        >
            {HAPPY_MAC.flat().map((pixel, i) => (
                <div
                    key={i}
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: pixel ? '#ffffff' : 'transparent',
                    }}
                />
            ))}
        </div>
    );
}

export default function IntroOverlay() {
    const [hasMounted, setHasMounted] = useState(false);
    const [step, setStep] = useState<"black" | "icon" | "loading" | "fading" | "done">("black");
    const [loadProgress, setLoadProgress] = useState(0);
    const loadIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setHasMounted(true);
            if (getIntroPlayed()) setStep("done");
        }, 0);
        return () => clearTimeout(t);
    }, []);

    // Boot sequence timing
    useEffect(() => {
        if (!hasMounted || step === "done") return;

        if (step === "black") {
            const t = setTimeout(() => setStep("icon"), 300);
            return () => clearTimeout(t);
        }

        if (step === "icon") {
            const t = setTimeout(() => setStep("loading"), 1500);
            return () => clearTimeout(t);
        }

        if (step === "loading") {
            let progress = 0;
            loadIntervalRef.current = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress >= 100) {
                    progress = 100;
                    setLoadProgress(100);
                    if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
                    setTimeout(() => finishIntro(), 200);
                } else {
                    setLoadProgress(progress);
                }
            }, 80);
            return () => {
                if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
            };
        }
    }, [hasMounted, step]);

    const finishIntro = useCallback(() => {
        setStep("fading");
        setTimeout(() => {
            setStep("done");
            setIntroPlayed();
        }, 800);
    }, []);

    if (!hasMounted) {
        return <div className="fixed inset-0 z-[100] bg-black" />;
    }

    if (step === "done") {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-800
            ${step === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            {/* Happy Mac icon + text */}
            {(step === "icon" || step === "loading" || step === "fading") && (
                <div className="flex flex-col items-center gap-6 sm:gap-8">
                    <div className="animate-[fadeIn_0.3s_ease-in_forwards]">
                        <HappyMacIcon size={window.innerWidth < 640 ? 4 : 6} />
                    </div>

                    <h1
                        className="text-2xl sm:text-4xl font-bold tracking-[0.3em] sm:tracking-[0.4em] text-white animate-[fadeIn_0.5s_ease-in_0.2s_both]"
                        style={{ fontFamily: "var(--font-base)" }}
                    >
                        NUCLEUS
                    </h1>

                    <span className="text-[10px] sm:text-xs tracking-[0.3em] text-white/50 uppercase animate-[fadeIn_0.5s_ease-in_0.4s_both]">
                        General Intelligence
                    </span>
                </div>
            )}

            {/* Loading bar */}
            {(step === "loading" || step === "fading") && (
                <div className="absolute bottom-[20vh] sm:bottom-[22vh] left-1/2 -translate-x-1/2 w-48 sm:w-64">
                    <div className="w-full h-3 sm:h-4 border border-white/60">
                        <div
                            className="h-full bg-white transition-[width] duration-100 ease-linear"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

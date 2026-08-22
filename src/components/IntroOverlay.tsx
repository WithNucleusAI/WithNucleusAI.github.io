"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

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

export default function IntroOverlay() {
    const [hasMounted, setHasMounted] = useState(false);
    const [step, setStep] = useState<"black" | "logo" | "loading" | "fading" | "done">("black");
    const [loadProgress, setLoadProgress] = useState(0);
    const loadIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setHasMounted(true);
            if (getIntroPlayed()) setStep("done");
        }, 0);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!hasMounted || step === "done") return;

        if (step === "black") {
            const t = setTimeout(() => setStep("logo"), 200);
            return () => clearTimeout(t);
        }

        if (step === "logo") {
            const t = setTimeout(() => setStep("loading"), 1200);
            return () => clearTimeout(t);
        }

        if (step === "loading") {
            let progress = 0;
            loadIntervalRef.current = setInterval(() => {
                progress += Math.random() * 18 + 6;
                if (progress >= 100) {
                    progress = 100;
                    setLoadProgress(100);
                    if (loadIntervalRef.current) clearInterval(loadIntervalRef.current);
                    setTimeout(() => finishIntro(), 150);
                } else {
                    setLoadProgress(progress);
                }
            }, 60);
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
        }, 600);
    }, []);

    if (!hasMounted) {
        return <div className="fixed inset-0 z-[100] bg-black" />;
    }

    if (step === "done") {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-600
            ${step === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            {(step === "logo" || step === "loading" || step === "fading") && (
                <div className="flex flex-col items-center">
                    {/* Nucleus logo — large, centered, brand-first */}
                    <div className="animate-[fadeIn_0.4s_ease-in_forwards] mb-8 sm:mb-10">
                        <Image
                            src="/logo.webp"
                            alt="Nucleus"
                            width={120}
                            height={120}
                            className="w-16 h-16 sm:w-24 sm:h-24 invert-0"
                            priority
                        />
                    </div>

                    <h1 className="text-lg sm:text-2xl font-semibold tracking-[0.25em] text-white/90 animate-[fadeIn_0.4s_ease-in_0.15s_both]">
                        NUCLEUS
                    </h1>

                    <span className="mt-2 text-[9px] sm:text-[10px] tracking-[0.2em] text-white/25 animate-[fadeIn_0.4s_ease-in_0.3s_both]">
                        General Intelligence
                    </span>
                </div>
            )}

            {/* Loading bar — thin, refined */}
            {(step === "loading" || step === "fading") && (
                <div className="absolute bottom-[22vh] sm:bottom-[24vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                    <span className="text-[8px] tracking-[0.3em] text-white/20 uppercase">Loading</span>
                    <div className="w-36 sm:w-48 h-[2px] bg-white/8 overflow-hidden">
                        <div
                            className="h-full bg-white/50 transition-[width] duration-75 ease-linear"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

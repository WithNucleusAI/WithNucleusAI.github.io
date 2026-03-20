"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { getIntroPlayed } from "./IntroOverlay";
import { useFooterAwareBottomOffset } from "@/lib/useFooterAwareBottom";

const STORAGE_KEY = "bg-music-muted";
const EXPIRY_HOURS = 1;

function saveMutedState(isMuted: boolean) {
    const expiry = Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000); // 1 hour from now
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: isMuted, expiry }));
}

function loadMutedState(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    
    try {
        const { value, expiry } = JSON.parse(saved);
        if (Date.now() > expiry) {
            localStorage.removeItem(STORAGE_KEY);
            return false;
        }
        return value;
    } catch {
        return false;
    }
}

export default function MuteButton() {
    const [mounted, setMounted] = React.useState(false);
    const bottomOffset = useFooterAwareBottomOffset(30, 10);
    const [isMuted, setIsMuted] = React.useState(() => {
        if (typeof window !== "undefined") {
            return loadMutedState();
        }
        return false;
    });
    const pathname = usePathname();
    const [isVisible, setIsVisible] = React.useState(() => {
        if (typeof window !== "undefined") {
            return pathname !== "/" || getIntroPlayed();
        }
        return pathname !== "/";
    });

    React.useEffect(() => {
        setMounted(true);
        
        const handleIntroDone = () => setIsVisible(true);
        window.addEventListener('intro-done', handleIntroDone);
        
        if (pathname === '/') {
            setIsVisible(getIntroPlayed());
        } else {
            setIsVisible(true);
        }

        const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
        if (audio) {
            const savedMuted = loadMutedState();
            audio.muted = savedMuted;
            setIsMuted(savedMuted);

            const handleVolumeChange = () => {
                const newMutedState = audio.muted;
                setIsMuted(newMutedState);
                saveMutedState(newMutedState);
            };
            audio.addEventListener('volumechange', handleVolumeChange);
            return () => {
                audio.removeEventListener('volumechange', handleVolumeChange);
                window.removeEventListener('intro-done', handleIntroDone);
            };
        }
        
        return () => window.removeEventListener('intro-done', handleIntroDone);
    }, [pathname]);

    const toggleMute = () => {
        const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
        if (audio) {
            const newMutedState = !audio.muted;
            audio.muted = newMutedState;
            setIsMuted(newMutedState);
            saveMutedState(newMutedState);
        }
    };

    if (!mounted || pathname !== "/") {
        return null;
    }

    return (
        <div
            className={`fixed cursor-pointer left-22.5 max-md:left-16.25 z-50 transition-all duration-1000 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
            style={{ bottom: `${bottomOffset}px` }}
        >
            <button className="btn btn--circle" onClick={toggleMute} aria-label="Toggle mute">
                <div className="btn__content">
                    {isMuted ? (
                        <VolumeX className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                        <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                </div>
                <svg className="btn__fill-layer" viewBox="0 0 60 60">
                    <circle className="btn__fill-circle" fill="#FFFFFF" cx="30" cy="30" r="29" />
                </svg>
                <svg className="btn__border-layer" viewBox="0 0 60 60">
                    <path className="btn__border-path btn__border-path--left" d="M30,59 A29,29 0 0,1 30,1" />
                    <path className="btn__border-path btn__border-path--right" d="M30,59 A29,29 0 0,0 30,1" />
                </svg>
            </button>
        </div>
    );
}
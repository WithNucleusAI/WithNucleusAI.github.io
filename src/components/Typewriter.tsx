"use client";

import { useEffect, useState, useRef } from "react";
import { getIntroPlayed } from "./IntroOverlay";

const phrases = [
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn't compressed memory, it's the ability to find those answers in the wind.",
    "NUCLEUS"
];

const prefix = [0, 0, 0];
const commaOverrides: { [key: number]: { [key: number]: number } } = {
    0: { 10: 0 },
};
const fullstopOverrides: { [key: number]: { [key: number]: number } } = {};

const typingSpeed = 60;
const normalDeletingSpeed = 15; // Slightly slower delete to make it smoother
const delayAfterTyping = 3500;
const delayAfterDeleting = 1000; // Slightly faster pause after delete for snappiness
const defaultDelayAfterComma = 1500;
const defaultDelayAfterFullStop = 1500;

function isStringWithPause(str: string) {
    const firstCommaIndex = str.indexOf(',');
    const firstFullstopIndex = str.indexOf('.');
    const isValidComma = firstCommaIndex !== -1 && firstCommaIndex !== str.length - 1;
    const isValidFullStop = firstFullstopIndex !== -1 && firstFullstopIndex !== str.length - 1;
    return isValidComma || isValidFullStop;
}

const phrasesWithPause = phrases.map((str) => isStringWithPause(str));

export default function Typewriter() {
    const [text, setText] = useState("");
    const [isNucleus, setIsNucleus] = useState(() => getIntroPlayed());
    const [showCaption, setShowCaption] = useState(() => getIntroPlayed());

    const currentPhraseIndexRef = useRef(0);
    const letterIndexRef = useRef(0);
    const isTypingRef = useRef(true);
    const deletingSpeedRef = useRef(normalDeletingSpeed);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        currentPhraseIndexRef.current = 0;
        letterIndexRef.current = 0;
        isTypingRef.current = true;
        deletingSpeedRef.current = normalDeletingSpeed;

        const introAlreadyPlayed = getIntroPlayed();

        if (introAlreadyPlayed) {
            currentPhraseIndexRef.current = phrases.length - 1;
        }

        const typeWriter = async () => {
            const currentPhraseIndex = currentPhraseIndexRef.current;
            const currentPhrase = phrases[currentPhraseIndex];
            const isFinalPhrase = currentPhraseIndex === phrases.length - 1;

            setIsNucleus(isFinalPhrase);

            // Smoother deletion speed curve near the end
            if (currentPhraseIndex === phrases.length - 2) {
                deletingSpeedRef.current = 40; // Less abrupt than 65
            } else {
                deletingSpeedRef.current = normalDeletingSpeed;
            }

            if (isTypingRef.current) {
                let letterIndex = letterIndexRef.current;
                let charToAdd = currentPhrase.charAt(letterIndex);
                letterIndex++;

                if (charToAdd === '<') {
                    while (currentPhrase.charAt(letterIndex) !== '>') {
                        charToAdd += currentPhrase.charAt(letterIndex);
                        letterIndex++;
                    }
                    charToAdd += '>';
                    letterIndex++;
                }

                setText(currentPhrase.substring(0, letterIndex));
                letterIndexRef.current = letterIndex;

                if (letterIndex < currentPhrase.length) {
                    if (phrasesWithPause[currentPhraseIndex]) {
                        const nextChar = currentPhrase.charAt(letterIndex);
                        if (nextChar === ',') {
                            setText(prev => prev + ',');
                            letterIndexRef.current++;
                            const delay = commaOverrides[currentPhraseIndex]?.[letterIndex] ?? defaultDelayAfterComma;
                            timeoutRef.current = setTimeout(typeWriter, delay);
                            return;
                        } else if (nextChar === '.') {
                            setText(prev => prev + '.');
                            letterIndexRef.current++;
                            const delay = fullstopOverrides[currentPhraseIndex]?.[letterIndex] ?? defaultDelayAfterFullStop;
                            timeoutRef.current = setTimeout(typeWriter, delay);
                            return;
                        }
                    }
                    // Final phrase (NUCLEUS) types slower and more deliberately
                    const baseSpeed = isFinalPhrase ? 180 : typingSpeed;
                    const randomSpeed = baseSpeed + (Math.random() * (isFinalPhrase ? 60 : 20) - (isFinalPhrase ? 30 : 10));
                    timeoutRef.current = setTimeout(typeWriter, randomSpeed);
                } else {
                    if (isFinalPhrase) {
                        setIsNucleus(true);
                        setShowCaption(true);
                        return;
                    }

                    isTypingRef.current = false;
                    timeoutRef.current = setTimeout(typeWriter, delayAfterTyping);
                }
            } else {
                let letterIndex = letterIndexRef.current;

                if (letterIndex > prefix[currentPhraseIndex]) {
                    if (currentPhrase.charAt(letterIndex - 1) === '>') {
                        while (letterIndex > 0 && currentPhrase.charAt(letterIndex - 1) !== '<') {
                            letterIndex--;
                        }
                        letterIndex--;
                    }

                    setText(currentPhrase.substring(0, Math.max(0, letterIndex - 1)));
                    letterIndexRef.current = Math.max(0, letterIndex - 1);

                    timeoutRef.current = setTimeout(typeWriter, deletingSpeedRef.current);
                } else {
                    isTypingRef.current = true;
                    currentPhraseIndexRef.current = (currentPhraseIndex + 1) % phrases.length;
                    timeoutRef.current = setTimeout(typeWriter, delayAfterDeleting);
                }
            }
        };

        const startTypewriter = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(typeWriter, typingSpeed);
        };

        let removeIntroListener: (() => void) | undefined;

        if (introAlreadyPlayed) {
            startTypewriter();
        } else if (typeof window !== "undefined") {
            const handleIntroDone = () => {
                startTypewriter();
            };

            window.addEventListener("intro-done", handleIntroDone, { once: true });
            removeIntroListener = () => window.removeEventListener("intro-done", handleIntroDone);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            removeIntroListener?.();
        };
    }, []);

    return (
        <div
            className="w-full flex mt-14 flex-col items-center -translate-y-10"
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes typewriter-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes fade-slide-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes separator-expand {
                    0% { width: 0; opacity: 0; }
                    100% { width: 3rem; opacity: 1; }
                }
            `}} />

            {/* NUCLEUS / typewriter text */}
            <div
                id="typing"
                className={`mx-auto w-full max-w-[90vw] sm:max-w-2xl px-2 sm:px-4 text-center origin-center md:leading-normal max-md:leading-[1.35] ${
                    isNucleus
                        ? "transition-none text-5xl sm:text-7xl lg:text-8xl font-extralight leading-none tracking-[0.28em] text-gray-900 dark:text-white"
                        : "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] font-inherit text-lg sm:text-xl font-light tracking-tight text-neutral-600 dark:text-neutral-400"
                }`}
            >
                <span
                    id="text"
                    className={isNucleus ? "transition-none" : "transition-all duration-1000"}
                    style={isNucleus ? { textShadow: "0 0 40px rgba(79,124,255,0.15), 0 0 80px rgba(79,124,255,0.05)" } : undefined}
                    dangerouslySetInnerHTML={{ __html: text }}
                ></span>
                {!showCaption && (
                    <span
                        style={{ animation: 'typewriter-blink 0.9s ease-in-out infinite' }}
                        className="inline-block w-[2px] h-[0.85em] ml-1.5 align-middle bg-[rgba(79,124,255,0.5)]"
                    ></span>
                )}
            </div>

            {showCaption && (
                <div
                    key="caption"
                    className="mt-5 sm:mt-6 flex flex-col items-center gap-4"
                >
                    {/* Thin separator line */}
                    <div
                        style={{ animation: 'separator-expand 1.5s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}
                        className="h-px bg-[rgba(79,124,255,0.2)]"
                    />

                    {/* Subtitle */}
                    <span
                        style={{ animation: 'fade-slide-up 1.5s cubic-bezier(0.16,1,0.3,1) 0.6s both' }}
                        className="text-[11px] sm:text-sm lg:text-base text-gray-400 dark:text-[rgba(79,124,255,0.55)] font-light tracking-[0.4em] uppercase"
                    >
                        General Intelligence
                    </span>
                </div>
            )}
        </div>
    );
}

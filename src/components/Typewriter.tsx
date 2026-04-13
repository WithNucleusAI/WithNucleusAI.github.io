"use client";

import { useEffect, useState, useRef } from "react";
import { getIntroPlayed } from "./IntroOverlay";

const phrases = [
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn't compressed memory, it's the ability to find those answers in the wind.",
    "NUCLEUS"
];

const typingSpeed = 55;
const deletingSpeed = 18;
const nucleusTypingSpeed = 160;
const delayAfterTyping = 3200;
const delayAfterDeleting = 800;
const commaDelay = 1200;
const periodDelay = 1000;

export default function Typewriter() {
    const [text, setText] = useState("");
    const [isNucleus, setIsNucleus] = useState(() => getIntroPlayed());
    const [showCaption, setShowCaption] = useState(() => getIntroPlayed());

    const [currentPhrase, setCurrentPhrase] = useState(0);
    const phraseIdx = useRef(0);
    const charIdx = useRef(0);
    const typing = useRef(true);
    const timer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        phraseIdx.current = 0;
        charIdx.current = 0;
        typing.current = true;

        if (getIntroPlayed()) {
            phraseIdx.current = phrases.length - 1;
        }

        const tick = () => {
            const pi = phraseIdx.current;
            const phrase = phrases[pi];
            const isFinal = pi === phrases.length - 1;

            setIsNucleus(isFinal);
            setCurrentPhrase(pi);

            if (typing.current) {
                // Typing forward
                let ci = charIdx.current;
                let ch = phrase.charAt(ci);
                ci++;

                // Skip HTML tags instantly
                if (ch === '<') {
                    while (ci < phrase.length && phrase.charAt(ci - 1) !== '>') ci++;
                }

                setText(phrase.substring(0, ci));
                charIdx.current = ci;

                if (ci < phrase.length) {
                    const nextCh = phrase.charAt(ci);
                    // Pause at commas and periods (but not at end of string)
                    if (nextCh === ',' && ci < phrase.length - 1) {
                        setText(phrase.substring(0, ci + 1));
                        charIdx.current = ci + 1;
                        timer.current = setTimeout(tick, commaDelay);
                        return;
                    }
                    if (nextCh === '.' && ci < phrase.length - 1) {
                        setText(phrase.substring(0, ci + 1));
                        charIdx.current = ci + 1;
                        timer.current = setTimeout(tick, periodDelay);
                        return;
                    }
                    const speed = isFinal
                        ? nucleusTypingSpeed + (Math.random() * 60 - 30)
                        : typingSpeed + (Math.random() * 20 - 10);
                    timer.current = setTimeout(tick, speed);
                } else {
                    // Done typing this phrase
                    if (isFinal) {
                        setIsNucleus(true);
                        setShowCaption(true);
                        return; // Stop
                    }
                    typing.current = false;
                    timer.current = setTimeout(tick, delayAfterTyping);
                }
            } else {
                // Deleting backward
                let ci = charIdx.current;

                if (ci > 0) {
                    // Skip back over HTML tags
                    if (phrase.charAt(ci - 1) === '>') {
                        while (ci > 0 && phrase.charAt(ci - 1) !== '<') ci--;
                        ci--;
                    }
                    ci = Math.max(0, ci - 1);
                    setText(phrase.substring(0, ci));
                    charIdx.current = ci;

                    const speed = pi === phrases.length - 2 ? 35 : deletingSpeed;
                    timer.current = setTimeout(tick, speed);
                } else {
                    // Done deleting — move to next phrase
                    typing.current = true;
                    phraseIdx.current = pi + 1;
                    charIdx.current = 0;
                    timer.current = setTimeout(tick, delayAfterDeleting);
                }
            }
        };

        // Wait for intro to finish before starting
        const start = () => {
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(tick, typingSpeed);
        };

        if (getIntroPlayed()) {
            start();
        } else {
            const onIntroDone = () => start();
            window.addEventListener("intro-done", onIntroDone, { once: true });
            return () => {
                window.removeEventListener("intro-done", onIntroDone);
                if (timer.current) clearTimeout(timer.current);
            };
        }

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, []);

    return (
        <div className="w-full flex flex-col items-center -translate-y-10 mt-14 relative">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes cursor-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes caption-in {
                    0% { opacity: 0; transform: translateY(8px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes line-expand {
                    0% { width: 0; opacity: 0; }
                    100% { width: 2.5rem; opacity: 1; }
                }
            `}} />

            {/* Phrase counter — editorial detail */}
            {!showCaption && (
                <div className="absolute -top-8 sm:-top-10 right-4 sm:right-0 text-[9px] tracking-[0.15em] text-black/15 dark:text-white/15 font-mono tabular-nums">
                    {String(currentPhrase + 1).padStart(2, '0')}/{String(phrases.length).padStart(2, '0')}
                </div>
            )}

            <div
                id="typing"
                className={`mx-auto w-full max-w-[92vw] sm:max-w-2xl px-1 sm:px-4 text-center ${
                    isNucleus
                        ? "text-[2.5rem] sm:text-7xl lg:text-8xl font-bold leading-none tracking-[0.22em] sm:tracking-[0.35em] text-black dark:text-white [text-shadow:0_0_30px_rgba(0,0,0,1),0_0_60px_rgba(0,0,0,0.8)]"
                        : "text-[15px] sm:text-xl font-normal tracking-tight text-black/90 dark:text-white/90 leading-relaxed [text-shadow:0_0_20px_rgba(0,0,0,1),0_0_40px_rgba(0,0,0,0.9),0_0_80px_rgba(0,0,0,0.7)]"
                }`}
            >
                <span dangerouslySetInnerHTML={{ __html: text }} />
                {!showCaption && (
                    <span
                        style={{ animation: 'cursor-blink 1s steps(1) infinite' }}
                        className="inline-block w-[2px] h-[0.85em] ml-1 align-middle bg-black/40 dark:bg-white/40"
                    />
                )}
            </div>

            {showCaption && (
                <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2 sm:gap-3">
                    <div
                        style={{ animation: 'line-expand 1s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}
                        className="h-px bg-black/15 dark:bg-white/15"
                    />
                    <span
                        style={{ animation: 'caption-in 1s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
                        className="text-[9px] sm:text-sm font-light tracking-[0.3em] sm:tracking-[0.35em] uppercase text-black/60 dark:text-white/70 [text-shadow:0_0_15px_rgba(0,0,0,1),0_0_30px_rgba(0,0,0,0.8)]"
                    >
                        General Intelligence
                    </span>
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { getIntroPlayed } from "./IntroOverlay";

const phrases = [
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn't compressed memory, it's the ability to find those answers in the wind.",
    "NUCLEUS"
];

const typingSpeed = 45;
const deletingSpeed = 16;
const nucleusTypingSpeed = 140;
const delayAfterTyping = 3000;
const delayAfterDeleting = 600;
const commaDelay = 1000;
const periodDelay = 800;

export default function Typewriter() {
    const [text, setText] = useState("");
    const [isNucleus, setIsNucleus] = useState(() => getIntroPlayed());
    const [showCaption, setShowCaption] = useState(() => getIntroPlayed());

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

            if (typing.current) {
                let ci = charIdx.current;
                let ch = phrase.charAt(ci);
                ci++;

                if (ch === '<') {
                    while (ci < phrase.length && phrase.charAt(ci - 1) !== '>') ci++;
                }

                setText(phrase.substring(0, ci));
                charIdx.current = ci;

                if (ci < phrase.length) {
                    const nextCh = phrase.charAt(ci);
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
                        ? nucleusTypingSpeed + (Math.random() * 50 - 25)
                        : typingSpeed + (Math.random() * 20 - 10);
                    timer.current = setTimeout(tick, speed);
                } else {
                    if (isFinal) {
                        setIsNucleus(true);
                        setShowCaption(true);
                        return;
                    }
                    typing.current = false;
                    timer.current = setTimeout(tick, delayAfterTyping);
                }
            } else {
                let ci = charIdx.current;

                if (ci > 0) {
                    if (phrase.charAt(ci - 1) === '>') {
                        while (ci > 0 && phrase.charAt(ci - 1) !== '<') ci--;
                        ci--;
                    }
                    ci = Math.max(0, ci - 1);
                    setText(phrase.substring(0, ci));
                    charIdx.current = ci;

                    const speed = pi === phrases.length - 2 ? 30 : deletingSpeed;
                    timer.current = setTimeout(tick, speed);
                } else {
                    typing.current = true;
                    phraseIdx.current = pi + 1;
                    charIdx.current = 0;
                    timer.current = setTimeout(tick, delayAfterDeleting);
                }
            }
        };

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
        <div className="w-full flex flex-col items-center px-6 sm:px-8">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes cursor-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes caption-in {
                    0% { opacity: 0; transform: translateY(6px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes line-expand {
                    0% { width: 0; opacity: 0; }
                    100% { width: 2.5rem; opacity: 1; }
                }
            `}} />

            <div
                className={`mx-auto w-full text-center ${
                    isNucleus
                        ? "max-w-3xl text-3xl sm:text-6xl lg:text-7xl font-medium leading-none tracking-[0.2em] sm:tracking-[0.3em] text-black dark:text-white"
                        : "max-w-md text-[16px] sm:text-[16px] font-light text-black/70 dark:text-white/65 leading-[1.8]"
                }`}
            >
                <span dangerouslySetInnerHTML={{ __html: text }} />
                {!showCaption && (
                    <span
                        style={{ animation: 'cursor-blink 0.8s steps(1) infinite' }}
                        className={`inline-block align-middle ml-[2px] ${
                            isNucleus
                                ? "w-[3px] h-[0.8em] bg-black/30 dark:bg-white/30"
                                : "w-[6px] h-[16px] sm:h-[18px] bg-black/25 dark:bg-white/25"
                        }`}
                    />
                )}
            </div>

            {showCaption && (
                <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2 sm:gap-2.5">
                    <div
                        style={{ animation: 'line-expand 1s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}
                        className="h-px bg-black/8 dark:bg-white/8"
                    />
                    <span
                        style={{ animation: 'caption-in 1s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
                        className="text-[8px] sm:text-xs font-light tracking-[0.25em] sm:tracking-[0.3em] uppercase text-black/30 dark:text-white/35"
                    >
                        General Intelligence
                    </span>
                </div>
            )}
        </div>
    );
}

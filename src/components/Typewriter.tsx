"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phrases = [
    // "Ayon,asdasd",
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn’t compressed memory, it’s the ability to find those answers in the wind.",
    "The fathers and the prodigies of AI have united, to help AI reach singularity.",
    "NUCLEUS"
];

const prefix = [0, 0, 0, 0, 0, 0];
const commaOverrides: { [key: number]: { [key: number]: number } } = {
    0: { 10: 0 },
};
const fullstopOverrides: { [key: number]: { [key: number]: number } } = {
    5: { 7: 750 }
};

const typingSpeed = 30;
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
    const [isNucleus, setIsNucleus] = useState(false);
    const [showCaption, setShowCaption] = useState(false);

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

        const typeWriter = async () => {
            const currentPhraseIndex = currentPhraseIndexRef.current;
            const currentPhrase = phrases[currentPhraseIndex];

            // Smoother deletion speed curve near the end
            if (currentPhraseIndex === phrases.length - 2) {
                deletingSpeedRef.current = 40; // Less abrupt than 65
            } else {
                deletingSpeedRef.current = normalDeletingSpeed;
            }

            if (isTypingRef.current) {
                if (currentPhraseIndex === phrases.length - 1) {
                    setIsNucleus(true);
                    setText(currentPhrase); // Show NUCLEUS instantly
                    setShowCaption(true); // Trigger framer-motion animation directly
                    return; // Stop the typing loop entirely
                }

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
                    // A tiny bit of randomness for authentic typing effect
                    const randomSpeed = typingSpeed + (Math.random() * 20 - 10);
                    timeoutRef.current = setTimeout(typeWriter, randomSpeed);
                } else {
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

        timeoutRef.current = setTimeout(typeWriter, typingSpeed);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div 
            className="w-full flex mt-14 flex-col items-center -translate-y-10"
        >
            <div
                id="typing"
                style={{ fontFamily: isNucleus ? 'var(--font-playfair), serif' : undefined }}
                className={`mx-auto w-full max-w-[85vw] sm:max-w-md px-2 sm:px-4 text-center tracking-tight origin-center md:leading-normal max-md:leading-[1.35] ${isNucleus ? "text-4xl sm:text-5xl lg:text-7xl font-bold leading-none" : "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] font-inherit text-lg sm:text-xl font-bold"}`}
            >
                {isNucleus ? (
                    <motion.span
                        key="nucleus"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-block"
                    >
                        NUCLEUS
                    </motion.span>
                ) : (
                    <span 
                        id="text" 
                        className="transition-all duration-1000" 
                        dangerouslySetInnerHTML={{ __html: text }}
                    ></span>
                )}
                {!isNucleus && (
                    <motion.span 
                        animate={{ opacity: [1, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="inline-block w-[3px] h-[1.1em] ml-1 align-middle bg-current opacity-80"
                    ></motion.span>
                )}
            </div>
            
            <AnimatePresence>
                {showCaption && (
                    <motion.div 
                        key="caption"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                        className="mt-2 sm:mt-2"
                    >
                        <span
                            className="text-base sm:text-lg text-gray-900 dark:text-gray-100 font-medium tracking-wide"
                        >
                            General Intelligence
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";

const phrases = [
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn’t compressed memory, it’s the ability to find those answers in the wind.",
    "The fathers and the prodigies of AI have united, to help AI reach singularity.",
    //"Perceptive, Creative, Efficient and Self-Evolving Intelligence.",
    "NUCLEUS.",
];

const prefix = [0, 0, 0, 0];
const commaOverrides: { [key: number]: { [key: number]: number } } = {
    0: {
        10: 0,
    },
};
const fullstopOverrides: { [key: number]: { [key: number]: number } } = {
    5: {
        7: 750,
    },
};

const typingSpeed = 30;
const defaultDeletingSpeed = 10;
const delayAfterTyping = 3500;
const delayAfterDeleting = 1500;
const defaultDelayAfterComma = 1500;
const defaultDelayAfterFullStop = 1500;

function isStringWithPause(str: string) {
    const firstCommaIndex = str.indexOf(",");
    const firstFullstopIndex = str.indexOf(".");
    const isValidComma =
        firstCommaIndex === -1
            ? false
            : firstCommaIndex === str.length - 1
                ? false
                : true;
    const isValidFullStop =
        firstFullstopIndex === -1
            ? false
            : firstFullstopIndex === str.length - 1
                ? false
                : true;
    return isValidComma || isValidFullStop;
}

const phrasesWithPause = phrases.map((str) => isStringWithPause(str));

export default function Typewriter() {
    const [text, setText] = useState("");
    const [showCaption, setShowCaption] = useState(false);
    const [showEmail, setShowEmail] = useState(false);

    // Refs to hold mutable state without triggering re-renders for logic
    const currentPhraseIndexRef = useRef(0);
    const letterIndexRef = useRef(0);
    const isTypingRef = useRef(true);
    const deletingSpeedRef = useRef(defaultDeletingSpeed);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const typeWriter = async () => {
            const currentPhraseIndex = currentPhraseIndexRef.current;
            const currentPhrase = phrases[currentPhraseIndex];
            let letterIndex = letterIndexRef.current;

            // Removed font size change logic - keeping consistent sizing

            if (isTypingRef.current) {
                let charToAdd = currentPhrase.charAt(letterIndex);
                letterIndex++;

                // Handling typing of HTML tags
                if (charToAdd === "<") {
                    while (currentPhrase.charAt(letterIndex) !== ">") {
                        charToAdd += currentPhrase.charAt(letterIndex);
                        letterIndex++;
                    }
                    charToAdd += ">";
                    letterIndex++;
                }

                const newText = currentPhrase.substring(0, letterIndex); // Accumulate text correctly
                // Actually, legacy code used += charToAdd. But substring is cleaner for React state.
                // Wait, legacy logic: textElement.innerHTML += charToAdd;
                // In React, setText(prev => prev + charToAdd) works, but we need to track accumulated text.
                // Easier to just use substring from 0 to letterIndex.

                // Wait, the logic for HTML tags in legacy:
                // charToAdd includes the whole tag.
                // So substring logic needs to account for tags if we use substring.
                // Let's stick to the legacy accumulation logic but applied to `text` state?
                // No, `text` state is reset on delete.

                // Let's rely on `setText` updating the display.
                // Current implementation uses text accumulation.

                // For consistency with legacy logic:
                // The legacy loop adds one char (or tag) at a time.
                // We can replicate that by updating state.

                // However, setting state is async. The Ref `letterIndex` is sync.
                // So we can compute the string to display based on `letterIndex`.
                // But since we skip over tags, `letterIndex` jumps.
                // Legacy: `textElement.innerHTML += charToAdd`

                // Let's just use the legacy logic path but update state.

                setText((prev) => {
                    // This is tricky because `prev` might not be up to date in the closure if we read it outside.
                    // But we can rebuild expected text from `currentPhrase` and `letterIndex`.
                    // The `letterIndex` includes the skipped tag chars.
                    return currentPhrase.substring(0, letterIndex);
                });

                letterIndexRef.current = letterIndex;

                if (letterIndex < currentPhrase.length) {
                    if (phrasesWithPause[currentPhraseIndex]) {
                        const char = currentPhrase.charAt(letterIndex - (charToAdd.length > 1 ? 0 : 0));
                        // Wait, letterIndex is already incremented.
                        // In legacy: 
                        // charToAdd = currentPhrase.charAt(letterIndex); letterIndex++; ... textElement.innerHTML += charToAdd;
                        // then: if (currentPhrase.charAt(letterIndex) === ',')

                        // My port:
                        // let charToAdd = ...; letterIndex++
                        // ...
                        // setText(...)
                        // if (letterIndex < length) ... check char at letterIndex

                        // This matches legacy.

                        if (currentPhrase.charAt(letterIndex) === ",") {
                            setText(prev => prev + ",");
                            letterIndexRef.current++;
                            let delay =
                                commaOverrides[currentPhraseIndex]?.[letterIndex] ??
                                defaultDelayAfterComma;
                            timeoutRef.current = setTimeout(typeWriter, delay);
                            return;
                        } else if (currentPhrase.charAt(letterIndex) === ".") {
                            setText(prev => prev + ".");
                            letterIndexRef.current++;
                            let delay =
                                fullstopOverrides[currentPhraseIndex]?.[letterIndex] ??
                                defaultDelayAfterFullStop;
                            timeoutRef.current = setTimeout(typeWriter, delay);
                            return;
                        }
                    }
                    timeoutRef.current = setTimeout(typeWriter, typingSpeed);
                } else {
                    if (currentPhraseIndex === phrases.length - 1) {
                        // Done
                        setTimeout(() => setShowCaption(true), 1000);
                        setTimeout(() => setShowEmail(true), 3000); // 1s delay + 2s animation -> legacy said "2s after showing caption"
                    } else {
                        isTypingRef.current = false;
                        timeoutRef.current = setTimeout(typeWriter, delayAfterTyping);
                    }
                }
            } else {
                // Deleting
                if (letterIndex > prefix[currentPhraseIndex]) {
                    // Handling deletion of HTML tags
                    if (currentPhrase.charAt(letterIndex - 1) === ">") {
                        while (
                            letterIndex > 0 &&
                            currentPhrase.charAt(letterIndex - 1) !== "<"
                        ) {
                            letterIndex--;
                        }
                        letterIndex--;
                    }

                    letterIndex--;
                    letterIndexRef.current = letterIndex;

                    // Legacy: textElement.innerHTML = currentPhrase.substring(0, letterIndex - 1); -> wait, `letterIndex - 1`?
                    // Legacy logic: 
                    // letterIndex--;
                    // textElement.innerHTML = currentPhrase.substring(0, letterIndex - 1);
                    // NO, legacy was:
                    // textElement.innerHTML = currentPhrase.substring(0, letterIndex - 1);
                    // letterIndex--;

                    // Wait, if letterIndex is 5.
                    // substring(0, 4) gets 0,1,2,3.

                    // My logic:
                    // letterIndex--;
                    // Use substring(0, letterIndex).

                    setText(currentPhrase.substring(0, letterIndex));
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
        <>
            <div id="typing" className={text === "NUCLEUS." ? "final-text" : ""}>
                <span id="text" dangerouslySetInnerHTML={{ __html: text }}></span>
                <span className="cursor"></span>
            </div>
            <div>
                <span
                    id="caption"
                    className={showCaption ? "fadeInAnimation" : ""}
                    style={{ opacity: showCaption ? 1 : 0 }} // Keep explicit or let class handle it?
                // Legacy: classList.add('fadeInAnimation'), style opacity initially 0.
                // Animation @keyframes fadeIn goes 0 to 1.
                // If we apply class, it animates.
                >
                    General Intelligence
                </span>
            </div>

        </>
    );
    // Note: legacy code changed font size for "NUCLEUS AI" and "NUCLEUS." (phrases.length - 2)
    // My check `text === ...` is a bit loose, better store the index in state if we want to style based on index?
    // But doing it via inline style or class wrapper is better.
    // Actually, legacy modified `textElement.style.fontSize`.
}

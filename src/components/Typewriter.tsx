"use client";

import { useEffect, useState, useRef } from "react";

const phrases = [
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn’t compressed memory, it’s the ability to find those answers in the wind.",
    "The fathers and the prodigies of AI have united, to help AI reach singularity.",
    //"Perceptive, Creative, Efficient and Self-Evolving Intelligence.",
    "NUCLEUS AI",
    "NUCLEUS."
];

const prefix = [0, 0, 0, 0, 0, 0];
const commaOverrides: { [key: number]: { [key: number]: number } } = {
    0: {
        10: 0,
    },
};
const fullstopOverrides: { [key: number]: { [key: number]: number } } = {
    5: {
        7: 750,
    }
};

const typingSpeed = 30;
const normalDeletingSpeed = 10;
const delayAfterTyping = 3500;
const delayAfterDeleting = 1500;
const defaultDelayAfterComma = 1500;
const defaultDelayAfterFullStop = 1500;

function isStringWithPause(str: string) {
    const firstCommaIndex = str.indexOf(',');
    const firstFullstopIndex = str.indexOf('.');
    const isValidComma = firstCommaIndex === -1 ? false : firstCommaIndex === str.length - 1 ? false : true;
    const isValidFullStop = firstFullstopIndex === -1 ? false : firstFullstopIndex === str.length - 1 ? false : true;
    return isValidComma || isValidFullStop;
}

const phrasesWithPause = phrases.map((str) => isStringWithPause(str));

export default function Typewriter() {
    const [text, setText] = useState("");
    const [fontSize, setFontSize] = useState<string | undefined>(undefined);
    const [showCaption, setShowCaption] = useState(false);

    const currentPhraseIndexRef = useRef(0);
    const letterIndexRef = useRef(0);
    const isTypingRef = useRef(true);
    const deletingSpeedRef = useRef(normalDeletingSpeed);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Reset state on mount
        currentPhraseIndexRef.current = 0;
        letterIndexRef.current = 0;
        isTypingRef.current = true;
        deletingSpeedRef.current = normalDeletingSpeed;
        setText("");
        setFontSize(undefined);
        setShowCaption(false);
        setShowCaption(false);

        const typeWriter = async () => {
            const currentPhraseIndex = currentPhraseIndexRef.current;
            const currentPhrase = phrases[currentPhraseIndex];

            // Legacy: if (currentPhraseIndex === phrases.length - 2) deletingSpeed = 65;
            if (currentPhraseIndex === phrases.length - 2) {
                deletingSpeedRef.current = 65;
            }

            if (isTypingRef.current) {
                // Legacy: if (currentPhraseIndex === phrases.length - 2) textElement.style.fontSize = '4rem';
                if (currentPhraseIndex === phrases.length - 2) {
                    setFontSize('4rem');
                }

                let letterIndex = letterIndexRef.current;
                let charToAdd = currentPhrase.charAt(letterIndex);
                letterIndex++;

                // Handling typing of HTML tags
                if (charToAdd === '<') {
                    while (currentPhrase.charAt(letterIndex) !== '>') {
                        charToAdd += currentPhrase.charAt(letterIndex);
                        letterIndex++;
                    }
                    charToAdd += '>';
                    letterIndex++;
                }

                // Update text
                // In legacy: textElement.innerHTML += charToAdd;
                // Here we reconstruct the string up to the new letterIndex
                // Note: currentPhrase.substring(0, letterIndex) handles the tags correctly as they are part of the string indices
                setText(currentPhrase.substring(0, letterIndex));

                letterIndexRef.current = letterIndex;

                if (letterIndex < currentPhrase.length) {
                    if (phrasesWithPause[currentPhraseIndex]) {
                        // Check char at current position (which was just added? No, wait)
                        // Legacy: 
                        // charToAdd = ...; letterIndex++
                        // textElement.innerHTML += charToAdd;
                        // if (currentPhrase.charAt(letterIndex) === ',') ...
                        // Wait, legacy checks `currentPhrase.charAt(letterIndex)` AFTER incrementing.
                        // So it checks the NEXT char?

                        // Let's re-read legacy carefully:
                        // 58: let charToAdd = currentPhrase.charAt(letterIndex);
                        // 59: letterIndex++;
                        // ...
                        // 71: textElement.innerHTML += charToAdd;
                        // 73: if (letterIndex < currentPhrase.length) {
                        // 75:    if (currentPhrase.charAt(letterIndex) === ',') {
                        // 76:        textElement.innerHTML += ',';

                        // Ah! If the NEXT char is a comma, it adds it immediately and pauses.
                        // So the comma is NOT typed in the normal loop step, it's peeked and added.
                        // Wait, if it adds it, does it increment letterIndex again?
                        // 79: letterIndex++;
                        // Yes.

                        const nextChar = currentPhrase.charAt(letterIndex);
                        if (nextChar === ',') {
                            setText(prev => prev + ',');
                            letterIndexRef.current++;
                            let delay = commaOverrides[currentPhraseIndex]?.[letterIndex] ?? defaultDelayAfterComma;
                            timeoutRef.current = setTimeout(typeWriter, delay);
                            return;
                        } else if (nextChar === '.') {
                            setText(prev => prev + '.');
                            letterIndexRef.current++;
                            let delay = fullstopOverrides[currentPhraseIndex]?.[letterIndex] ?? defaultDelayAfterFullStop;
                            timeoutRef.current = setTimeout(typeWriter, delay);
                            return;
                        }
                    }
                    timeoutRef.current = setTimeout(typeWriter, typingSpeed);
                } else {
                    if (currentPhraseIndex === phrases.length - 1) {
                        // Finished
                        setTimeout(() => setShowCaption(true), 1000); // 1s delay
                    } else {
                        isTypingRef.current = false;
                        timeoutRef.current = setTimeout(typeWriter, delayAfterTyping);
                    }
                }
            } else {
                // Deleting
                let letterIndex = letterIndexRef.current;

                if (letterIndex > prefix[currentPhraseIndex]) {
                    // Handling deletion of HTML tags
                    if (currentPhrase.charAt(letterIndex - 1) === '>') {
                        while (letterIndex > 0 && currentPhrase.charAt(letterIndex - 1) !== '<') {
                            letterIndex--;
                        }
                        letterIndex--;
                    }

                    // Legacy: textElement.innerHTML = currentPhrase.substring(0, letterIndex - 1); 
                    // letterIndex--;

                    // Logic check: if letterIndex is 5. 
                    // substring(0, 4). Correct.

                    setText(currentPhrase.substring(0, letterIndex - 1));
                    letterIndex--;
                    letterIndexRef.current = letterIndex;

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
            <div
                id="typing"
                style={fontSize ? { fontSize } : undefined}
                className={`mx-auto w-full max-w-48 sm:max-w-68 px-3 text-center sm:max-w-xl sm:px-4 ${text === "NUCLEUS." ? "final-text" : ""}`}
            >
                <span id="text" dangerouslySetInnerHTML={{ __html: text }}></span>
                <span className="cursor"></span>
            </div>
            <div>
                <span
                    id="caption"
                    className={showCaption ? "fadeInAnimation" : ""}
                    style={{ animationDelay: '1s', opacity: 0 }}
                >
                    General Intelligence
                </span>
            </div>
        </>
    );
}

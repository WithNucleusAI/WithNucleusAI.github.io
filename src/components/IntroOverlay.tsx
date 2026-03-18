"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

/**
 * Extended Window interface to handle global intro state without 'any'
 */
interface ExtendedWindow extends Window {
  __globalIntroPlayed?: boolean;
}

const phrases = [
  "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
  "Intelligence isn’t compressed memory, it’s the ability to find those answers in the wind.",
  "The fathers and the prodigies of AI have united, to help AI reach singularity.",
  "NUCLEUS AI",
  "NUCLEUS."
];

const prefix = [0, 0, 0, 0, 0];

interface OverrideMap {
  [phraseIndex: number]: {
    [charIndex: number]: number;
  };
}

const commaOverrides: OverrideMap = {
  0: { 10: 0 },
};

const fullstopOverrides: OverrideMap = {
  4: { 7: 750 },
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
  const isValidComma = firstCommaIndex !== -1 && firstCommaIndex !== str.length - 1;
  const isValidFullStop = firstFullstopIndex !== -1 && firstFullstopIndex !== str.length - 1;
  return isValidComma || isValidFullStop;
}

const phrasesWithPause = phrases.map((str) => isStringWithPause(str));

let globalIntroPlayed = false;

/**
 * Global helper functions for intro state
 */
export function setIntroPlayed() {
  globalIntroPlayed = true;
  if (typeof window !== 'undefined') {
    (window as ExtendedWindow).__globalIntroPlayed = true;
    window.dispatchEvent(new Event('intro-done'));
  }
}

export function getIntroPlayed(): boolean {
  if (typeof window !== 'undefined') {
    return (window as ExtendedWindow).__globalIntroPlayed || false;
  }
  return globalIntroPlayed;
}

export default function IntroOverlay() {
  /**
   * FIX: Lazy initialization prevents "cascading renders" error.
   * State is calculated once during the initial mount phase.
   */
  const [hasMounted, setHasMounted] = useState(false);

  const [step, setStep] = useState<'typing' | 'fading' | 'done'>('typing');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasMounted(true);
      if (getIntroPlayed()) {
        setStep('done');
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState<string | undefined>(undefined);

  const currentPhraseIndexRef = useRef(0);
  const letterIndexRef = useRef(0);
  const isTypingRef = useRef(true);
  const deletingSpeedRef = useRef(normalDeletingSpeed);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishIntro = useCallback(() => {
    setStep('fading');
    setIntroPlayed();
    setTimeout(() => {
      setStep('done');
    }, 1000);
  }, []);

  const handleDiscoverClick = () => {
    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch((e) => console.error("Audio play failed:", e));
    }
    finishIntro();
  };

  useEffect(() => {
    if (step !== 'typing') return;

    // Reset loop state
    currentPhraseIndexRef.current = 0;
    letterIndexRef.current = 0;
    isTypingRef.current = true;
    deletingSpeedRef.current = normalDeletingSpeed;

    const typeWriter = () => {
      if (step !== 'typing') return;

      const currentPhraseIndex = currentPhraseIndexRef.current;
      const currentPhrase = phrases[currentPhraseIndex];

      if (currentPhraseIndex === phrases.length - 2) {
        deletingSpeedRef.current = 65;
      }

      if (isTypingRef.current) {
        if (currentPhraseIndex === phrases.length - 2) {
          setFontSize('4rem');
        }

        let letterIndex = letterIndexRef.current;
        let charToAdd = currentPhrase.charAt(letterIndex);
        letterIndex++;

        // Handle HTML Tags
        if (charToAdd === '<') {
          while (letterIndex < currentPhrase.length && currentPhrase.charAt(letterIndex) !== '>') {
            charToAdd += currentPhrase.charAt(letterIndex);
            letterIndex++;
          }
          charToAdd += '>';
          letterIndex++;
        }

        const newText = currentPhrase.substring(0, letterIndex);
        setText(newText);
        letterIndexRef.current = letterIndex;

        if (letterIndex < currentPhrase.length) {
          if (phrasesWithPause[currentPhraseIndex]) {
            const nextChar = currentPhrase.charAt(letterIndex);
            if (nextChar === ',') {
              setText(newText + ',');
              letterIndexRef.current++;
              const delay = commaOverrides[currentPhraseIndex]?.[letterIndexRef.current] ?? defaultDelayAfterComma;
              timeoutRef.current = setTimeout(typeWriter, delay);
              return;
            } 
            if (nextChar === '.') {
              setText(newText + '.');
              letterIndexRef.current++;
              const delay = fullstopOverrides[currentPhraseIndex]?.[letterIndexRef.current] ?? defaultDelayAfterFullStop;
              timeoutRef.current = setTimeout(typeWriter, delay);
              return;
            }
          }
          timeoutRef.current = setTimeout(typeWriter, typingSpeed);
        } else {
          // Check if this is the final phrase
          if (currentPhraseIndex === phrases.length - 1) {
            timeoutRef.current = setTimeout(finishIntro, 1000);
          } else {
            isTypingRef.current = false;
            timeoutRef.current = setTimeout(typeWriter, delayAfterTyping);
          }
        }
      } else {
        // Deleting Logic
        let letterIndex = letterIndexRef.current;

        if (letterIndex > prefix[currentPhraseIndex]) {
          if (currentPhrase.charAt(letterIndex - 1) === '>') {
            while (letterIndex > 0 && currentPhrase.charAt(letterIndex - 1) !== '<') {
              letterIndex--;
            }
            letterIndex--;
          }

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
  }, [step, finishIntro]);

  // Server-side safety or initial loading state
  if (!hasMounted) {
    return <div className="fixed inset-0 z-100 bg-white dark:bg-black" />;
  }

  if (step === 'done') {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-60 flex flex-col items-center justify-center bg-white dark:bg-black transition-opacity duration-1000 
      ${step === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 transistion-opacity duration-1000">
        <Image src="/logo.png" alt="Nucleus Logo" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 invert dark:invert-0 object-contain" />
      </div>

      <div className={`w-full flex flex-col items-center -translate-y-10 transition-transform duration-1000 ease-in-out ${text === "NUCLEUS." ? "-translate-y-12 sm:-translate-y-12 lg:-translate-y-16" : ""}`}>

        <div
          id="typing"
          style={fontSize ? { fontSize: `clamp(1.8rem, 6vw, ${fontSize})` } : undefined}
          className={`mx-auto w-full max-w-[50vw] sm:max-w-xl px-2 sm:px-4 text-center ${text === "NUCLEUS." ? "final-text" : ""}`}
        >
          <span dangerouslySetInnerHTML={{ __html: text }}></span>
          <span className="cursor"></span>
        </div>
      </div>

      <button 
        type="button"
        onClick={handleDiscoverClick}
        style={{ position: 'fixed', bottom: '20vh', left: '50%', transform: 'translateX(-50%)' }}
        className="px-8 py-3 border border-[rgb(10,10,10)] dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md uppercase tracking-[0.2em] font-light transition-colors z-101"
      >
        Discover
      </button>
    </div>
  );
}
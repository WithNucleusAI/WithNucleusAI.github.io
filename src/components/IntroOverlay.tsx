"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

/**
 * Extended Window interface to handle global intro state without 'any'
 */
interface ExtendedWindow extends Window {
  __globalIntroPlayed?: boolean;
}

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
  const [hasMounted, setHasMounted] = useState(false);
  const [step, setStep] = useState<'showing' | 'fading' | 'done'>('showing');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasMounted(true);
      if (getIntroPlayed()) {
        setStep('done');
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const finishIntro = useCallback(() => {
    setStep('fading');
    const tId = setTimeout(() => {
      setStep('done');
      setIntroPlayed();
    }, 1000);
    return () => clearTimeout(tId);
  }, []);

  const handleDiscoverClick = () => {
    const audio = document.getElementById("bg-music") as HTMLAudioElement | null;
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch((e) => console.error("Audio play failed:", e));
    }
    finishIntro();
  };

  // Server-side safety or initial loading state
  if (!hasMounted) {
    return <div className="fixed inset-0 z-[100] bg-white dark:bg-black" />;
  }

  if (step === 'done') {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white dark:bg-black transition-opacity duration-1000 
      ${step === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="absolute top-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000">
        <Image src="/logo.png" alt="Nucleus Logo" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 invert dark:invert-0 object-contain" />
      </div>

      <div className="w-full flex flex-col items-center -translate-y-12 sm:!-translate-y-12 lg:!-translate-y-16 transition-transform duration-1000 ease-in-out">
        <div
          style={{fontFamily: 'var(--font-geist-mono)' }}
          className="mx-auto w-full text-3xl max-w-[50vw] text-neutral-700 sm:max-w-xl   px-2 sm:px-4 text-center final-text"
        >
          <span>NUCLEUS</span>
        </div>
        <div className="mt-4 text-center">
          <span className="text-lg text-gray-400 sm:text-xl font-light tracking-wider opacity-80" style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
            General Intelligence
          </span>
        </div>
      </div>

      {/* <button 
        type="button"
        onClick={handleDiscoverClick}
        style={{ position: 'fixed', bottom: '20vh', left: '50%', transform: 'translateX(-50%)' }}
        className="px-8 py-3 border border-[rgb(10,10,10)] cursor-pointer dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md uppercase tracking-[0.2em] font-light transition-colors z-[101]"
      >
        Discover
      </button> */}
      <button 
        type="button"
        onClick={handleDiscoverClick}
        style={{ position: 'fixed', bottom: '20vh', left: '50%', transform: 'translateX(-50%)' }}
        className="btn btn--playground relative overflow-hidden rounded-full z-[101] cursor-pointer"
      >
        <div className='absolute inset-0 -z-10 backdrop-blur-md bg-white/80 dark:bg-black/80 rounded-full' />

        <div className='btn__content flex items-center justify-center gap-2 w-full h-full absolute top-0 left-0 z-10 pointer-events-none'>
          <span className='text-sm uppercase tracking-[0.2em] font-light'>
            DISCOVER
          </span>
        </div>

        <svg
          className='btn__fill-layer absolute top-0 left-0 w-full h-full pointer-events-none'
          viewBox='0 0 190 50'
          preserveAspectRatio="none"
        >

          <circle
            className='btn__fill-circle fill-black dark:fill-white'
            cx="95"
            cy="25"
            r="95"
          />
        </svg>

        <svg
          className='btn__border-layer absolute top-0 left-0 w-full h-full pointer-events-none'
          viewBox='0 0 190 50'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            className='btn__border-path btn__border-path--left stroke-black dark:stroke-white'
            d="M95 49 L25 49 A24 24 0 0 1 25 1 L95 1"
          />
          <path
            className='btn__border-path btn__border-path--right stroke-black dark:stroke-white'
            d="M95 49 L165 49 A24 24 0 0 0 165 1 L95 1"
          />
        </svg>

      </button>

    </div>
  );
}

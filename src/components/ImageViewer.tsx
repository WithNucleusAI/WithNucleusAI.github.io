'use client';

import { useEffect, useRef, useState } from 'react';

interface ImageViewerProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
}

export default function ImageViewer({ images, currentIndex, onClose }: ImageViewerProps) {
    const [index, setIndex] = useState(currentIndex);
    const touchStartX = useRef<number | null>(null);
    const touchCurrentX = useRef<number | null>(null);

    useEffect(() => {
        setIndex(currentIndex);
    }, [currentIndex]);

    // Lock scroll while the lightbox is open (including iOS behavior)
    useEffect(() => {
        const scrollY = window.scrollY;
        const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

        const previousBodyStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
            paddingRight: document.body.style.paddingRight,
        };

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        if (scrollbarGap > 0) {
            document.body.style.paddingRight = `${scrollbarGap}px`;
        }

        return () => {
            document.body.style.overflow = previousBodyStyle.overflow;
            document.body.style.position = previousBodyStyle.position;
            document.body.style.top = previousBodyStyle.top;
            document.body.style.width = previousBodyStyle.width;
            document.body.style.paddingRight = previousBodyStyle.paddingRight;
            window.scrollTo(0, scrollY);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            } else if (e.key === 'ArrowRight') {
                setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [images.length, onClose]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].clientX;
        touchCurrentX.current = e.changedTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchCurrentX.current = e.changedTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current == null || touchCurrentX.current == null) {
            return;
        }

        const deltaX = touchStartX.current - touchCurrentX.current;

        if (deltaX > 30) {
            // Swipe left - go to next
            goToNext();
        }

        if (deltaX < -30) {
            // Swipe right - go to previous
            goToPrevious();
        }

        touchStartX.current = null;
        touchCurrentX.current = null;
    };

    const goToPrevious = () => {
        setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black/90 md:backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_46%)]" />

            {/* Close button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-black/35 text-3xl font-light leading-none text-white transition-all hover:bg-black/55 active:scale-95"
                aria-label="Close"
            >
                ×
            </button>

            {/* Image counter */}
            <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-xs tracking-wide text-white/90 md:text-sm">
                {index + 1} / {images.length}
            </div>

            {/* Image */}
            <div className="relative flex flex-1 items-center justify-center px-4 pb-3 pt-16">
                <div
                    className="relative flex h-full max-h-[78vh] w-full max-w-6xl items-center justify-center rounded-2xl border border-white/20 bg-white/5 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] md:p-4"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={images[index]}
                        alt={`Image ${index + 1}`}
                        className="max-h-full max-w-full select-none object-contain"
                    />
                </div>
            </div>

            {/* Navigation controls */}
            {images.length > 1 && (
                <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
                    <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/25 bg-black/40 md:backdrop-blur-md shadow-2xl">
                        <div className="flex items-center justify-between gap-2 p-2 sm:p-3">
                            <button
                                type="button"
                                onClick={goToPrevious}
                                className="touch-manipulation flex min-h-11 min-w-[6.8rem] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-4 py-2 text-white transition-all hover:bg-white/15 active:scale-95"
                                aria-label="Previous image"
                            >
                                <span className="text-lg leading-none">←</span>
                                <span className="text-sm font-medium">Prev</span>
                            </button>

                            <div className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/90 sm:text-sm">
                                {index + 1} / {images.length}
                            </div>

                            <button
                                type="button"
                                onClick={goToNext}
                                className="touch-manipulation flex min-h-11 min-w-[6.8rem] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-4 py-2 text-white transition-all hover:bg-white/15 active:scale-95"
                                aria-label="Next image"
                            >
                                <span className="text-sm font-medium">Next</span>
                                <span className="text-lg leading-none">→</span>
                            </button>
                        </div>

                        <div className="px-3 pb-3">
                            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
                                {images.map((_, dotIndex) => (
                                    <button
                                        key={dotIndex}
                                        type="button"
                                        onClick={() => setIndex(dotIndex)}
                                        className={`h-2.5 rounded-full transition-all ${dotIndex === index ? 'w-7 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
                                        aria-label={`Go to image ${dotIndex + 1}`}
                                        aria-current={dotIndex === index ? 'true' : undefined}
                                    />
                                ))}
                            </div>

                            <p className="mt-1 text-center text-[11px] text-white/65 sm:text-xs">
                                Swipe the image or use the buttons
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

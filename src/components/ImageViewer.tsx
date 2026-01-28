'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface ImageViewerProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
}

export default function ImageViewer({ images, currentIndex, onClose }: ImageViewerProps) {
    const [index, setIndex] = useState(currentIndex);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    useEffect(() => {
        setIndex(currentIndex);
    }, [currentIndex]);

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
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 25) {
            // Swipe left - go to next
            goToNext();
        }

        if (touchStart - touchEnd < -25) {
            // Swipe right - go to previous
            goToPrevious();
        }
    };

    const goToPrevious = () => {
        setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-4xl font-light hover:text-gray-300 transition-colors z-10 w-10 h-10 flex items-center justify-center"
                aria-label="Close"
            >
                ×
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm z-10">
                {index + 1} / {images.length}
            </div>

            {/* Previous button - hidden on mobile, visible on desktop */}
            {images.length > 1 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToPrevious();
                    }}
                    className="absolute left-4 text-white text-5xl font-light hover:text-gray-300 transition-colors hidden md:block"
                    aria-label="Previous image"
                >
                    ‹
                </button>
            )}

            {/* Image */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[index]}
                    alt={`Image ${index + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                />
            </div>

            {/* Next button - hidden on mobile, visible on desktop */}
            {images.length > 1 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                    }}
                    className="absolute right-4 text-white text-5xl font-light hover:text-gray-300 transition-colors hidden md:block"
                    aria-label="Next image"
                >
                    ›
                </button>
            )}

            {/* Swipe indicator for mobile */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-50 md:hidden">
                Swipe to navigate
            </div>
        </div>
    );
}

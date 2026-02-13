
"use client";

import { useEffect, useRef, useState } from "react";

export default function EscherBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const image = new Image();
        image.src = "/images/fish.jpg";


        let animationFrameId: number;
        let time = 0;

        // Configuration
        const gap = 6; // Distance between dots
        const baseRadius = 2; // Max radius of dots

        // Speed: pixels per frame the image scrolls to the right
        const scrollSpeed = 0.8;

        const render = () => {
            if (!canvas || !ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate aspect ratio to cover the canvas
            const imgAspect = image.width / image.height;
            const canvasAspect = canvas.width / canvas.height;

            let drawWidth, drawHeight, offsetY;

            if (canvasAspect > imgAspect) {
                drawWidth = canvas.width;
                drawHeight = canvas.width / imgAspect;
                offsetY = (canvas.height - drawHeight) / 2;
            } else {
                drawHeight = canvas.height;
                drawWidth = canvas.height * imgAspect;
                offsetY = 0;
            }

            // Horizontal scroll offset — wraps circularly using modulo
            time += scrollSpeed;
            const scrollOffset = time % drawWidth;

            // Draw image to a temporary canvas to read pixels.
            // Draw it TWICE side-by-side so that when it scrolls off the
            // right edge, the copy seamlessly fills in from the left (deque).
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;

            // First copy — shifted right by scrollOffset
            tempCtx.drawImage(image, scrollOffset, offsetY, drawWidth, drawHeight);
            // Second copy — fills the gap on the left
            tempCtx.drawImage(image, scrollOffset - drawWidth, offsetY, drawWidth, drawHeight);

            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;

            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";

            // Render dots based on the scrolled image
            for (let y = 0; y < canvas.height; y += gap) {
                for (let x = 0; x < canvas.width; x += gap) {
                    const index = (y * canvas.width + x) * 4;

                    if (index + 2 >= data.length) continue;

                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    const brightness = (r + g + b) / 3;

                    // Darker pixels = larger dots
                    if (brightness < 240) {
                        const sizeFactor = (255 - brightness) / 255;
                        const dotSize = sizeFactor * baseRadius;

                        if (dotSize > 0.5) {
                            ctx.beginPath();
                            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        const handleResize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };

        image.onload = () => {
            setIsLoaded(true);
            handleResize();
            render();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full -z-10 bg-white/50 dark:bg-neutral-900/50 pointer-events-none">
            <canvas
                ref={canvasRef}
                className="block w-full h-full opacity-60 dark:invert contrast-125 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000"
                style={{ opacity: isLoaded ? 0.6 : 0 }}
            />
            {/* Vignette effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(255,255,255,0.9)_100%)] dark:bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
        </div>
    );
}

"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    speed: number;
    color: string;
    size: number;
    state: 'raw' | 'filtered' | 'structured';
    targetY?: number;
}

interface Props {
    isHovered: boolean;
}

const DataStreamAnimation: React.FC<Props> = ({ isHovered }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Color configuration
    const rawColor = "rgba(150, 150, 150, 0.6)";
    const filteredColor = "rgba(255, 165, 0, 0.8)"; // Orange-ish for filtered/processing
    const structuredColor = "rgba(59, 130, 246, 0.9)"; // Blue for structured

    // Hover boost
    const hoverSpeedMultiplier = 1.5;

    // Use a ref to track hover state without re-triggering effects
    const hoverRef = useRef(isHovered);
    useEffect(() => {
        hoverRef.current = isHovered;
    }, [isHovered]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let frameCount = 0;

        const resizeCanvas = () => {
            if (!canvasRef.current || !containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        };

        const createParticle = (width: number, height: number): Particle => {
            return {
                x: -10,
                y: Math.random() * height,
                speed: 1 + Math.random() * 2,
                color: rawColor,
                size: 1.5 + Math.random(),
                state: 'raw'
            };
        };

        const draw = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const filterX = width * 0.4;
            const structureX = width * 0.75;
            const currentHover = hoverRef.current;

            // Guides
            ctx.beginPath();
            ctx.moveTo(filterX, 0);
            ctx.lineTo(filterX, height);
            ctx.strokeStyle = "rgba(100, 100, 100, 0.1)";
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
            ctx.fillRect(structureX, 0, width - structureX, height);

            if (frameCount % 6 === 0) {
                particles.push(createParticle(width, height));
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                const factor = currentHover ? 1.5 : 1.0;
                p.x += p.speed * factor;

                if (p.state === 'raw' && p.x > filterX) {
                    if (Math.random() > 0.7) {
                        particles.splice(i, 1);
                        continue;
                    } else {
                        p.state = 'filtered';
                        p.color = filteredColor;
                        const rows = 8;
                        const rowHeight = height / rows;
                        const targetRow = Math.floor(p.y / rowHeight);
                        p.targetY = targetRow * rowHeight + rowHeight / 2;
                    }
                }

                if (p.state === 'filtered' && p.x > structureX) {
                    p.state = 'structured';
                    p.color = structuredColor;
                }

                if (p.state === 'filtered' && p.targetY !== undefined) {
                    p.y += (p.targetY - p.y) * 0.08;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                if (p.x > width + 10) {
                    particles.splice(i, 1);
                }
            }

            frameCount++;
            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        draw();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden">
            {/* <div className="absolute top-4 left-4 text-xs font-mono text-gray-400">DATA_PIPELINE_VIZ // INGEST-FILTER-STORE</div> */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

export default DataStreamAnimation;

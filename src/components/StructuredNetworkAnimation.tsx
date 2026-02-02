"use client";

import React, { useEffect, useRef } from "react";

interface Node {
    x: number;
    y: number;
    id: string;
}

interface Signal {
    from: Node;
    to: Node;
    progress: number;
    speed: number;
}

interface Props {
    isHovered: boolean;
}

const StructuredNetworkAnimation: React.FC<Props> = ({ isHovered }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Color configuration
    const normalNodeColor = "rgba(150, 150, 150, 1)";
    const activeNodeColor = "rgba(59, 130, 246, 1)"; // Blue-500
    const normalLineColor = "rgba(100, 100, 100, 0.1)";
    const activeLineColor = "rgba(59, 130, 246, 0.2)";

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let signals: Signal[] = [];

        const layers = [2, 5, 7, 5, 2];
        let nodes: Node[][] = [];

        const resizeCanvas = () => {
            if (!canvasRef.current || !containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
            initNetwork();
        };

        const initNetwork = () => {
            nodes = [];
            const width = canvas.width;
            const height = canvas.height;
            const layerCount = layers.length;
            const layerSpacing = width / (layerCount + 1);

            layers.forEach((nodeCount, layerIndex) => {
                const layerNodes: Node[] = [];
                const x = layerSpacing * (layerIndex + 1);
                const verticalSpacing = height / (nodeCount + 1);

                for (let i = 0; i < nodeCount; i++) {
                    layerNodes.push({
                        x: x,
                        y: verticalSpacing * (i + 1),
                        id: `l${layerIndex}_n${i}`
                    });
                }
                nodes.push(layerNodes);
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // We read the ref/prop directly in the loop or passed down?
            // Since isHovered is a prop, we need to use the latest value in the closure. 
            // The current implementation re-runs effect on isHovered change? 
            // No, that would reset signals. We should use a ref for isHovered to access inside draw loop without resetting.
            // But for now let's just use the color variables which will update if we re-render?
            // Actually if I put `isHovered` in dependency array, it resets the network.
            // I should store `isHovered` in a ref.
        };

        // ...
        // To fix the ref issue properly:

    }, []); // We don't want to reset on isHovered.

    // Use a ref to track hover state for the animation loop
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
        let signals: Signal[] = [];
        const layers = [2, 5, 7, 5, 2];
        let nodes: Node[][] = [];

        const resizeCanvas = () => {
            if (!containerRef.current) return;
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
            initNetwork();
        };

        const initNetwork = () => {
            nodes = [];
            const width = canvas.width;
            const height = canvas.height;
            const layerSpacing = width / (layers.length + 1);
            layers.forEach((count, idx) => {
                const layerNodes = [];
                const x = layerSpacing * (idx + 1);
                const vSpacing = height / (count + 1);
                for (let i = 0; i < count; i++) {
                    layerNodes.push({ x, y: vSpacing * (i + 1), id: `${idx}_${i}` });
                }
                nodes.push(layerNodes);
            });
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentHover = hoverRef.current;
            const nodeColor = currentHover ? activeNodeColor : normalNodeColor;
            const lineColor = currentHover ? activeLineColor : normalLineColor;

            // Connections
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = lineColor;
            for (let i = 0; i < nodes.length - 1; i++) {
                nodes[i].forEach(n1 => {
                    nodes[i + 1].forEach(n2 => {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    });
                });
            }

            // Signals
            if (Math.random() < 0.05) {
                if (nodes.length > 1) {
                    const start = nodes[0][Math.floor(Math.random() * nodes[0].length)];
                    const end = nodes[1][Math.floor(Math.random() * nodes[1].length)];
                    signals.push({ from: start, to: end, progress: 0, speed: 0.02 + Math.random() * 0.02 });
                }
            }

            for (let i = signals.length - 1; i >= 0; i--) {
                const s = signals[i];
                s.progress += s.speed;
                const cx = s.from.x + (s.to.x - s.from.x) * s.progress;
                const cy = s.from.y + (s.to.y - s.from.y) * s.progress;

                ctx.beginPath();
                ctx.arc(cx, cy, 2, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(100, 100, 255, 0.8)";
                ctx.fill();

                if (s.progress >= 1) {
                    signals.splice(i, 1);
                    // Propagate
                    let lIdx = -1;
                    for (let l = 0; l < nodes.length; l++) {
                        if (nodes[l].includes(s.to)) { lIdx = l; break; }
                    }
                    if (lIdx !== -1 && lIdx < nodes.length - 1) {
                        const nextL = nodes[lIdx + 1];
                        const nextN = nextL[Math.floor(Math.random() * nextL.length)];
                        signals.push({ from: s.to, to: nextN, progress: 0, speed: 0.02 + Math.random() * 0.02 });
                    }
                }
            }

            // Nodes
            nodes.forEach(layer => {
                layer.forEach(n => {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = nodeColor;
                    ctx.fill();
                    ctx.strokeStyle = "rgba(200,200,200,1)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
            });

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
        <div ref={containerRef} className="w-full h-full relative">
            {/* <div className="absolute top-4 left-4 text-xs font-mono text-gray-400">MODEL_TOPOLOGY_VIZ // 2-5-7-5-2</div> */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

export default StructuredNetworkAnimation;

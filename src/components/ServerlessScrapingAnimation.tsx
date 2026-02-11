"use client";

import React, { useEffect, useRef } from "react";

interface Point {
    x: number;
    y: number;
}

type ContentType = 'image' | 'text' | 'data' | 'video';
type FlowType = 'pg_to_master' | 'master_to_lambda' | 'lambda_to_s3' | 'lambda_to_master' | 'master_to_pg';

interface DataPacket {
    x: number;
    y: number;
    origin: Point;
    target: Point;
    type: ContentType;
    flowType: FlowType;
    progress: number;
    speed: number;
    rotation: number;
    rotationSpeed: number;
}

interface Lambda {
    x: number;
    y: number;
    active: boolean;
    pulse: number;
}

interface Props {
    isHovered: boolean;
}

const ServerlessScrapingAnimation: React.FC<Props> = ({ isHovered }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
        let dataPackets: DataPacket[] = [];
        let lambdas: Lambda[] = [];
        let pgDB: Point = { x: 0, y: 0 };
        let master: Point = { x: 0, y: 0 };
        let s3: Point = { x: 0, y: 0 };

        const resizeCanvas = () => {
            if (!canvasRef.current || !containerRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = containerRef.current.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Scale all drawing operations by dpr
            ctx.scale(dpr, dpr);

            // CSS size
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Pass logical width/height
            initScene(rect.width, rect.height);
        };

        const initScene = (width: number, height: number) => {

            // Architecture layout (left to right)
            pgDB = { x: width * 0.1, y: height * 0.5 };
            master = { x: width * 0.3, y: height * 0.5 };
            s3 = { x: width * 0.9, y: height * 0.5 };

            // 3 Lambda workers (vertically distributed)
            lambdas = [
                { x: width * 0.6, y: height * 0.25, active: false, pulse: 0 },
                { x: width * 0.6, y: height * 0.5, active: false, pulse: 0 },
                { x: width * 0.6, y: height * 0.75, active: false, pulse: 0 }
            ];
        };

        const spawnDataPacket = () => {
            // Start cycle from Master
            const targetLambda = lambdas[Math.floor(Math.random() * lambdas.length)];
            dataPackets.push({
                x: master.x,
                y: master.y,
                origin: { ...master },
                target: { x: targetLambda.x, y: targetLambda.y },
                type: 'data',
                flowType: 'master_to_lambda',
                progress: 0,
                speed: 0.02 + Math.random() * 0.01,
                rotation: 0,
                rotationSpeed: 0.05
            });
        };

        const drawDBIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;

            // Draw cylinder
            const width = size * 1.2;
            const height = size * 1.6;

            // Top ellipse
            ctx.beginPath();
            ctx.ellipse(x, y - height / 3, width, height / 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Body
            ctx.fillRect(x - width, y - height / 3, width * 2, height * 0.8);

            // Bottom ellipse
            ctx.beginPath();
            ctx.ellipse(x, y + height / 2, width, height / 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        };

        const drawLambdaIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, active: boolean) => {
            ctx.fillStyle = active ? "rgba(50, 255, 100, 0.9)" : color;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;

            // Draw Lambda symbol (λ)
            ctx.font = `bold ${size * 2}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("λ", x, y);
        };

        const drawS3Icon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;

            // Draw bucket/box shape
            const w = size * 1.3;
            const h = size * 1.5;

            ctx.beginPath();
            ctx.moveTo(x - w, y + h / 2);
            ctx.lineTo(x - w * 0.7, y - h / 2);
            ctx.lineTo(x + w * 0.7, y - h / 2);
            ctx.lineTo(x + w, y + h / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };

        const drawMasterIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
            ctx.fillStyle = color;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;

            // Draw gear/cog
            const teeth = 8;
            const outerRadius = size;
            const innerRadius = size * 0.6;

            ctx.beginPath();
            for (let i = 0; i < teeth * 2; i++) {
                const angle = (i * Math.PI) / teeth;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Inner circle
            ctx.beginPath();
            ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fill();
        };

        const drawContentIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, type: ContentType, size: number, rotation: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            switch (type) {
                case 'image':
                    ctx.fillStyle = "rgba(100, 200, 255, 0.9)";
                    ctx.fillRect(-size, -size, size * 2, size * 2);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                    ctx.fillRect(-size * 0.6, -size * 0.6, size * 1.2, size * 0.4);
                    break;

                case 'text':
                    ctx.strokeStyle = "rgba(150, 255, 150, 0.9)";
                    ctx.lineWidth = 1.5;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.moveTo(-size, -size + i * size * 0.8);
                        ctx.lineTo(size, -size + i * size * 0.8);
                        ctx.stroke();
                    }
                    break;

                case 'data':
                    ctx.fillStyle = "rgba(255, 200, 100, 0.9)";
                    ctx.beginPath();
                    ctx.moveTo(0, -size * 1.2);
                    ctx.lineTo(size, 0);
                    ctx.lineTo(0, size * 1.2);
                    ctx.lineTo(-size, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'video':
                    ctx.fillStyle = "rgba(255, 100, 150, 0.9)";
                    ctx.beginPath();
                    ctx.moveTo(-size, -size);
                    ctx.lineTo(size * 1.2, 0);
                    ctx.lineTo(-size, size);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }

            ctx.restore();
        };

        const draw = () => {
            if (!ctx) return;
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            const isHoveredNow = hoverRef.current;

            ctx.clearRect(0, 0, width, height);

            // Spawn new data packets periodically
            if (Math.random() < (isHoveredNow ? 0.05 : 0.02)) {
                spawnDataPacket();
            }

            // Draw architecture connections (faint)
            ctx.strokeStyle = "rgba(100, 100, 100, 0.1)";
            ctx.lineWidth = 0.3;

            // PG -> Master
            ctx.beginPath();
            ctx.moveTo(pgDB.x, pgDB.y);
            ctx.lineTo(master.x, master.y);
            ctx.stroke();

            // Master -> Lambdas
            lambdas.forEach(lambda => {
                ctx.beginPath();
                ctx.moveTo(master.x, master.y);
                ctx.lineTo(lambda.x, lambda.y);
                ctx.stroke();
            });

            // Lambdas -> S3
            lambdas.forEach(lambda => {
                ctx.beginPath();
                ctx.moveTo(lambda.x, lambda.y);
                ctx.lineTo(s3.x, s3.y);
                ctx.stroke();
            });

            // Lambdas -> Master (return path, dashed)
            ctx.setLineDash([3, 3]);
            lambdas.forEach(lambda => {
                ctx.beginPath();
                ctx.moveTo(lambda.x, lambda.y);
                ctx.lineTo(master.x, master.y);
                ctx.stroke();
            });
            ctx.setLineDash([]);

            // Master -> PG (return path, dashed)
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(master.x, master.y);
            ctx.lineTo(pgDB.x, pgDB.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw nodes with custom icons
            drawDBIcon(ctx, pgDB.x, pgDB.y, 10, "rgba(70, 130, 180, 0.9)");
            drawMasterIcon(ctx, master.x, master.y, 12, "rgba(138, 43, 226, 0.9)");
            drawS3Icon(ctx, s3.x, s3.y, 10, "rgba(255, 140, 0, 0.9)");

            // Draw Lambda workers with custom icons
            lambdas.forEach((lambda, idx) => {
                drawLambdaIcon(ctx, lambda.x, lambda.y, 8, "rgba(100, 150, 200, 0.6)", lambda.active);

                if (lambda.pulse > 0) lambda.pulse *= 0.92;
                if (lambda.active && Math.random() > 0.95) lambda.active = false;
            });

            // Update and draw data packets
            for (let i = dataPackets.length - 1; i >= 0; i--) {
                const packet = dataPackets[i];
                const speedMultiplier = isHoveredNow ? 1.6 : 1;

                packet.progress += packet.speed * speedMultiplier;
                packet.rotation += packet.rotationSpeed;

                if (packet.progress >= 1) {
                    // Packet reached destination, spawn next stage
                    if (packet.flowType === 'pg_to_master') {
                        // Master distributes to random lambda
                        const targetLambda = lambdas[Math.floor(Math.random() * lambdas.length)];
                        dataPackets.push({
                            x: master.x,
                            y: master.y,
                            origin: { ...master },
                            target: { x: targetLambda.x, y: targetLambda.y },
                            type: 'data',
                            flowType: 'master_to_lambda',
                            progress: 0,
                            speed: 0.02 + Math.random() * 0.01,
                            rotation: packet.rotation,
                            rotationSpeed: 0.05
                        });
                    } else if (packet.flowType === 'master_to_lambda') {
                        // Lambda activates and splits into two flows
                        const lambda = lambdas.find(l => Math.abs(l.x - packet.target.x) < 5 && Math.abs(l.y - packet.target.y) < 5);
                        if (lambda) {
                            lambda.active = true;
                            lambda.pulse = 1;

                            // Flow 1: Lambda -> S3 (media)
                            const mediaTypes: ContentType[] = ['image', 'video'];
                            const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
                            dataPackets.push({
                                x: lambda.x,
                                y: lambda.y,
                                origin: { x: lambda.x, y: lambda.y },
                                target: { ...s3 },
                                type: mediaType,
                                flowType: 'lambda_to_s3',
                                progress: 0,
                                speed: 0.015 + Math.random() * 0.01,
                                rotation: 0,
                                rotationSpeed: 0.08
                            });

                            // Flow 2: Lambda -> Master (metadata)
                            dataPackets.push({
                                x: lambda.x,
                                y: lambda.y,
                                origin: { x: lambda.x, y: lambda.y },
                                target: { ...master },
                                type: 'text',
                                flowType: 'lambda_to_master',
                                progress: 0,
                                speed: 0.02 + Math.random() * 0.01,
                                rotation: 0,
                                rotationSpeed: 0.06
                            });
                        }
                    } else if (packet.flowType === 'lambda_to_master') {
                        // Master -> PG (save metadata)
                        dataPackets.push({
                            x: master.x,
                            y: master.y,
                            origin: { ...master },
                            target: { ...pgDB },
                            type: 'text',
                            flowType: 'master_to_pg',
                            progress: 0,
                            speed: 0.015 + Math.random() * 0.01,
                            rotation: packet.rotation,
                            rotationSpeed: 0.05
                        });
                    }
                    // lambda_to_s3 and master_to_pg end the cycle

                    dataPackets.splice(i, 1);
                    continue;
                }

                // Ease-in-out interpolation
                const eased = packet.progress < 0.5
                    ? 2 * packet.progress * packet.progress
                    : 1 - Math.pow(-2 * packet.progress + 2, 2) / 2;

                packet.x = packet.origin.x + (packet.target.x - packet.origin.x) * eased;
                packet.y = packet.origin.y + (packet.target.y - packet.origin.y) * eased;

                drawContentIcon(ctx, packet.x, packet.y, packet.type, 4, packet.rotation);
            }

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
        <div ref={containerRef} className="hidden md:block w-full h-full relative overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

export default ServerlessScrapingAnimation;

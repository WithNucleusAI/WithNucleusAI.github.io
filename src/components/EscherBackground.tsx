
"use client";

import { useEffect, useRef, useState } from "react";

export default function EscherBackground() {
    const INITIAL_RADIUS_DESKTOP_PX = 0;
    const INITIAL_RADIUS_MOBILE_PX = 0;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [fadeProgress, setFadeProgress] = useState(0);
    const [fadeCenter, setFadeCenter] = useState({ x: 50, y: 50 });
    const [initialRadiusPx, setInitialRadiusPx] = useState(INITIAL_RADIUS_DESKTOP_PX);
    const [maxRadiusPx, setMaxRadiusPx] = useState(2400);

    useEffect(() => {
        let rafId = 0;

        const updateFadeCenter = () => {
            const typingElement = document.getElementById("typing");
            const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
            const viewportWidth = Math.max(window.innerWidth, 1);
            const viewportHeight = Math.max(window.innerHeight, 1);
            const baseRadius = isMobileViewport ? INITIAL_RADIUS_MOBILE_PX : INITIAL_RADIUS_DESKTOP_PX;
            let centerX = viewportWidth / 2;
            let centerY = viewportHeight / 2;

            if (typingElement) {
                const rect = typingElement.getBoundingClientRect();
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }

            const x = (centerX / viewportWidth) * 100;
            const y = (centerY / viewportHeight) * 100;

            const viewportCorners = [
                { x: 0, y: 0 },
                { x: viewportWidth, y: 0 },
                { x: 0, y: viewportHeight },
                { x: viewportWidth, y: viewportHeight },
            ];
            const fullCoverRadius = Math.max(
                ...viewportCorners.map(corner => Math.sqrt((corner.x - centerX) ** 2 + (corner.y - centerY) ** 2))
            ) + 80;

            setFadeCenter({
                x: Math.min(95, Math.max(5, x)),
                y: Math.min(95, Math.max(5, y)),
            });
            setInitialRadiusPx(baseRadius);
            setMaxRadiusPx(Math.max(baseRadius + 160, fullCoverRadius));
        };

        const updateFadeProgress = () => {
            const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
            const scrollY = window.scrollY || window.pageYOffset || 0;
            const maxDistance = Math.max(window.innerHeight * (isMobileViewport ? 0.62 : 0.9), 1);
            const progress = Math.min(1, Math.max(0, scrollY / maxDistance));
            setFadeProgress(progress);
            updateFadeCenter();
        };

        const handleScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateFadeProgress);
        };

        updateFadeProgress();
        updateFadeCenter();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", updateFadeProgress);

        const typingElement = document.getElementById("typing");
        const resizeObserver =
            typeof ResizeObserver !== "undefined" && typingElement
                ? new ResizeObserver(() => {
                    updateFadeCenter();
                })
                : null;
        resizeObserver?.observe(typingElement as Element);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", updateFadeProgress);
            resizeObserver?.disconnect();
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const isIPhone = /iPhone/i.test(navigator.userAgent);
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const saveData = typeof navigator !== "undefined" && "connection" in navigator && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
        const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 4 : 4;
        const memory = typeof navigator !== "undefined" ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) : 4;

        const shouldUseStaticDotsBase = prefersReducedMotion || saveData || cores <= 2 || memory <= 2;

        const drawStaticDots = () => {
            const ctx = canvas.getContext("2d", { alpha: true });
            if (!ctx) return;

            const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? (isIPhone ? 2.0 : 1.5) : 1.75);
            const width = Math.max(1, Math.floor(container.clientWidth * dpr));
            const height = Math.max(1, Math.floor(container.clientHeight * dpr));
            canvas.width = width;
            canvas.height = height;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgba(0,0,0,0.28)";

            const gap = Math.max(8, Math.round((isMobile ? 10 : 9) * dpr));
            const radius = Math.max(1, Math.round(1.4 * dpr));

            for (let y = Math.floor(gap / 2); y < height; y += gap) {
                for (let x = Math.floor(gap / 2); x < width; x += gap) {
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            setIsLoaded(true);
        };

        let rendererLooksWeak = false;
        const probeGl = canvas.getContext("webgl", { powerPreference: "low-power", antialias: false });
        if (probeGl) {
            const debugInfo = probeGl.getExtension("WEBGL_debug_renderer_info");
            const renderer = debugInfo ? probeGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";
            const rendererName = String(renderer || "").toLowerCase();
            rendererLooksWeak = /swiftshader|llvmpipe|software|basic render driver|mali-4|adreno 3/i.test(rendererName);
        }

        const shouldUseStaticDots = shouldUseStaticDotsBase || rendererLooksWeak || !probeGl;
        if (shouldUseStaticDots) {
            const handleResizeStatic = () => drawStaticDots();
            drawStaticDots();
            window.addEventListener("resize", handleResizeStatic);
            return () => {
                window.removeEventListener("resize", handleResizeStatic);
            };
        }

        const gl = probeGl;
        const image = new window.Image();
        image.src = "/images/hands2.png";

        let animationFrameId = 0;
        let time = 0;
        let lastTime = performance.now();
        let isVisible = true;
        let mouseX = -9999;
        let mouseY = -9999;

        const targetFps = isMobile ? 24 : 30;
        const fpsInterval = 1000 / targetFps;
        const gap = isMobile ? 7.2 : 16.0;
        const baseRadius = isMobile ? 1.8 : 6.0;
        const scrollSpeed = 0.65;
        const iphoneCenterZoom = isIPhone ? 1.5 : 1.0;

        const vsSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;
            uniform sampler2D u_image;
            uniform vec2 u_resolution;
            uniform vec2 u_imageResolution;
            uniform float u_time;
            uniform float u_gap;
            uniform float u_baseRadius;
            uniform float u_zoom;
            uniform vec2 u_mouse;

            void main() {
                vec2 pos = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
                vec2 cellCenter = floor(pos / u_gap + 0.5) * u_gap;
                float dist = distance(pos, cellCenter);

                // Cursor hover: scale dots near the mouse
                float mouseDist = distance(pos, u_mouse);
                float hoverRadius = 120.0;
                float hoverScale = 1.0 + 1.2 * smoothstep(hoverRadius, 0.0, mouseDist);
                float effectiveRadius = u_baseRadius * hoverScale;

                if (dist > effectiveRadius + 0.5) {
                    gl_FragColor = vec4(0.0);
                    return;
                }

                float imgAspect = u_imageResolution.x / u_imageResolution.y;
                float canvasAspect = u_resolution.x / u_resolution.y;

                float drawWidth;
                float drawHeight;

                if (canvasAspect > imgAspect) {
                    drawWidth = u_resolution.x * u_zoom;
                    drawHeight = (u_resolution.x / imgAspect) * u_zoom;
                } else {
                    drawHeight = u_resolution.y * u_zoom;
                    drawWidth = (u_resolution.y * imgAspect) * u_zoom;
                }

                float offsetX = (u_resolution.x - drawWidth) / 2.0;
                float offsetY = (u_resolution.y - drawHeight) / 2.0;

                vec2 screenCenter = u_resolution / 2.0;
                vec2 diff = cellCenter - screenCenter;

                float angle = -u_time * 0.002;
                float s = sin(angle);
                float c = cos(angle);

                vec2 rotatedDiff = vec2(
                    diff.x * c - diff.y * s,
                    diff.x * s + diff.y * c
                );

                vec2 rotatedCenter = screenCenter + rotatedDiff;
                
                // Add a gentle hovering effect (bobbing up and down)
                rotatedCenter.y += sin(u_time * 0.003) * 20.0;

                float u = (rotatedCenter.x - offsetX) / drawWidth;
                float v = (rotatedCenter.y - offsetY) / drawHeight;
                vec2 uv = vec2(u, v);

                float brightness;
                if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                    brightness = 255.0;
                } else {
                    vec4 color = texture2D(u_image, uv);
                    brightness = dot(color.rgb, vec3(0.333333)) * 255.0;
                }

                float sizeFactor = (255.0 - brightness) / 255.0;
                float dotSize = sizeFactor * effectiveRadius;

                if (brightness < 240.0 && dotSize > 0.5) {
                    float alpha = 1.0 - smoothstep(dotSize - 0.5, dotSize + 0.5, dist);
                    if (alpha > 0.0) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * 0.85);
                        return;
                    }
                }

                gl_FragColor = vec4(0.0);
            }
        `;

        const compileShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader validation error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        if (!program || !vertexShader || !fragmentShader) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uResolution = gl.getUniformLocation(program, "u_resolution");
        const uImageResolution = gl.getUniformLocation(program, "u_imageResolution");
        const uTime = gl.getUniformLocation(program, "u_time");
        const uGap = gl.getUniformLocation(program, "u_gap");
        const uBaseRadius = gl.getUniformLocation(program, "u_baseRadius");
        const uZoom = gl.getUniformLocation(program, "u_zoom");
        const uMouse = gl.getUniformLocation(program, "u_mouse");

        gl.uniform1f(uGap, gap);
        gl.uniform1f(uBaseRadius, baseRadius);
        gl.uniform1f(uZoom, iphoneCenterZoom);
        gl.uniform2f(uMouse, -9999, -9999);

        const texture = gl.createTexture();
        let isTextureLoaded = false;

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? (isIPhone ? 2.25 : 1.6) : 2.0);
            const width = Math.max(1, Math.floor(container.clientWidth * dpr));
            const height = Math.max(1, Math.floor(container.clientHeight * dpr));
            canvas.width = width;
            canvas.height = height;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            if (uResolution) {
                gl.uniform2f(uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
            }

            if (isTextureLoaded) {
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
        };

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            if (uImageResolution) {
                gl.uniform2f(uImageResolution, image.width, image.height);
            }

            isTextureLoaded = true;
            handleResize();
            setIsLoaded(true);

            if (isVisible && !document.hidden) {
                lastTime = performance.now();
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };

        const render = (now: number) => {
            if (!isTextureLoaded || !isVisible || document.hidden) return;

            animationFrameId = requestAnimationFrame(render);

            const elapsed = now - lastTime;
            if (elapsed < fpsInterval) return;

            lastTime = now - (elapsed % fpsInterval);
            time += scrollSpeed * (elapsed / 16.666);

            if (uTime) {
                gl.uniform1f(uTime, time);
            }
            if (uMouse) {
                const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? (isIPhone ? 2.25 : 1.6) : 2.0);
                gl.uniform2f(uMouse, mouseX * dpr, mouseY * dpr);
            }
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const wasVisible = isVisible;
                    isVisible = entry.isIntersecting;
                    if (!wasVisible && isVisible && isTextureLoaded && !document.hidden) {
                        lastTime = performance.now();
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = requestAnimationFrame(render);
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0 }
        );

        const handleVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
                return;
            }
            if (isVisible && isTextureLoaded) {
                lastTime = performance.now();
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        observer.observe(container);
        window.addEventListener("resize", handleResize);
        window.visualViewport?.addEventListener("resize", handleResize);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", handleResize);
            window.visualViewport?.removeEventListener("resize", handleResize);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
            gl.deleteTexture(texture);
        };
    }, []);

    const isMobileRadial = initialRadiusPx === INITIAL_RADIUS_MOBILE_PX;
    const fadeRadius = initialRadiusPx + fadeProgress * (maxRadiusPx - initialRadiusPx);
    const fadeEdge = isMobileRadial
        ? Math.min(0, 10 + fadeProgress * 10)
        : Math.min(4, 22 + fadeProgress * 20);

    return (
        <div ref={containerRef} className="absolute inset-x-0 top-0 w-full h-svh -z-10 bg-white/50 dark:bg-neutral-900/50 pointer-events-none">
            <canvas
                ref={canvasRef}
                className="block w-full h-full opacity-60 dark:invert contrast-125 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000"
                style={{ opacity: isLoaded ? 0.6 : 0 }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-white dark:bg-black pointer-events-none transition-opacity duration-1000"
                style={{
                    maskImage: `radial-gradient(circle at ${fadeCenter.x}% ${fadeCenter.y}%, rgba(0,0,0,1) ${fadeRadius}px, rgba(0,0,0,0) ${fadeRadius + fadeEdge}px)`,
                    WebkitMaskImage: `radial-gradient(circle at ${fadeCenter.x}% ${fadeCenter.y}%, rgba(0,0,0,1) ${fadeRadius}px, rgba(0,0,0,0) ${fadeRadius + fadeEdge}px)`,
                }}
            />
        </div>
    );
}

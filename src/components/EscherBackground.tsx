
"use client";

import { useEffect, useRef, useState } from "react";

export default function EscherBackground() {
    const INITIAL_RADIUS_DESKTOP_PX = 0;
    const INITIAL_RADIUS_MOBILE_PX = 0;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const isLoadedRef = useRef(false);

    // Compute scroll-based opacity and write directly to canvas.style — no React re-renders.
    const applyScrollOpacity = () => {
        if (!canvasRef.current) return;
        if (!isLoadedRef.current) {
            canvasRef.current.style.opacity = "0";
            return;
        }
        const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const maxDistance = Math.max(window.innerHeight * (isMobileViewport ? 0.62 : 0.9), 1);
        const progress = Math.min(1, Math.max(0, scrollY / maxDistance));
        canvasRef.current.style.opacity = String(0.6 * (1 - progress));
    };

    useEffect(() => {
        let rafId = 0;
        const handleScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(applyScrollOpacity);
        };
        applyScrollOpacity();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", applyScrollOpacity);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", applyScrollOpacity);
        };
    }, []);

    // When canvas first loads: fade it in with a one-shot transition, then remove it
    // so all subsequent scroll updates are immediate (no CSS transition lag).
    useEffect(() => {
        if (!isLoaded || !canvasRef.current) return;
        isLoadedRef.current = true;
        const c = canvasRef.current;
        c.style.transition = 'opacity 1s ease';
        applyScrollOpacity(); // sets correct opacity for current scroll position
        const t = setTimeout(() => { c.style.transition = ''; }, 1100);
        return () => clearTimeout(t);
    }, [isLoaded]);

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
        image.src = "/images/hands2.webp";

        const targetFps = isMobile ? 24 : 60;
        const fpsInterval = 1000 / targetFps;
        const gap = isMobile ? 7.2 : 16.0;
        const baseRadius = isMobile ? 1.8 : 6.0;
        const scrollSpeed = 0;
        const MOBILE_IMAGE_ZOOM = 1.4; // ← increase to zoom in on the image on mobile (e.g. 1.2 = 20% zoom)
        const fitContain = isMobile ? 1.0 : 0.0;
        const mobileZoom = isMobile ? MOBILE_IMAGE_ZOOM : 1.0;
        // Cache DPR once — avoids recomputing on every render frame
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? (isIPhone ? 2.25 : 1.6) : 2.0);
        const floatPrecision = isMobile ? 'mediump' : 'highp';

        const vsSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // On mobile: mediump precision (huge GPU win) + cheap tent shimmer instead of exp()
        const fsSource = `
            precision ${floatPrecision} float;
            uniform sampler2D u_image;
            uniform vec2 u_resolution;
            uniform vec2 u_imageResolution;
            uniform float u_gap;
            uniform float u_baseRadius;
            uniform float u_zoom;
            uniform float u_fitContain;
            uniform float u_globalTime;

            void main() {
                vec2 pos = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
                vec2 cellCenter = floor(pos / u_gap + 0.5) * u_gap;
                float dist = distance(pos, cellCenter);

                // Radial wave shimmer from center to edges
                vec2 screenCenter = u_resolution * 0.5;
                float distFromCenter = distance(pos, screenCenter);
                float shimmerCycle = 4500.0;
                float progress = mod(u_globalTime, shimmerCycle) / shimmerCycle;
                float ringPos = progress * (length(screenCenter) + 200.0);
                float dr = distFromCenter - ringPos;
                float bandWidth = 100.0;
                // Desktop: smooth Gaussian. Mobile: cheap tent function (avoids exp())
                float shimmer = ${isMobile
                ? 'max(0.0, 1.0 - abs(dr) / bandWidth);'
                : 'exp(-(dr * dr) / (2.0 * bandWidth * bandWidth));'}
                float effectiveRadius = u_baseRadius * (1.0 + shimmer * 0.5);

                if (dist > effectiveRadius + 0.5) {
                    gl_FragColor = vec4(0.0);
                    return;
                }

                float imgAspect = u_imageResolution.x / u_imageResolution.y;
                float canvasAspect = u_resolution.x / u_resolution.y;

                float drawWidth;
                float drawHeight;

                if (u_fitContain < 0.5) {
                    if (canvasAspect > imgAspect) {
                        drawWidth = u_resolution.x * u_zoom;
                        drawHeight = (u_resolution.x / imgAspect) * u_zoom;
                    } else {
                        drawHeight = u_resolution.y * u_zoom;
                        drawWidth = (u_resolution.y * imgAspect) * u_zoom;
                    }
                } else {
                    if (canvasAspect > imgAspect) {
                        drawHeight = u_resolution.y * u_zoom;
                        drawWidth = (u_resolution.y * imgAspect) * u_zoom;
                    } else {
                        drawWidth = u_resolution.x * u_zoom;
                        drawHeight = (u_resolution.x / imgAspect) * u_zoom;
                    }
                }

                float offsetX = (u_resolution.x - drawWidth) * 0.5;
                float offsetY = (u_resolution.y - drawHeight) * 0.5;

                // Sample UV directly from cellCenter (rotatedCenter was always == cellCenter)
                float u = (cellCenter.x - offsetX) / drawWidth;
                float v = (cellCenter.y - offsetY) / drawHeight;
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
        const uGap = gl.getUniformLocation(program, "u_gap");
        const uBaseRadius = gl.getUniformLocation(program, "u_baseRadius");
        const uZoom = gl.getUniformLocation(program, "u_zoom");
        const uFitContain = gl.getUniformLocation(program, "u_fitContain");
        const uGlobalTime = gl.getUniformLocation(program, "u_globalTime");

        gl.uniform1f(uGap, gap);
        gl.uniform1f(uBaseRadius, baseRadius);
        gl.uniform1f(uZoom, mobileZoom);
        gl.uniform1f(uFitContain, fitContain);

        const texture = gl.createTexture();
        let isTextureLoaded = false;

        const handleResize = () => {
            const w = Math.max(1, Math.floor(container.clientWidth * dpr));
            const h = Math.max(1, Math.floor(container.clientHeight * dpr));
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            if (uResolution) gl.uniform2f(uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
            if (isTextureLoaded) gl.drawArrays(gl.TRIANGLES, 0, 6);
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

        let animationFrameId = 0;
        let time = 0;
        let lastTime = performance.now();
        let isVisible = true;

        const render = (now: number) => {
            if (!isTextureLoaded || !isVisible || document.hidden) return;
            animationFrameId = requestAnimationFrame(render);
            const elapsed = now - lastTime;
            if (elapsed < fpsInterval) return;
            lastTime = now - (elapsed % fpsInterval);
            time += scrollSpeed * (elapsed / 16.666);
            if (uGlobalTime) gl.uniform1f(uGlobalTime, now);
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


        observer.observe(container);
        window.addEventListener("resize", handleResize);
        window.visualViewport?.addEventListener("resize", handleResize);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", handleResize);
            window.visualViewport?.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
            gl.deleteTexture(texture);
        };
    }, []);


    return (
        <div ref={containerRef} className="absolute inset-x-0 top-0 w-full h-svh -z-10 bg-white/50 dark:bg-neutral-900/50 pointer-events-none">
            <div className="w-full h-full dark:opacity-[0.45]">
                <canvas
                    ref={canvasRef}
                    className="block w-full h-full dark:invert dark:contrast-100 contrast-125 mix-blend-multiply dark:mix-blend-screen"
                    style={{ opacity: 0, willChange: 'opacity' }}
                />
            </div>
        </div>
    );
}

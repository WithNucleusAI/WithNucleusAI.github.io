
"use client";

import { useEffect, useRef, useState } from "react";
import { getIntroPlayed } from "./IntroOverlay";

export default function EscherBackground() {
    // Image margin configuration
    const IMAGE_TOP_MARGIN_VH = 5; // 10vh margin from top
    const IMAGE_BOTTOM_MARGIN_VH = 5; // 10vh margin from bottom

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isIntroDone, setIsIntroDone] = useState(() => getIntroPlayed());
    const isLoadedRef = useRef(false);

    useEffect(() => {
        if (!isIntroDone) {
            const handleIntroDone = () => setIsIntroDone(true);
            window.addEventListener('intro-done', handleIntroDone, { once: true });
            return () => window.removeEventListener('intro-done', handleIntroDone);
        }
    }, [isIntroDone]);

    // Keep opacity writes isolated from React so the canvas doesn't re-render on scroll.
    const applyCanvasOpacity = () => {
        if (!canvasRef.current) return;
        canvasRef.current.style.opacity = isLoadedRef.current ? "0.7" : "0";
    };

    // When canvas first loads and intro is done: fade it in with a delayed transition, 
    // then remove it so all subsequent scroll updates are immediate.
    useEffect(() => {
        if (!isLoaded || !isIntroDone || !canvasRef.current || isLoadedRef.current) return;
        isLoadedRef.current = true;
        const c = canvasRef.current;
        
        const delayTimer = setTimeout(() => {
            if (!c) return;
            c.style.transition = 'opacity 2.5s ease-in-out';
            applyCanvasOpacity();
            setTimeout(() => { if (c) c.style.transition = ''; }, 2600);
        }, 1200); // Wait 1.2s after intro is done before fading in

        return () => clearTimeout(delayTimer);
    }, [isLoaded, isIntroDone]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const isIPhone = /iPhone/i.test(navigator.userAgent);
        const disableScrollLinkedShaderOnIPhone = isMobile && !isIPhone;
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

        const gap = isMobile ? 7.2 : 16.0;
        const baseRadius = isMobile ? 1.8 : 6.0;
        const MOBILE_IMAGE_ZOOM = 1.5; // ← increase to zoom in on the image on mobile (e.g. 1.2 = 20% zoom)
        const DESKTOP_IMAGE_ZOOM = 1.1; // ← increase to zoom in on desktop
        const IMAGE_ROTATION_DEG = -30.0; // ← angle in degrees to rotate the underlying image clockwise
        const WAVE_INTENSITY = 0.50; // ← adjust wave strength (e.g. 0.8 is strong, 0.3 is minimalist/subtle)
        const WAVE_START_RADIUS_X = 350.0; // ← horizontal radius of the ellipse where waves start
        const WAVE_START_RADIUS_Y = 250.0; // ← vertical radius of the ellipse where waves start
        const HOVER_INTENSITY = 0.75; // ← adjust hover max strength
        const fitContain = 1.0;
        
        // Calculate zoom accounting for padding
        const totalPaddingVh = IMAGE_TOP_MARGIN_VH + IMAGE_BOTTOM_MARGIN_VH;
        const availableHeightVh = 100 - totalPaddingVh;
        const paddingZoomFactor = availableHeightVh / 100;
        const baseZoom = isMobile ? MOBILE_IMAGE_ZOOM : DESKTOP_IMAGE_ZOOM;
        const mobileZoom = baseZoom * paddingZoomFactor;
        // Cache DPR once — avoids recomputing on every render frame
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? (isIPhone ? 1.75 : 1.5) : 1.75);
        const computeImageFade = () => {
            const y = window.scrollY || 0;
            const vh = window.innerHeight || 1;
            const start = vh * 0.15;
            const end = vh * 1.25;
            if (y <= start) return 1;
            if (y >= end) return 0;
            const t = (y - start) / (end - start);
            return 1 - t;
        };
        // After ~two full-height sections (hero + intro), damp ripples so blog copy stays readable.
        const computeWaveStrength = () => {
            const y = window.scrollY || 0;
            const vh = window.innerHeight || 1;
            const fadeStart = vh * 1.55;
            const fadeEnd = vh * 2.15;
            const floor = 0.08;
            if (y <= fadeStart) return 1;
            if (y >= fadeEnd) return floor;
            const t = (y - fadeStart) / (fadeEnd - fadeStart);
            return 1 - t * (1 - floor);
        };
        const highFloatPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        const supportsHighpFragment = !!highFloatPrecision && highFloatPrecision.precision > 0;
        // Prefer highp on capable mobile GPUs to avoid scroll quantization jitter in long pages.
        const floatPrecision = isMobile ? (supportsHighpFragment ? 'highp' : 'mediump') : 'highp';

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
            uniform float u_scrollY;
            uniform float u_imageFade;
            uniform float u_waveStrength;
            ${!isMobile ? `
            uniform vec2 u_mouse;
            uniform float u_hoverActive;
            ` : ''}

            void main() {
                vec2 pos = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
                vec2 cellCenter = floor(pos / u_gap + 0.5) * u_gap;
                float dist = distance(pos, cellCenter);

                // Continuous water ripples from center
                vec2 screenCenter = vec2(u_resolution.x * 0.5, u_resolution.y * 0.5 - u_scrollY);
                vec2 diff = pos - screenCenter;
                float distFromCenter = length(diff);
                
                // Elliptical distance for wave masking and generation
                float ellipseRatioY = ${WAVE_START_RADIUS_X.toFixed(1)} / ${WAVE_START_RADIUS_Y.toFixed(1)};
                vec2 ellipticalDiff = vec2(diff.x, diff.y * ellipseRatioY);
                float ellipticalDist = length(ellipticalDiff);
                
                // Base frequency and speed (lower freq = wider ripples, lower speed = slower)
                float baseFreq = 0.009; 
                float waveSpeed = 0.0015;
                
                // Exponential falloff for frequency so waves "stretch out" at the edges
                float freqDecay = exp(-distFromCenter * 0.001); 
                float effectiveFreq = baseFreq * mix(0.4, 1.0, freqDecay);
                
                // Sine wave based on distance and time
                // Add a start radius so the wave effect only applies outside of it
                float waveDist = max(0.0, ellipticalDist - ${WAVE_START_RADIUS_X.toFixed(1)});
                float wave = sin(waveDist * effectiveFreq - u_globalTime * waveSpeed);
                // Ramp up the wave strength over a very long smooth distance (150px) to hide the visible start boundary
                float waveMask = smoothstep(0.0, 150.0 * max(1.0, ellipseRatioY), ellipticalDist - ${WAVE_START_RADIUS_X.toFixed(1)});
                
                // Remap [-1, 1] to [0, 1] and make the peaks smoother (2.2) instead of sharp (3.0) for a minimal look
                float shimmer = pow((wave + 1.0) * 0.5, 2.2) * waveMask;
                
                // Fade out waves exponentially as they go away from center
                float waveFalloff = exp(-distFromCenter * 0.00025);
                
                // Smoothly fade to exactly 0 towards the far edges of the screen to avoid abrupt endings
                float maxScreenRadius = max(u_resolution.x, u_resolution.y) * 0.7;
                float edgeFade = smoothstep(maxScreenRadius, maxScreenRadius * 0.4, distFromCenter);
                
                shimmer *= waveFalloff * edgeFade * u_waveStrength;
                
                ${isMobile ? `
                float magEffect = 0.0;
                vec2 uvOffset = vec2(0.0);
                ` : `
                // Magnifying glass effect
                float distToMouse = distance(pos, u_mouse);
                float glassRadius = 250.0;
                float magEffect = 0.0;
                vec2 uvOffset = vec2(0.0);
                
                if (u_hoverActive > 0.0 && distToMouse < glassRadius && u_mouse.x >= 0.0) {
                    float normDist = distToMouse / glassRadius;
                    float lensShape = 1.0 - pow(normDist, 2.0); // Parabolic lens
                    magEffect = lensShape * u_hoverActive;
                    vec2 centerVector = cellCenter - u_mouse;
                    uvOffset = -centerVector * (magEffect * 0.5); // Zoom distortion
                }
                `}

                // Max possible radius used for early exit cull padding to save performance
                float maxPossibleRadius = u_baseRadius * (1.0 + shimmer * ${WAVE_INTENSITY.toFixed(2)} + magEffect * ${HOVER_INTENSITY.toFixed(2)});

                if (dist > maxPossibleRadius + 0.5) {
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
                float offsetY = (u_resolution.y - drawHeight) * 0.5 - (u_resolution.y * 0.03); // Move up by 5vh

                // Sample UV directly from cellCenter + uvOffset
                float u = (cellCenter.x + uvOffset.x - offsetX) / drawWidth;
                float v = (cellCenter.y + uvOffset.y - offsetY + u_scrollY) / drawHeight;
                vec2 uv = vec2(u, v);

                // Rotate UV space counter-clockwise by the user-defined angle to rotate the image clockwise
                float angle = ${(IMAGE_ROTATION_DEG * Math.PI) / 180}; // degrees to radians from config
                float cosA = cos(angle);
                float sinA = sin(angle);
                uv -= vec2(0.5, 0.5);
                uv = vec2(uv.x * cosA - uv.y * sinA, uv.x * sinA + uv.y * cosA);
                uv += vec2(0.5, 0.5);

                float brightness;
                float sampledBrightness = 255.0;
                if (u_imageFade > 0.001 && uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
                    vec4 color = texture2D(u_image, uv);
                    sampledBrightness = dot(color.rgb, vec3(0.333333)) * 255.0;
                }
                // When u_imageFade -> 0, treat the image as pure white (but keep waves).
                brightness = mix(255.0, sampledBrightness, clamp(u_imageFade, 0.0, 1.0));

                float rawSizeFactor = (255.0 - brightness) / 255.0;
                
                // Base size for the dot (0.15 min keeps background dots alive)
                float baseSize = max(0.15, rawSizeFactor) * u_baseRadius;
                
                // Apply hover effect exactly like the original formulation
                float hoverBonus = baseSize * (magEffect * ${HOVER_INTENSITY.toFixed(2)});
                
                // Make wave effects heavily independent of the image brightness!
                float effectScale = mix(0.65, 1.0, rawSizeFactor); 
                float waveBonus = u_baseRadius * (shimmer * ${WAVE_INTENSITY.toFixed(2)}) * effectScale;

                float dotSize = baseSize + waveBonus + hoverBonus;

                // Always draw dots, but smaller ones for bright areas
                if (dotSize > 0.1) {
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
        const uScrollY = gl.getUniformLocation(program, "u_scrollY");
        const uImageFade = gl.getUniformLocation(program, "u_imageFade");
        const uWaveStrength = gl.getUniformLocation(program, "u_waveStrength");
        const uMouse = gl.getUniformLocation(program, "u_mouse");
        const uHoverActive = gl.getUniformLocation(program, "u_hoverActive");

        gl.uniform1f(uGap, gap);
        gl.uniform1f(uBaseRadius, baseRadius);
        gl.uniform1f(uZoom, mobileZoom);
        gl.uniform1f(uFitContain, fitContain);
        if (uWaveStrength) gl.uniform1f(uWaveStrength, 1);

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
            if (uImageFade) {
                gl.uniform1f(uImageFade, isMobile ? 1.0 : computeImageFade());
            }
            if (uWaveStrength) {
                gl.uniform1f(uWaveStrength, computeWaveStrength());
            }

            if (isVisible && !document.hidden && isWindowFocused) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };

        let animationFrameId = 0;
        let isVisible = true;
        let isWindowFocused = true;

        let targetHover = 0;
        let currentHover = 0;
        let mouseX = -1000;
        let mouseY = -1000;
        const readScrollY = () => (window.scrollY || window.pageYOffset || 0) * dpr;
        let currentScrollY = disableScrollLinkedShaderOnIPhone ? 0 : readScrollY();
        let lastRenderedCSSScrollY = disableScrollLinkedShaderOnIPhone ? 0 : (window.scrollY || 0);
        const FRAME_INTERVAL = isMobile ? 1000 / 30 : 0; // 30fps cap on mobile, uncapped on desktop
        let lastFrameTime = 0;
        const handleScroll = () => {
            if (disableScrollLinkedShaderOnIPhone) return;
            const delta = (window.scrollY || 0) - lastRenderedCSSScrollY;
            canvas.style.transform = `translate3d(0, ${-delta}px, 0)`;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isMobile || !canvas || !isVisible) return;
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) * dpr;
            mouseY = (e.clientY - rect.top) * dpr;
            targetHover = 1;
        };

        const handleMouseLeave = () => {
            targetHover = 0;
        };

        if (!isMobile) {
            window.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', handleMouseLeave);
        }

        if (!disableScrollLinkedShaderOnIPhone) {
            window.addEventListener("scroll", handleScroll, { passive: true });
        }

        let introDone = getIntroPlayed();
        let startTimeOffset = 0;

        const handleIntroDone = () => {
            introDone = true;
            if (isVisible && isTextureLoaded && !document.hidden && isWindowFocused) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };

        if (!introDone) {
            window.addEventListener('intro-done', handleIntroDone, { once: true });
        }

        const render = (now: number) => {
            if (!isTextureLoaded || !isVisible || document.hidden || !isWindowFocused) return;
            if (!introDone) return;

            animationFrameId = requestAnimationFrame(render);

            if (FRAME_INTERVAL > 0) {
                const elapsed = now - lastFrameTime;
                if (elapsed < FRAME_INTERVAL) return;
                lastFrameTime = now - (elapsed % FRAME_INTERVAL);
            }
            
            const currentAnimTime = now - startTimeOffset;

            if (uGlobalTime) gl.uniform1f(uGlobalTime, currentAnimTime);

            if (!disableScrollLinkedShaderOnIPhone) {
                currentScrollY = readScrollY();
            }
            if (uScrollY) gl.uniform1f(uScrollY, currentScrollY);
            if (uImageFade) {
                gl.uniform1f(uImageFade, isMobile ? 1.0 : computeImageFade());
            }
            if (uWaveStrength) {
                gl.uniform1f(uWaveStrength, computeWaveStrength());
            }

            if (!isMobile) {
                currentHover += (targetHover - currentHover) * 0.15;
                if (Math.abs(targetHover - currentHover) < 0.001) currentHover = targetHover;
                if (uHoverActive) gl.uniform1f(uHoverActive, currentHover);
                if (uMouse) gl.uniform2f(uMouse, mouseX, mouseY);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            if (!disableScrollLinkedShaderOnIPhone) {
                lastRenderedCSSScrollY = (window.scrollY || 0);
                canvas.style.transform = 'translate3d(0, 0, 0)';
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const wasVisible = isVisible;
                    isVisible = entry.isIntersecting;
                    if (!wasVisible && isVisible && isTextureLoaded && !document.hidden && isWindowFocused) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = requestAnimationFrame(render);
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0 }
        );

        const handleVisibilityChange = () => {
            if (document.hidden || !isWindowFocused) {
                cancelAnimationFrame(animationFrameId);
                return;
            }
            if (isVisible && isTextureLoaded) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };

        const handleWindowBlur = () => {
            isWindowFocused = false;
            cancelAnimationFrame(animationFrameId);
        };

        const handleWindowFocus = () => {
            isWindowFocused = true;
            if (isVisible && isTextureLoaded && !document.hidden) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(render);
            }
        };


        let resizeTimer = 0;
        const debouncedResize = () => {
            cancelAnimationFrame(resizeTimer);
            resizeTimer = requestAnimationFrame(handleResize);
        };

        observer.observe(container);
        window.addEventListener("resize", debouncedResize);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);

        return () => {
            window.removeEventListener('intro-done', handleIntroDone);
            if (!isMobile) {
                window.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseleave', handleMouseLeave);
            }
            if (!disableScrollLinkedShaderOnIPhone) {
                window.removeEventListener("scroll", handleScroll);
            }
            observer.disconnect();
            cancelAnimationFrame(resizeTimer);
            window.removeEventListener("resize", debouncedResize);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(positionBuffer);
            gl.deleteTexture(texture);
        };
    }, []);


    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-svh -z-10 bg-white/50 dark:bg-neutral-900/50 pointer-events-none">
            <div className="w-full h-full dark:opacity-[0.45]">
                <canvas
                    ref={canvasRef}
                    className="block w-full h-full dark:invert dark:contrast-100 contrast-125 mix-blend-multiply dark:mix-blend-screen"
                    style={{ opacity: 0, willChange: 'opacity, transform', transform: 'translateZ(0)' }}
                />
            </div>
        </div>
    );
}

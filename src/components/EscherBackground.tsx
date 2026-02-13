"use client";

export default function EscherBackground() {
    return (
        <div className="fixed inset-0 w-full h-full z-0">
            <iframe
                src="/illusion-lab.html"
                className="w-full h-full border-none"
                title="Tessellation Background"
            />
            {/* Elliptical vignette: opaque white center, fading to transparent at edges */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 55% 45% at 50% 50%,
                            rgba(255,255,255,0.97) 0%,
                            rgba(255,255,255,0.93) 18%,
                            rgba(255,255,255,0.82) 35%,
                            rgba(255,255,255,0.55) 52%,
                            rgba(255,255,255,0.25) 66%,
                            rgba(255,255,255,0.08) 80%,
                            rgba(255,255,255,0.0)  100%
                        )
                    `,
                }}
            />
        </div>
    );
}

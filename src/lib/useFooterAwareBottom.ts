"use client";

import { useEffect, useState } from "react";

const FOOTER_SELECTOR = "[data-site-footer]";
const MOBILE_BREAKPOINT = 768;

export function useFooterAwareBottomOffset(desktopBottom: number, mobileBottom: number) {
    const [bottomOffset, setBottomOffset] = useState(desktopBottom);

    useEffect(() => {
        let frameId = 0;

        const updateOffset = () => {
            const footer = document.querySelector<HTMLElement>(FOOTER_SELECTOR);
            const baseBottom = window.innerWidth < MOBILE_BREAKPOINT ? mobileBottom : desktopBottom;

            if (!footer) {
                setBottomOffset((previous) => (previous === baseBottom ? previous : baseBottom));
                return;
            }

            const footerRect = footer.getBoundingClientRect();
            const overlap = Math.max(0, window.innerHeight - footerRect.top);
            const clampedOverlap = Math.min(overlap, footerRect.height);
            const nextBottom = Math.round(baseBottom + clampedOverlap);

            setBottomOffset((previous) => (previous === nextBottom ? previous : nextBottom));
        };

        const requestUpdate = () => {
            cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updateOffset);
        };

        requestUpdate();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("scroll", requestUpdate);
            window.removeEventListener("resize", requestUpdate);
        };
    }, [desktopBottom, mobileBottom]);

    return bottomOffset;
}

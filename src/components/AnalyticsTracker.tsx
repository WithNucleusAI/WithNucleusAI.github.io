"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase-client";

const VISITOR_KEY = "__nx_vid";     // localStorage: persistent random visitor UUID
const VISITOR_DAY_KEY = "__nx_vd";  // localStorage: day the current vid represents
const SESSION_KEY = "__nx_sid";     // sessionStorage: tab-scoped session id

// Only collect analytics on these hostnames. `dev.withnucleus.ai` and
// preview/staging deployments are excluded so dashboard data reflects only
// real production traffic. Localhost stays on for dev testing.
const TRACKED_HOSTNAMES = new Set([
    "withnucleus.ai",
    "www.withnucleus.ai",
    "localhost",
    "127.0.0.1",
]);

const BOT_RE = /bot|crawl|spider|slurp|bing|yahoo|duckduckgo|baidu|yandex|facebookexternalhit|embedly|whatsapp|telegram|slack|discord|twitter|linkedin|preview|lighthouse|headless/i;

function rid(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID().replace(/-/g, "");
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function utcDay(): string {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Get a visitor-scoped ID that's stable across the whole site but rotates
 * daily. The daily rotation means Firestore can't correlate one visitor's
 * behaviour across days, matching the spirit of the original server-side
 * daily-hash design (just stored locally now).
 */
function getVisitorHash(): string {
    try {
        const storedDay = localStorage.getItem(VISITOR_DAY_KEY);
        const today = utcDay();
        if (storedDay === today) {
            const existing = localStorage.getItem(VISITOR_KEY);
            if (existing) return existing;
        }
        const fresh = rid();
        localStorage.setItem(VISITOR_KEY, fresh);
        localStorage.setItem(VISITOR_DAY_KEY, today);
        return fresh;
    } catch {
        return rid();
    }
}

function getSessionId(): string {
    try {
        let id = sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id = rid();
            sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        return rid();
    }
}

// --- UA parsing (pure, browser-safe) ---

type Device = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

function detectDevice(ua: string): Device {
    if (!ua) return "unknown";
    if (BOT_RE.test(ua)) return "bot";
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
    if (/Mobile|Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)) return "mobile";
    return "desktop";
}

function detectBrowser(ua: string): string {
    if (!ua) return "unknown";
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\/|Opera/.test(ua)) return "Opera";
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    if (/Firefox\//.test(ua)) return "Firefox";
    return "Other";
}

function detectOS(ua: string): string {
    if (!ua) return "unknown";
    if (/Windows NT/.test(ua)) return "Windows";
    if (/Mac OS X/.test(ua) && !/Mobile/.test(ua)) return "macOS";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    if (/Linux/.test(ua)) return "Linux";
    return "Other";
}

function normalizePath(raw: string): string {
    try {
        const u = new URL(raw, "https://withnucleus.ai");
        let p = u.pathname;
        if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
        return p.slice(0, 200);
    } catch {
        return raw.slice(0, 200);
    }
}

function normalizeReferrer(raw: string | null | undefined): string | null {
    if (!raw) return null;
    try {
        const u = new URL(raw);
        if (u.hostname === "withnucleus.ai" || u.hostname.endsWith(".withnucleus.ai")) return null;
        if (u.hostname === "localhost") return null;
        return `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`.slice(0, 200);
    } catch {
        return null;
    }
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const viewIdRef = useRef<string | null>(null);
    const accumRef = useRef<number>(0);
    const visibleSinceRef = useRef<number | null>(null);

    useEffect(() => {
        // Scope tracking to production (and localhost for dev).
        // Explicitly excludes dev.withnucleus.ai, preview deploys, and
        // anything else unknown.
        if (!TRACKED_HOSTNAMES.has(window.location.hostname)) return;

        // Respect DNT as a courtesy.
        try {
            if (
                typeof navigator !== "undefined" &&
                // @ts-expect-error — non-standard but present on many browsers
                (navigator.doNotTrack === "1" || navigator.msDoNotTrack === "1" || window.doNotTrack === "1")
            ) {
                return;
            }
        } catch {
            /* ignore */
        }

        const ua = navigator.userAgent || "";
        if (BOT_RE.test(ua)) return;

        const db = (() => {
            try {
                return getClientDb();
            } catch {
                return null;
            }
        })();
        if (!db) return;

        // Close previous view if there is one (SPA navigation).
        if (viewIdRef.current) {
            flush(viewIdRef.current);
        }

        const viewId = rid();
        viewIdRef.current = viewId;
        accumRef.current = 0;
        visibleSinceRef.current = document.visibilityState === "visible" ? Date.now() : null;

        const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        const day = utcDay();

        const visitDoc = {
            viewId,
            sessionId: getSessionId(),
            visitorHash: getVisitorHash(),
            path: normalizePath(path),
            referrer: normalizeReferrer(document.referrer),
            country: "ZZ",   // unknown without server-side IP; kept for schema compat
            region: null,
            city: null,
            device: detectDevice(ua),
            browser: detectBrowser(ua),
            os: detectOS(ua),
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            lang: navigator.language,
            screenW: window.screen?.width ?? null,
            screenH: window.screen?.height ?? null,
            day,
            ts: serverTimestamp(),
            duration: 0,
        };

        // Fire-and-forget — analytics must never break the app.
        setDoc(doc(db, "visits", viewId), visitDoc).catch(() => {});

        function accumulateIfVisible() {
            if (visibleSinceRef.current != null) {
                accumRef.current += Date.now() - visibleSinceRef.current;
                visibleSinceRef.current = null;
            }
        }

        function flush(id: string) {
            accumulateIfVisible();
            const duration = Math.max(0, Math.min(60 * 30, Math.round(accumRef.current / 1000)));
            // Use updateDoc; if the create hasn't landed yet it'll retry once.
            updateDoc(doc(db!, "visits", id), { duration, closedAt: serverTimestamp() }).catch(() => {});
        }

        function onVisibility() {
            if (document.visibilityState === "visible") {
                visibleSinceRef.current = Date.now();
            } else {
                accumulateIfVisible();
                const id = viewIdRef.current;
                if (id) flush(id);
            }
        }

        function onPageHide() {
            const id = viewIdRef.current;
            if (id) flush(id);
        }

        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pagehide", onPageHide);

        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("pagehide", onPageHide);
        };
    }, [pathname, searchParams]);

    return null;
}

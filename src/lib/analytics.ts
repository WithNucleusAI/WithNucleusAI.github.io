// Shared analytics helpers — safe for both server (dashboard) and client (tracker).
// Since we switched to a client-side tracker that writes directly to Firestore,
// the server-side UA/geo/IP helpers are no longer needed. This module now only
// contains PST timezone utilities used by the dashboard.

const PST_TZ = "America/Los_Angeles";

// Cached formatter (Intl.DateTimeFormat construction isn't free).
const pstPartsFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: PST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
});

export type PstParts = {
    day: string;    // YYYY-MM-DD in PST
    month: string;  // YYYY-MM in PST
    hour: number;   // 0-23 in PST
    dow: number;    // 0 = Sunday ... 6 = Saturday, PST
    label: string;  // "YYYY-MM-DD HH:mm" PST
};

const DOW_TO_INDEX: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

export function toPstParts(d: Date): PstParts {
    const raw = pstPartsFmt.formatToParts(d);
    const map: Record<string, string> = {};
    for (const p of raw) if (p.type !== "literal") map[p.type] = p.value;
    const year = map.year ?? "0000";
    const month = map.month ?? "01";
    const day = map.day ?? "01";
    let hour = parseInt(map.hour ?? "0", 10);
    if (hour === 24) hour = 0; // Intl quirk for midnight
    const minute = map.minute ?? "00";
    const dow = DOW_TO_INDEX[map.weekday ?? "Sun"] ?? 0;
    return {
        day: `${year}-${month}-${day}`,
        month: `${year}-${month}`,
        hour,
        dow,
        label: `${year}-${month}-${day} ${String(hour).padStart(2, "0")}:${minute}`,
    };
}

/**
 * UTC instant corresponding to 00:00 PST on the given YYYY-MM-DD (PST day).
 * Handles DST by asking Intl for the offset that applies at noon PST that day.
 */
export function pstStartOfDay(pstDay: string): Date {
    // Anchor at 20:00 UTC — that's roughly noon PDT (UTC-7) / 12:00 PST
    // (UTC-8 → 20:00Z = 12:00 PST). Either way, safely within the same PST
    // calendar day across DST transitions.
    const noonPstApprox = new Date(`${pstDay}T20:00:00Z`);
    const parts = toPstParts(noonPstApprox);
    const offsetHours = 20 - parts.hour; // 7 for PDT, 8 for PST
    return new Date(`${pstDay}T${String(offsetHours).padStart(2, "0")}:00:00Z`);
}

/** Start of today in PST, as a UTC instant. */
export function pstStartOfToday(now = new Date()): Date {
    return pstStartOfDay(toPstParts(now).day);
}

export const PST_DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

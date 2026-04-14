"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
    where,
} from "firebase/firestore";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    Cell,
} from "recharts";
import { getClientDb } from "@/lib/firebase-client";
import {
    PST_DOW_LABELS,
    pstStartOfDay,
    pstStartOfToday,
    toPstParts,
} from "@/lib/analytics";

type RangeKey = "24h" | "7d" | "30d" | "90d" | "custom";
type Bucket = "hour" | "day" | "week";

type VisitDoc = {
    viewId: string;
    sessionId: string;
    visitorHash: string;
    path: string;
    referrer?: string | null;
    country: string;
    region?: string | null;
    city?: string | null;
    device: string;
    browser: string;
    os: string;
    tz?: string | null;
    lang?: string | null;
    day: string;
    duration: number;
    ts?: Timestamp;
};

type RangeInfo = {
    range: RangeKey;
    fromUtc: Date;
    toUtc: Date;
    bucket: Bucket;
    label: string;
};

type Aggregates = {
    timeline: Array<{ bucket: string; label: string; views: number }>;
    hourOfDay: Array<{ hour: number; count: number }>;
    dayOfWeek: Array<{ key: string; count: number }>;
    totalViews: number;
    uniqueVisitors: number;
    sessions: number;
    topPages: Array<{ key: string; count: number }>;
    topCountries: Array<{ key: string; count: number }>;
    topCities: Array<{ key: string; count: number }>;
    topTimezones: Array<{ key: string; count: number }>;
    topLanguages: Array<{ key: string; count: number }>;
    topDevices: Array<{ key: string; count: number }>;
    topBrowsers: Array<{ key: string; count: number }>;
    topOses: Array<{ key: string; count: number }>;
    topReferrers: Array<{ key: string; count: number }>;
    perPage: Array<{ path: string; views: number; durationSamples: number; avg: number }>;
    recent: Array<{
        path: string;
        country: string;
        region: string | null;
        city: string | null;
        device: string;
        browser: string;
        os: string;
        referrer: string | null;
        duration: number;
        ts: number;
        pstLabel: string;
    }>;
};

// ---- helpers ----

function parseRange(sp: URLSearchParams): RangeInfo {
    const now = new Date();
    const r = (sp.get("range") as RangeKey) || "7d";
    const from = sp.get("from");
    const to = sp.get("to");

    if (r === "custom" && from && to) {
        const fromUtc = pstStartOfDay(from);
        const toUtc = new Date(pstStartOfDay(to).getTime() + 24 * 3600 * 1000);
        const days = Math.max(1, Math.round((toUtc.getTime() - fromUtc.getTime()) / 86400000));
        return {
            range: "custom",
            fromUtc,
            toUtc,
            bucket: days <= 2 ? "hour" : days <= 60 ? "day" : "week",
            label: `${from} → ${to} PST`,
        };
    }
    if (r === "24h") {
        return {
            range: "24h",
            fromUtc: new Date(now.getTime() - 24 * 3600 * 1000),
            toUtc: now,
            bucket: "hour",
            label: "last 24h (PST)",
        };
    }
    if (r === "30d") {
        return {
            range: "30d",
            fromUtc: new Date(pstStartOfToday(now).getTime() - 29 * 86400000),
            toUtc: now,
            bucket: "day",
            label: "last 30 days (PST)",
        };
    }
    if (r === "90d") {
        return {
            range: "90d",
            fromUtc: new Date(pstStartOfToday(now).getTime() - 89 * 86400000),
            toUtc: now,
            bucket: "week",
            label: "last 90 days (PST)",
        };
    }
    return {
        range: "7d",
        fromUtc: new Date(pstStartOfToday(now).getTime() - 6 * 86400000),
        toUtc: now,
        bucket: "day",
        label: "last 7 days (PST)",
    };
}

function pstWeekKey(d: Date): string {
    const parts = toPstParts(d);
    const base = new Date(parts.day + "T12:00:00Z");
    const dow = toPstParts(base).dow;
    base.setUTCDate(base.getUTCDate() - dow);
    return toPstParts(base).day;
}

function bucketKey(d: Date, bucket: Bucket): string {
    const parts = toPstParts(d);
    if (bucket === "hour") return `${parts.day} ${String(parts.hour).padStart(2, "0")}`;
    if (bucket === "day") return parts.day;
    return pstWeekKey(d);
}

function allBucketsBetween(fromUtc: Date, toUtc: Date, bucket: Bucket): string[] {
    const keys: string[] = [];
    if (bucket === "hour") {
        const start = new Date(fromUtc);
        start.setUTCMinutes(0, 0, 0);
        for (let t = start.getTime(); t <= toUtc.getTime(); t += 3600_000) {
            keys.push(bucketKey(new Date(t), "hour"));
        }
    } else if (bucket === "day") {
        const startDay = toPstParts(fromUtc).day;
        let cur = pstStartOfDay(startDay);
        while (cur.getTime() <= toUtc.getTime()) {
            keys.push(toPstParts(cur).day);
            const next = new Date(cur.getTime() + 26 * 3600_000);
            cur = pstStartOfDay(toPstParts(next).day);
        }
    } else {
        let cur = pstStartOfDay(pstWeekKey(fromUtc));
        while (cur.getTime() <= toUtc.getTime()) {
            keys.push(toPstParts(cur).day);
            const next = new Date(cur.getTime() + 8 * 86400_000);
            cur = pstStartOfDay(pstWeekKey(next));
        }
    }
    return keys;
}

function topN(m: Map<string, number>, n: number): Array<{ key: string; count: number }> {
    return [...m.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([key, count]) => ({ key, count }));
}

function aggregate(docs: VisitDoc[], range: RangeInfo): Aggregates {
    const timelineMap = new Map<string, number>();
    const hourOfDay = new Array(24).fill(0) as number[];
    const dayOfWeek = new Array(7).fill(0) as number[];
    const pages = new Map<string, number>();
    const countries = new Map<string, number>();
    const cities = new Map<string, number>();
    const timezones = new Map<string, number>();
    const languages = new Map<string, number>();
    const devices = new Map<string, number>();
    const browsers = new Map<string, number>();
    const oses = new Map<string, number>();
    const referrers = new Map<string, number>();
    const uniqHashes = new Set<string>();
    const uniqSessions = new Set<string>();
    const pageDurations = new Map<string, { total: number; n: number }>();

    for (const v of docs) {
        if (!v.ts) continue;
        const d = v.ts.toDate();
        const parts = toPstParts(d);
        const bk = bucketKey(d, range.bucket);
        timelineMap.set(bk, (timelineMap.get(bk) ?? 0) + 1);
        hourOfDay[parts.hour] += 1;
        dayOfWeek[parts.dow] += 1;

        if (v.path) pages.set(v.path, (pages.get(v.path) ?? 0) + 1);
        if (v.country && v.country !== "ZZ") countries.set(v.country, (countries.get(v.country) ?? 0) + 1);
        if (v.city) cities.set(v.city, (cities.get(v.city) ?? 0) + 1);
        if (v.tz) timezones.set(v.tz, (timezones.get(v.tz) ?? 0) + 1);
        if (v.lang) languages.set(v.lang, (languages.get(v.lang) ?? 0) + 1);
        if (v.device) devices.set(v.device, (devices.get(v.device) ?? 0) + 1);
        if (v.browser) browsers.set(v.browser, (browsers.get(v.browser) ?? 0) + 1);
        if (v.os) oses.set(v.os, (oses.get(v.os) ?? 0) + 1);
        if (v.referrer) referrers.set(v.referrer, (referrers.get(v.referrer) ?? 0) + 1);
        if (v.visitorHash) uniqHashes.add(v.visitorHash);
        if (v.sessionId) uniqSessions.add(v.sessionId);
        if (v.path && typeof v.duration === "number" && v.duration > 0) {
            const cur = pageDurations.get(v.path) ?? { total: 0, n: 0 };
            cur.total += v.duration;
            cur.n += 1;
            pageDurations.set(v.path, cur);
        }
    }

    const timelineKeys = allBucketsBetween(range.fromUtc, range.toUtc, range.bucket);
    const timeline = timelineKeys.map((k) => ({
        bucket: k,
        label:
            range.bucket === "hour"
                ? k.slice(5)
                : range.bucket === "week"
                  ? `wk ${k.slice(5)}`
                  : k.slice(5),
        views: timelineMap.get(k) ?? 0,
    }));

    // Per-page stats: views + (duration sample size + avg time). Views come
    // from the full `pages` map so a page shows up even if no visit ever
    // reported a non-zero duration yet. Duration info is only filled when
    // at least one sample exists.
    const perPage: Array<{ path: string; views: number; durationSamples: number; avg: number }> =
        [...pages.entries()]
            .map(([path, views]) => {
                const d = pageDurations.get(path);
                return {
                    path,
                    views,
                    durationSamples: d?.n ?? 0,
                    avg: d && d.n > 0 ? d.total / d.n : 0,
                };
            })
            .sort((a, b) => b.views - a.views);

    return {
        timeline,
        hourOfDay: hourOfDay.map((count, hour) => ({ hour, count })),
        dayOfWeek: dayOfWeek.map((count, i) => ({ key: PST_DOW_LABELS[i]!, count })),
        totalViews: docs.length,
        uniqueVisitors: uniqHashes.size,
        sessions: uniqSessions.size,
        topPages: topN(pages, 10),
        topCountries: topN(countries, 10),
        topCities: topN(cities, 10),
        topTimezones: topN(timezones, 10),
        topLanguages: topN(languages, 10),
        topDevices: topN(devices, 8),
        topBrowsers: topN(browsers, 8),
        topOses: topN(oses, 8),
        topReferrers: topN(referrers, 10),
        perPage,
        recent: [], // filled separately
    };
}

async function fetchData(range: RangeInfo): Promise<Aggregates> {
    const db = getClientDb();
    const visitsRef = collection(db, "visits");

    // Firestore client SDK caps `limit` at 10000. For a low-volume site
    // that's plenty; if visits eventually exceed this within a window, we'd
    // page with `startAfter` or move aggregation server-side.
    const q = query(
        visitsRef,
        where("ts", ">=", Timestamp.fromDate(range.fromUtc)),
        where("ts", "<", Timestamp.fromDate(range.toUtc)),
        orderBy("ts", "desc"),
        limit(10000)
    );

    const [snap, recentSnap] = await Promise.all([
        getDocs(q),
        getDocs(query(visitsRef, orderBy("ts", "desc"), limit(50))),
    ]);

    const docs = snap.docs.map((d) => d.data() as VisitDoc);
    const agg = aggregate(docs, range);

    agg.recent = recentSnap.docs.map((doc) => {
        const v = doc.data() as VisitDoc;
        const d = v.ts ? v.ts.toDate() : null;
        const parts = d ? toPstParts(d) : null;
        return {
            path: v.path,
            country: v.country,
            region: v.region ?? null,
            city: v.city ?? null,
            device: v.device,
            browser: v.browser,
            os: v.os,
            referrer: v.referrer ?? null,
            duration: v.duration ?? 0,
            ts: d ? d.getTime() : 0,
            pstLabel: parts?.label ?? "",
        };
    });

    return agg;
}

// ---- presentation helpers ----

function formatDuration(s: number): string {
    if (!s) return "—";
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s - m * 60;
    return r ? `${m}m ${r}s` : `${m}m`;
}

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
        <div className="border border-black/20 dark:border-white/20 p-5 text-left">
            <div className="text-xs uppercase opacity-60 tracking-wider">{label}</div>
            <div className="text-3xl font-bold mt-2 font-[var(--font-base)]">{value}</div>
            {sub && <div className="text-xs opacity-50 mt-1">{sub}</div>}
        </div>
    );
}

function BarList({
    title,
    rows,
    empty = "No data yet",
}: {
    title: string;
    rows: Array<{ key: string; count: number }>;
    empty?: string;
}) {
    const max = rows[0]?.count ?? 1;
    return (
        <div className="border border-black/20 dark:border-white/20 p-5 text-left">
            <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">{title}</h3>
            {rows.length === 0 ? (
                <p className="text-xs opacity-50">{empty}</p>
            ) : (
                <ul className="space-y-1.5">
                    {rows.map((r) => (
                        <li key={r.key} className="relative">
                            <div
                                className="absolute inset-0 bg-black/5 dark:bg-white/10"
                                style={{ width: `${(r.count / max) * 100}%` }}
                            />
                            <div className="relative flex justify-between text-xs py-1 px-2 font-[var(--font-code)]">
                                <span className="truncate pr-2">{r.key}</span>
                                <span className="tabular-nums opacity-70">{r.count}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Featured pages block — large cards for the pages we most care about
 * (home and image model). Each card shows views, how many of those views
 * recorded a dwell time, and the mean dwell time. If a page hasn't been
 * visited in the current window, the card still renders to make that
 * legible, rather than silently disappearing.
 */
const FEATURED = [
    { path: "/", label: "Home" },
    { path: "/image", label: "Image model" },
];

function FeaturedPages({
    perPage,
}: {
    perPage: Array<{ path: string; views: number; durationSamples: number; avg: number }>;
}) {
    const byPath = new Map(perPage.map((p) => [p.path, p]));
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {FEATURED.map(({ path, label }) => {
                const row = byPath.get(path);
                const views = row?.views ?? 0;
                const samples = row?.durationSamples ?? 0;
                const avg = samples > 0 ? Math.round(row!.avg) : 0;
                return (
                    <div
                        key={path}
                        className="border border-black/20 dark:border-white/20 p-5 text-left"
                    >
                        <div className="flex items-baseline justify-between">
                            <div className="text-xs uppercase opacity-60 tracking-wider">
                                {label}
                            </div>
                            <div className="text-xs font-[var(--font-code)] opacity-50">
                                {path}
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] uppercase opacity-50 tracking-wider">
                                    Views
                                </div>
                                <div className="text-2xl font-bold mt-0.5 font-[var(--font-base)]">
                                    {views.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase opacity-50 tracking-wider">
                                    Avg view time
                                </div>
                                <div className="text-2xl font-bold mt-0.5 font-[var(--font-base)]">
                                    {samples > 0 ? formatDuration(avg) : "—"}
                                </div>
                                {samples > 0 && (
                                    <div className="text-[10px] opacity-50 mt-0.5">
                                        from {samples} sample{samples === 1 ? "" : "s"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}

const DEVICE_COLORS: Record<string, string> = {
    desktop: "#6366f1",
    mobile: "#ec4899",
    tablet: "#f59e0b",
    bot: "#64748b",
    unknown: "#94a3b8",
};

const TOOLTIP = {
    contentStyle: {
        background: "rgba(0,0,0,0.85)",
        border: "none",
        color: "white",
        fontSize: 12,
    },
    labelStyle: { color: "white" },
};

// ---- component ----

export default function DashboardClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const range = useMemo(
        () => parseRange(new URLSearchParams(searchParams?.toString() ?? "")),
        [searchParams]
    );

    const [data, setData] = useState<Aggregates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState(searchParams?.get("from") ?? "");
    const [to, setTo] = useState(searchParams?.get("to") ?? "");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchData(range)
            .then((d) => {
                if (!cancelled) {
                    setData(d);
                    setLoading(false);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : "unknown error");
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [range]);

    function applyCustom(e: React.FormEvent) {
        e.preventDefault();
        if (!from || !to) return;
        router.push(`?range=custom&from=${from}&to=${to}`);
    }

    if (error) {
        return (
            <div className="w-full max-w-5xl mx-auto px-6 py-12 text-left">
                <h1 className="text-3xl font-bold mb-4">Analytics</h1>
                <p className="text-red-500 font-[var(--font-code)]">Could not load: {error}</p>
            </div>
        );
    }

    if (loading || !data) {
        return (
            <div className="w-full max-w-5xl mx-auto px-6 py-12 text-left">
                <h1 className="text-3xl font-bold mb-4">Nucleus · Site analytics</h1>
                <p className="text-sm opacity-60 font-[var(--font-code)]">Loading {range.label}…</p>
            </div>
        );
    }

    const peakHour = data.hourOfDay.reduce(
        (best, cur) => (cur.count > best.count ? cur : best),
        { hour: 0, count: 0 }
    );

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-10 text-left">
            <header className="flex items-baseline justify-between flex-wrap gap-3 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Nucleus · Site analytics</h1>
                    <p className="text-sm opacity-60 mt-1">
                        Private · {range.label} · all times in PST (America/Los_Angeles)
                    </p>
                </div>
                <nav className="flex gap-1 text-sm font-[var(--font-code)]">
                    {(["24h", "7d", "30d", "90d"] as const).map((k) => (
                        <Link
                            key={k}
                            href={`?range=${k}`}
                            className={`px-3 py-1 border ${
                                range.range === k
                                    ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                                    : "border-black/20 dark:border-white/20"
                            }`}
                        >
                            {k}
                        </Link>
                    ))}
                </nav>
            </header>

            <form
                onSubmit={applyCustom}
                className="flex flex-wrap items-center gap-2 mb-6 text-xs font-[var(--font-code)]"
            >
                <span className="opacity-60 uppercase tracking-wider">Custom (PST):</span>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent border border-black/20 dark:border-white/20 px-2 py-1"
                />
                <span className="opacity-50">→</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-transparent border border-black/20 dark:border-white/20 px-2 py-1"
                />
                <button
                    type="submit"
                    className="px-3 py-1 border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                >
                    Apply
                </button>
                {range.range === "custom" && (
                    <Link href="?range=7d" className="opacity-60 hover:opacity-100 ml-2">
                        clear
                    </Link>
                )}
            </form>

            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Card label="Pageviews" value={data.totalViews.toLocaleString()} />
                <Card
                    label="Unique visitors"
                    value={data.uniqueVisitors.toLocaleString()}
                    sub="daily-rotating"
                />
                <Card label="Sessions" value={data.sessions.toLocaleString()} />
                <Card
                    label="Peak hour (PST)"
                    value={peakHour.count > 0 ? `${peakHour.hour}:00` : "—"}
                    sub={peakHour.count > 0 ? `${peakHour.count} views` : undefined}
                />
            </section>

            <section className="border border-black/20 dark:border-white/20 p-5 mb-6">
                <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">
                    Pageviews over time
                    <span className="opacity-50 ml-2 normal-case">
                        ({range.bucket === "hour" ? "hourly" : range.bucket === "week" ? "weekly" : "daily"}, PST)
                    </span>
                </h3>
                <div className="h-64 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.timeline} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.15} />
                            <XAxis
                                dataKey="label"
                                stroke="currentColor"
                                strokeOpacity={0.5}
                                tick={{ fontSize: 10 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="currentColor"
                                strokeOpacity={0.5}
                                tick={{ fontSize: 10 }}
                                allowDecimals={false}
                            />
                            <Tooltip {...TOOLTIP} />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={data.timeline.length <= 48 ? { r: 2 } : false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
                <div className="border border-black/20 dark:border-white/20 p-5">
                    <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">Hour of day (PST)</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.hourOfDay} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="hour"
                                    stroke="currentColor"
                                    strokeOpacity={0.5}
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(h: number) => `${h}`}
                                    interval={1}
                                />
                                <YAxis
                                    stroke="currentColor"
                                    strokeOpacity={0.5}
                                    tick={{ fontSize: 10 }}
                                    allowDecimals={false}
                                />
                                <Tooltip {...TOOLTIP} labelFormatter={(h) => `${h}:00 PST`} />
                                <Bar dataKey="count" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="border border-black/20 dark:border-white/20 p-5">
                    <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">Day of week (PST)</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dayOfWeek} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 4" stroke="currentColor" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="key"
                                    stroke="currentColor"
                                    strokeOpacity={0.5}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    stroke="currentColor"
                                    strokeOpacity={0.5}
                                    tick={{ fontSize: 10 }}
                                    allowDecimals={false}
                                />
                                <Tooltip {...TOOLTIP} />
                                <Bar dataKey="count" fill="#ec4899" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <BarList title="Top pages" rows={data.topPages} />
                <BarList title="Top timezones" rows={data.topTimezones} empty="No timezone data" />
                <BarList title="Top languages" rows={data.topLanguages} empty="No language data" />
                <BarList title="Referrers" rows={data.topReferrers} empty="No external referrers" />
            </section>

            {(data.topCountries.length > 0 || data.topCities.length > 0) && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <BarList title="Top countries (legacy)" rows={data.topCountries} empty="No country data" />
                    <BarList title="Top cities (legacy)" rows={data.topCities} empty="No city data" />
                </section>
            )}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="border border-black/20 dark:border-white/20 p-5">
                    <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">Devices</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topDevices} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="key"
                                    stroke="currentColor"
                                    strokeOpacity={0.6}
                                    tick={{ fontSize: 11 }}
                                    width={60}
                                />
                                <Tooltip {...TOOLTIP} />
                                <Bar dataKey="count">
                                    {data.topDevices.map((d) => (
                                        <Cell key={d.key} fill={DEVICE_COLORS[d.key] ?? "#64748b"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <BarList title="Browsers" rows={data.topBrowsers} />
                <BarList title="Operating systems" rows={data.topOses} />
            </section>

            <FeaturedPages perPage={data.perPage} />

            <section className="border border-black/20 dark:border-white/20 p-5 mb-6">
                <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">
                    All pages · views & average time
                </h3>
                {data.perPage.length === 0 ? (
                    <p className="text-xs opacity-50">No page data yet</p>
                ) : (
                    <table className="w-full text-xs font-[var(--font-code)]">
                        <thead>
                            <tr className="opacity-60 text-left">
                                <th className="py-1.5 pr-2">Path</th>
                                <th className="py-1.5 pr-2 text-right">Views</th>
                                <th className="py-1.5 pr-2 text-right">With dwell data</th>
                                <th className="py-1.5 pr-2 text-right">Avg time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.perPage.map((r) => (
                                <tr key={r.path} className="border-t border-black/10 dark:border-white/10">
                                    <td className="py-1.5 pr-2 truncate max-w-xs">{r.path}</td>
                                    <td className="py-1.5 pr-2 text-right tabular-nums">{r.views}</td>
                                    <td className="py-1.5 pr-2 text-right tabular-nums opacity-60">
                                        {r.durationSamples}
                                    </td>
                                    <td className="py-1.5 pr-2 text-right tabular-nums">
                                        {r.durationSamples > 0
                                            ? formatDuration(Math.round(r.avg))
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="border border-black/20 dark:border-white/20 p-5 mb-10">
                <h3 className="text-sm uppercase tracking-wider opacity-70 mb-3">
                    Recent visits (live, last 50)
                </h3>
                {data.recent.length === 0 ? (
                    <p className="text-xs opacity-50">No visits yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs font-[var(--font-code)]">
                            <thead>
                                <tr className="opacity-60 text-left">
                                    <th className="py-1.5 pr-3">When (PST)</th>
                                    <th className="py-1.5 pr-3">Path</th>
                                    <th className="py-1.5 pr-3">Device</th>
                                    <th className="py-1.5 pr-3">Browser</th>
                                    <th className="py-1.5 pr-3">Referrer</th>
                                    <th className="py-1.5 pr-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recent.map((v, i) => (
                                    <tr
                                        key={v.ts + v.path + i}
                                        className="border-t border-black/10 dark:border-white/10"
                                    >
                                        <td className="py-1.5 pr-3 opacity-80">{v.pstLabel}</td>
                                        <td className="py-1.5 pr-3 truncate max-w-[220px]">{v.path}</td>
                                        <td className="py-1.5 pr-3">{v.device}</td>
                                        <td className="py-1.5 pr-3">
                                            {v.browser} / {v.os}
                                        </td>
                                        <td className="py-1.5 pr-3 truncate max-w-[180px] opacity-80">
                                            {v.referrer ?? "—"}
                                        </td>
                                        <td className="py-1.5 pr-3 text-right tabular-nums">
                                            {formatDuration(v.duration)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

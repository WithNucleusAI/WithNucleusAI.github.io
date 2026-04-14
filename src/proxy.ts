import { NextRequest, NextResponse } from "next/server";

// Hosts allowed to see /dashboard. Anywhere else returns 404 (so main domain
// users don't know the page exists). Localhost is included for dev.
const DASHBOARD_HOSTS = new Set([
    "dev.withnucleus.ai",
    "localhost:3000",
    "127.0.0.1:3000",
]);

function unauthorized() {
    return new NextResponse("Authentication required", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Nucleus analytics", charset="UTF-8"',
            "Cache-Control": "no-store",
        },
    });
}

function notFound() {
    return new NextResponse("Not found", { status: 404 });
}

export function proxy(req: NextRequest) {
    const host = (req.headers.get("host") ?? "").toLowerCase();

    if (!DASHBOARD_HOSTS.has(host)) {
        return notFound();
    }

    const expected = process.env.DASHBOARD_PASSWORD || "apparao&paparao";
    const auth = req.headers.get("authorization");
    if (!auth || !auth.toLowerCase().startsWith("basic ")) {
        return unauthorized();
    }

    let decoded: string;
    try {
        decoded = atob(auth.slice(6).trim());
    } catch {
        return unauthorized();
    }

    // "username:password" — we accept any username, check only password.
    const colon = decoded.indexOf(":");
    const pwd = colon === -1 ? decoded : decoded.slice(colon + 1);
    if (pwd !== expected) {
        return unauthorized();
    }

    return NextResponse.next();
}

export const config = {
    // Match the dashboard page and any sub-routes under it.
    matcher: ["/dashboard", "/dashboard/:path*"],
};

import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

// No admin SDK, no Firestore queries here — the dashboard fetches data
// client-side via the Firebase web SDK (see DashboardClient). This makes
// the page deployable anywhere without server env vars.

export const metadata: Metadata = {
    title: "Nucleus · analytics",
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false },
    },
};

// Dashboard reads URL search params (?range=7d etc) client-side. Wrapping in
// Suspense prevents Next.js from attempting to statically prerender it and
// bailing when it hits useSearchParams.
// Also forces fully dynamic rendering to avoid any SSR attempt.
export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <DashboardClient />
        </Suspense>
    );
}

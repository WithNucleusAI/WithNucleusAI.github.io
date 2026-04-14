# Site visit tracker

Fully client-side analytics. Both the tracker and the dashboard read/write
Firestore directly using the Firebase web SDK. No server code, no env vars
needed on Cloud Run, no GCP access required to ship.

```
[production browsers on withnucleus.ai]
   │  Firestore web SDK (public config)
   ▼
[Firestore: nucleus-website-tracker/default]
   ▲
   │  Firestore web SDK (public config)
   │
[dashboard browser on dev.withnucleus.ai/dashboard]
```

## Where what runs

| Host | Tracker fires? | Dashboard accessible? |
| --- | --- | --- |
| `withnucleus.ai` (production) | ✅ | ❌ (404) |
| `dev.withnucleus.ai` | ❌ (explicitly excluded) | ✅ (password-gated) |
| `localhost:3000` | ✅ (for dev testing) | ✅ (password-gated) |
| anywhere else | ❌ | ❌ |

The hostname allowlist lives in `src/components/AnalyticsTracker.tsx`
(`TRACKED_HOSTNAMES`) and `src/proxy.ts` (`DASHBOARD_HOSTS`).

## Files

- **Tracker** — `src/components/AnalyticsTracker.tsx`
  Mounted once in the root layout. Scoped to `TRACKED_HOSTNAMES` only.
  Writes each pageview to Firestore on route change; updates with dwell
  time on `visibilitychange` / `pagehide`.
- **Firebase client init** — `src/lib/firebase-client.ts`
  Public config + handle to the `default` Firestore database.
- **Dashboard shell** — `src/app/dashboard/page.tsx`
  Tiny server component, just metadata + `<DashboardClient/>`.
- **Dashboard** — `src/app/dashboard/DashboardClient.tsx`
  Client component. Queries Firestore directly, aggregates in memory,
  renders all charts and tables.
- **Proxy gate** — `src/proxy.ts`
  Restricts `/dashboard` to allowed hostnames + HTTP Basic auth password.
- **Security rules** — `firestore.rules`
  Strict schema for writes, public reads for the dashboard.
- **PST helpers** — `src/lib/analytics.ts`

## What the tracker collects per pageview

| Field | Source |
| --- | --- |
| `path` | URL pathname + query |
| `referrer` | `document.referrer` (external only) |
| `device` | UA regex: mobile/tablet/desktop/bot/unknown |
| `browser` | UA regex: Chrome/Safari/Firefox/Edge/Opera/Other |
| `os` | UA regex: macOS/Windows/iOS/Android/Linux/Other |
| `tz` | `Intl.DateTimeFormat().resolvedOptions().timeZone` |
| `lang` | `navigator.language` |
| `screenW`, `screenH` | Physical screen |
| `sessionId` | sessionStorage UUID (tab-scoped) |
| `visitorHash` | localStorage UUID, rotates daily |
| `duration` | Visible seconds on page, capped at 30 min |
| `country`, `region`, `city` | Not set (client-side has no IP) — always `"ZZ"` / null |

## Dashboard

- URL: `https://dev.withnucleus.ai/dashboard`
- Password: `apparao&paparao`
- Range: **24h / 7d / 30d / 90d / custom** (all in PST)
- Time-based: pageviews timeline (auto-bucketed), hour-of-day, day-of-week
- Top lists: pages, timezones, languages, referrers, browsers, OS, devices
- Tables: average time on page, recent 50 visits (live feed)

## Security rules

`firestore.rules`:

```
match /visits/{viewId} {
  allow get, list: if true;            // public reads for dashboard
  allow create: if <strict schema>;    // see rules file
  allow update: if only `duration`, `closedAt` change;
  allow delete: if false;
}
```

Writes are validated: schema, field types, path length cap, duration cap.
Anyone with the public Firebase config can read the `visits` collection —
so the dashboard data is **not secret**. The password gate stops casual
discovery via `/dashboard`, but the data itself is analytics metadata
(paths, referrers, device breakdowns), not user content.

If you want to lock reads down later:

1. Register the app with Firebase App Check (reCAPTCHA v3)
2. Change the rule to `allow get, list: if request.auth != null || appCheck.token.valid;`

## Deploy

### Code (tracker + dashboard)

They ship with the rest of the site. Push to whatever branch builds prod.

```
git add -A
git commit -m "Add privacy-first analytics"
git push origin master   # tracks withnucleus.ai visitors
git push origin dev      # serves the dashboard at dev.withnucleus.ai
```

No env vars, no secrets, no GCP access required — the tracker and
dashboard both only use the public Firebase web config.

### Security rules

Whenever `firestore.rules` changes:

```
firebase deploy --only firestore:rules --project nucleus-website-tracker
```

## Local dev

Install deps, start dev server, browse, open dashboard:

```
npm run dev
open http://localhost:3000
# then:
open http://localhost:3000/dashboard
# password: apparao&paparao
```

Data goes to the real Firestore (same database production will use).
The tracker tags localhost visits the same as real visits. If you want
to exclude them, add a filter in the dashboard or remove `localhost` from
`TRACKED_HOSTNAMES`.

## Privacy posture

- No cookies (session/local storage only)
- No raw IPs collected (no server-side IP access)
- `navigator.doNotTrack` respected
- Dashboard is `noindex` and not in the sitemap
- Bot traffic filtered at tracker layer
- Visitor ID rotates daily — no cross-day correlation

Using `localStorage` for a persistent-ish visitor ID is a mild departure
from "strictly no persistent storage". Under GDPR/ePrivacy, localStorage
for first-party analytics is typically treated like cookies — a privacy
disclosure is advisable.

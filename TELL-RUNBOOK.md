# Tell — Build & Operations Runbook

Everything needed to rebuild, modify, deploy, and operate the **Tell** studio
site (live at **https://tell.art**) from scratch. Hand this file to a new
session together with the repo and it can reproduce the same result and run
the same workflows.

> **Read this first — the golden rules**
> 1. **Develop only on the branch you were told to** (this build used
>    `claude/refero-mcp-http-di6dex`). Never push to `main`/default.
> 2. **Two files stay in lockstep:** `public/tell.html` (source of truth) and
>    `tell-vercel/index.html` (the deployable copy). After *every* edit to
>    `public/tell.html`, run `cp public/tell.html tell-vercel/index.html`.
> 3. **Never commit secrets.** The Vercel token, any API tokens, passwords —
>    none go in git, the artifact, code comments, or this file. (The
>    Web3Forms *access key* is the one exception: it is public by design and
>    already lives in the form HTML.)
> 4. **Original artwork and copy only.** No third-party logos or stock.
> 5. Commit footer, on every commit:
>    ```
>    Co-Authored-By: Claude <noreply@anthropic.com>
>    Claude-Session: <your session URL>
>    ```
>    Do **not** put any model identifier in commits, PRs, or code.

---

## 0. What the site is

A single-file, award-aspiring marketing site for **Tell**, a web-design /
branding studio. Tagline: *"Every company has a story."* Paper-white / ink
editorial theme, crimson accent `#fc1c46`, elite scroll animations, and an
original mascot — **Pip**, a warm-brown squirrel — who travels the page as one
continuous character, changing pose per section. Everything (layout, motion,
artwork as SVG, the mascot system) is hand-built vanilla HTML/CSS/JS in one
file. No framework, no build step for the site itself.

**Live surfaces**
- Production site: **https://tell.art** (and `www.tell.art` → 308 → apex)
- Vercel project: **tell-vercel** (`tell-vercel.vercel.app`)
- Studio inbox: **hello@tell.art** (Google Workspace)

---

## 1. Repository layout

```
public/tell.html          ← THE deliverable. Complete standalone HTML doc.
public/mascot/pip-*.png    ← 7 transparent mascot cutouts (Pip poses)
tell-vercel/index.html     ← deploy copy of public/tell.html (keep in sync)
tell-vercel/mascot/pip-*.png ← same 7 PNGs (relative paths for Vercel)
tell-vercel/vercel.json    ← cleanUrls + 1-year cache on /mascot/*
tell-vercel/.vercel/       ← project link (gitignored; IDs below)
build-artifact.py          ← builds the Claude Artifact preview (repo root)
TELL-RUNBOOK.md            ← this file
```

The repo is a Next.js app deployed elsewhere via Firebase; `public/tell.html`
is just a static file living inside it. **Tell ships through the standalone
`tell-vercel/` folder on Vercel, not through the Next.js app.**

**Vercel project identifiers** (not secret — safe to record):
- projectId `prj_Y6XZvx1jvC1ut86sN0useATxlWpF`
- orgId `team_XSGxxmfwSTt51dKg26tzGWtD`
- projectName `tell-vercel`

---

## 2. `public/tell.html` architecture (how the page is built)

One file, three parts: `<head>` with all CSS in a single `<style>`; `<body>`
with semantic sections; one big `<script>` at the end running a single
`requestAnimationFrame` loop (`frame(ms)`) that drives every scroll effect.

Key systems (search these anchors in the file):
- **Overture intro** — `runOverture()`: ink drop → detonation → letters/artifacts
  settle. Runs on mobile too (guarded only by `prefers-reduced-motion`).
- **Paper fleet** — `CRAFT` array + `updateFleet(t,dt)`: boat/plane/rocket/
  crane/kite weave down the page (gated by `fleetReady`, `.sailing`).
- **Pinned scrub band** — `#scrubBand` / `.scrub__pin` (position:sticky): the
  statement scrubs horizontally; `scrubP` drives the type, the drawn story arc
  (`bezPath`), and the popping chips.
- **Scroll-driven colour** (NOT hover): `.marquee.lit` toggled when a band is
  on-screen; footer `.footer-mark` `background-size` set from scroll progress.
- **The mascot** — see §4. This is the centrepiece.
- **Contact form** — see §9.

### Critical gotchas (do not regress)
- **Sandbox `img{max-width:100%}` clamp.** The Claude Artifact frame injects
  `img{max-width:100%}`. The fixed `.mascot` host is zero-width, so 100% → 0px
  and every pose renders invisible. Fix that is in place: `.mascot__pose { max-width: none; }`.
  Keep it. (This does not affect the Vercel build, only the artifact preview,
  but the rule is harmless everywhere.)
- **Mobile horizontal wobble.** `html, body { overflow-x: clip; }` (NOT
  `hidden` — `hidden` breaks the sticky scrub pin). Keep it.
- **No horizontal overflow ever.** After any change, assert
  `document.documentElement.scrollWidth === innerWidth` on a 390px viewport.

---

## 3. The mascot art (Pip) — the 7 poses

Pip is a warm reddish-brown squirrel, soft children's-book ink-and-watercolour
style, big friendly eyes, cream belly, bushy tail, on transparent background.
The **7 committed PNGs already in `public/mascot/` are the source of truth** —
**reuse them** for an identical result. Regeneration (below) will NOT be
pixel-identical because image generation is non-deterministic.

| file | pose | used at section |
|------|------|-----------------|
| `pip-hero.png`   | riding a paper plane, arm out         | hero |
| `pip-proud.png`  | standing proud on a stack of books    | work / portfolio |
| `pip-pen.png`    | holding a giant fountain pen          | capabilities / studio |
| `pip-sprint.png` | mid-run, holding an acorn             | scrub band (runs across) |
| `pip-relax.png`  | curled up relaxing with an acorn/cup  | chapters / process |
| `pip-listen.png` | paw to ear, curious, listening        | contact |
| `pip-base.png`   | standing, holding an acorn            | footer |

### To regenerate (optional) — via the Higgsfield MCP
1. Generate one **anchor** pose first (e.g. base) with a full character
   description. Model: `nano_banana_pro`. Prompt describes: warm brown squirrel,
   soft ink+watercolour children's-book style, big eyes, cream belly, bushy
   tail, plain flat off-white background, full body, centered.
2. For every other pose, pass the anchor image via the `image_references`
   media role (character-consistency) plus the pose description — this keeps
   the same character. Emphasize **"exactly one squirrel, no duplicate, no
   ghost"** (a duplicate-head artifact appeared once on sprint).
3. `remove_background` on each result → download the transparent PNG.
4. Save as `public/mascot/pip-<pose>.png` and copy to `tell-vercel/mascot/`.
   Keep the transparent cutout tight.

---

## 4. The mascot system in code

One character, one continuous scroll-driven path — **identical model on
desktop and mobile**, tuned per device.

- **Markup:** a fixed `<div class="mascot">` holds 7 `<img class="mascot__pose"
  data-pose="X" data-pip="X">`. Each section has an invisible
  `<div data-mascot data-pose="X" data-size="N" style="right:…;top:…">` anchor.
- **PIP image loader:** every mascot `<img>` has `data-pip` and NO `src`. A
  loader (`const PIP = null; /*__PIP_MAP__*/` then a `forEach`) sets
  `el.src = PIP ? PIP[pose] : 'mascot/pip-'+pose+'.png'`. On the live/Vercel
  site `PIP` stays `null` → relative `mascot/pip-X.png`. The artifact build
  replaces the placeholder with a data-URI map (see §6).
- **`measure()`** caches each anchor's document `{x,y,size,pose}`. On phones
  (`innerWidth < 600`) it overrides:
  - **size**: `Math.max(94, Math.min(112, data-size * 0.40))` (~small),
  - **x**: a deliberate left/right weave via `MX` map (per pose fraction of
    viewport width) so he sits in each section's whitespace,
  - **y (hero only)**: lifted via `MY` so he flies past the headline near the
    header rather than over the lead paragraph.
- **`target()`** interpolates position/size/pose along the sorted anchors by
  scroll; pose is held until `t < 0.62` of the way to the next stop.
- **`frame()` loop** eases `cur` toward `target()` and writes transforms:
  - **Frame-rate-independent easing:** `k = 1 - Math.pow(1 - 0.072, dt*60)`
    (identical to 0.072 at 60fps; keeps pace at 30fps so he never trails).
  - Desktop branch clamps below the header; **mobile branch lets `sy` go
    negative** so he tucks *behind* the opaque header (`.mascot` z-index 6 <
    header z-index 50) → he reads "above and below the header" like desktop.
  - **Sprint run:** in the scrub section, `curPose==='sprint'` adds a footfall
    `runHop` + `runTilt` so he *runs*.
  - **Smoothness (do not regress):** write `pose.style.height` **only when it
    changes** (per-frame height writes force layout); the mobile
    `.mascot__pose` has `will-change: transform` + `backface-visibility:hidden`
    so its drop-shadow rasterises once and the rotate composites on the GPU.

If you change poses/anchors, keep the `MX`/`MY` maps and the size clamp in
sync, and re-run the mobile path test (§11).

---

## 5. Standing design constraints

- Crimson `#fc1c46` is the one brand colour. The word **"Tell"** is highlighted
  crimson wherever it is the brand name: header logo, the "How We **Tell** It"
  and "**Tell** Us Yours" headings (`<span class="tw">`), footer `© 2026 Tell`.
  The big footer `TELL.` keeps its scroll-fill; the Listen/Shape/Tell process
  triad keeps its own accent system (leave those alone).
- Header logo: `.brand` at `clamp(22px,2.3vw,28px)`, crimson, uppercase, with
  the speech-bubble mark.
- Mobile is first-class: "most people use mobile." Never compromise it.

---

## 6. Build & publish the Claude Artifact preview

The preview (a Claude Artifact) is separate from the Vercel site. Build it with
the committed script:

```bash
python3 build-artifact.py        # writes ./tell-artifact.html (~6.09 MB)
```

What it does: extracts `preconnect … </style>` + the `<body>` innards from
`public/tell.html`, and inlines each of the 7 mascot PNGs **once** as a shared
JS data-URI map (replacing the `const PIP = null; /*__PIP_MAP__*/`
placeholder). This keeps the artifact ~6 MB instead of ballooning if a pose is
referenced more than once.

Publish via the **Artifact tool** (not a file host):
- file: `tell-artifact.html`
- url (to update the existing one): `https://claude.ai/code/artifact/372be506-4630-462b-9950-00199b76250a`
- title: `Tell` · favicon: `💬` (keep both stable across redeploys)

The published preview URL: `https://claude.ai/code/artifact/372be506-4630-462b-9950-00199b76250a`.

---

## 7. Deploy to Vercel (the live site)

Prereqs: a **fresh Vercel token** (create at vercel.com/account/tokens; delete
it after — never commit it). The `tell-vercel/.vercel/` project link is already
present (gitignored).

```bash
cp public/tell.html tell-vercel/index.html      # ALWAYS sync first
cd tell-vercel
export VERCEL_TOKEN='<fresh token>'
export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt   # this sandbox's proxy CA
npx --yes vercel@latest deploy --prod --yes
unset VERCEL_TOKEN
```

`vercel.json`: `cleanUrls: true` + a 1-year immutable cache on `/mascot/*`.

**Verify live** (Playwright cannot reach external URLs here — use `curl` via the
proxy, and add a cache-buster because the HTML edge-caches briefly):
```bash
export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
curl -s -o /dev/null -w '%{http_code}\n' "https://tell.art/?v=$(date +%s)"
curl -s "https://tell.art/?v=$(date +%s)" | grep -c '<marker string from your change>'
```
A first plain `curl` may return a stale edge copy for a few seconds; the
cache-buster query fetches origin.

---

## 8. Custom domain — tell.art (registrar: GoDaddy)

**Vercel side is already configured** (both domains added & verified; apex is
primary, `www` 308-redirects to apex). If reproducing on a new domain, add it
in Vercel → project → Settings → Domains, or via the Vercel API with the token.

**GoDaddy DNS records** (GoDaddy → My Products → tell.art → Edit DNS). The
website records:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `@` | `216.198.79.1` | Vercel apex (their current recommended IP; `76.76.21.21` also works) |
| CNAME | `www` | `cname.vercel-dns.com` | www → Vercel |

Turn OFF any GoDaddy **Forwarding**/parked page. Leave the `_domainconnect`
CNAME, `NS`, and `SOA` rows alone. Propagation: minutes to ~1 hour; Vercel
auto-issues SSL. If the browser shows the old parked page briefly, it's stale
local DNS cache — it clears itself within the TTL.

---

## 9. Custom email — Google Workspace on tell.art

Mailbox: **hello@tell.art**. All records live at GoDaddy DNS (separate from the
website — they don't affect the site).

1. **workspace.google.com → Get started** → business "Tell", 1 user, enter
   domain `tell.art`, create `hello@tell.art`.
2. **Verify domain**: add the `TXT @ google-site-verification=…` record Google
   gives you (or use Google's "Verify with GoDaddy" one-click).
3. **MX (route mail)** — Google's modern single record:
   | Type | Name | Value | Priority | TTL |
   |------|------|-------|----------|-----|
   | MX | `@` | `smtp.google.com` | `1` | lowest (1/2 hour) |
   Delete any old `…secureserver.net` MX rows first.
4. **Deliverability (anti-spam) TXT records** — all three:
   - **DKIM**: Admin → Apps → Gmail → *Authenticate email* → generate 2048-bit
     key → add `TXT` name `google._domainkey` value `v=DKIM1; k=rsa; p=…`
     (copy exactly), then click **Start authentication** in Google.
   - **SPF**: `TXT` name `@` value `v=spf1 include:_spf.google.com ~all`.
   - **DMARC**: a default `TXT _dmarc v=DMARC1; p=quarantine; …` may already
     exist (GoDaddy's) — fine to keep; optionally replace with a Google-facing
     one later.
5. Click **Activate** in Google. Done.

---

## 10. Contact form → delivers to hello@tell.art (Web3Forms)

Static site, no backend: the form POSTs to **Web3Forms**, which emails each
submission to the address tied to the access key.

- **Access key** (public by design; already in the form HTML):
  `e881686b-0326-4a27-aa74-ef1bdb80e34e` (tied to hello@tell.art). To make a
  new one: web3forms.com → enter the destination email → copy the key it emails
  you → replace the `access_key` hidden input value.
- **Form** (`#contactForm`): `action="https://api.web3forms.com/submit"
  method="POST"`, hidden inputs `access_key`, `subject`, `from_name`, a hidden
  **honeypot** checkbox `name="botcheck"` (class `hp-field`, off-screen), and
  `required` name/email/message fields.
- **JS handler**: `preventDefault` → `reportValidity()` → `fetch(action, {POST,
  Accept: application/json, body: new FormData})` → on `{success}` show
  "Sent — Thanks, we'll be in touch soon." and reset; on failure show
  "email hello@tell.art directly." Uses a cleared `flyTimer` so the label
  doesn't race.
- **Testing caveat:** Web3Forms is behind Cloudflare and **rejects non-browser
  requests** (server curl → 403 / "Pro plan required"). You cannot end-to-end
  test delivery from this sandbox. Verify the *wiring* with a Playwright
  `page.route('https://api.web3forms.com/**', fulfill {success:true})`
  interception (assert the payload fields), then have a human submit once from
  the live site and confirm the email arrives.

---

## 11. Testing methodology (Playwright)

Chromium is preinstalled at `/opt/pw-browsers/chromium`. **Playwright cannot
reach external URLs** in this sandbox (no proxy for the browser) — always test
against the local `file://` path, and verify the *live* site with `curl`.

Boilerplate that matters:
```js
import { chromium, devices } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// inject local fonts so text measures correctly:
await page.addStyleTag({ content: readFileSync('fonts/sg-local.css','utf8') });
// disable smooth scroll for deterministic positions:
await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
await page.goto('file:///home/user/WithNucleusAI.github.io/public/tell.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4500);   // let overture settle + mascot go live
```
- **True mobile** = `newContext({ ...devices['iPhone 13'] })`. A plain 390px
  viewport is still `pointer:fine` and shows the desktop cursor — misleading.
  Use the device descriptor for `pointer:coarse` / `hover:none`.
- **Reproduce the artifact sandbox clamp**: `addStyleTag({content:'img{max-width:100%}'})`
  and confirm the mascot still has width (regression guard for §2).
- **Perf** (smoothness): `newCDPSession(page)` →
  `Emulation.setCPUThrottlingRate {rate: 2}` (≈ modern phone; `4` = low-end),
  then sample `requestAnimationFrame` deltas. Target: mid-page & scrolling
  ~16.7ms avg / near-zero frames > 24ms.
- Always assert **no horizontal overflow** (`scrollWidth === innerWidth`) on
  mobile, and **`pageerror` count === 0**.

Scratch test scripts from this build live under the session scratchpad (e.g.
`mtraveler.mjs` scrolls the whole page logging pose/x/top per stop; `perf.mjs`
measures throttled frame time). Recreate as needed from the boilerplate above.

---

## 12. The full ship checklist (run this for every change)

```bash
# 1. edit public/tell.html
# 2. sync the deploy copy
cp public/tell.html tell-vercel/index.html
# 3. (optional) rebuild + republish the artifact preview
python3 build-artifact.py            # then publish tell-artifact.html via Artifact tool
# 4. test locally (Playwright, file://) — poses, no overflow, no errors, perf
# 5. commit BOTH files with the required footer
git add public/tell.html tell-vercel/index.html
git commit -m "…"                    # footer: Co-Authored-By + Claude-Session
# 6. push to the working branch (retry w/ backoff on network errors)
git push -u origin claude/refero-mcp-http-di6dex
# 7. deploy to Vercel (needs fresh VERCEL_TOKEN) — see §7
# 8. verify live with curl + cache-buster — see §7
```
Keep GitHub and the live site in sync; if you must hold a deploy (e.g. a
placeholder key), say so and don't deploy a half-working state.

---

## 13. Secrets & what must NEVER be committed

- **Vercel token** — use a fresh one each time, `export` it, `unset` after,
  never in git/artifact/comments/this file. Treat any token pasted in chat as
  burned; ask the user to rotate it.
- **Any MCP/API tokens, passwords, private keys** — never.
- **OK to record** (already public / non-sensitive): the Web3Forms access key
  (public by design), Vercel project/org IDs, DNS record values, the domain,
  the studio email address.
- If a token ends up used in chat, remind the user to rotate it afterward.

---

## 14. Current live state (as of this runbook)

- ✅ Site live at **https://tell.art** (SSL, apex primary, www→apex 308)
- ✅ Vercel project `tell-vercel`, deployed from `tell-vercel/`
- ✅ Google Workspace mailbox **hello@tell.art** (finish DKIM+SPF if not done)
- ✅ Contact form → Web3Forms → hello@tell.art (human should confirm one live
      submission arrives)
- ✅ Portfolio: **Inland Industrial Tire** (real, external link) + a
      "Revealing next week" teaser row
- ✅ Mascot Pip: continuous traveller on desktop + mobile, smoothness-optimised

**Open (human-side) tasks:** confirm a real contact-form submission lands in
the inbox; finish the DKIM + SPF DNS records if still pending.

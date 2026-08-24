# Tell — static site (Vercel-ready)

A self-contained static deploy of the Tell landing page.

- `index.html` — the whole page (HTML + CSS + JS inline)
- `mascot/` — Pip's pose images (referenced with relative paths)

## Deploy to Vercel

**Option A — Vercel CLI (fastest):**
```bash
cd tell-vercel
npx vercel --prod
```
Follow the prompts to log in / link a project. Vercel detects it as a static
site (no framework) and serves `index.html` at `/`.

**Option B — Vercel dashboard (Git import):**
1. Push this repo to GitHub (already done on the feature branch).
2. vercel.com → Add New → Project → import this repo.
3. Set **Root Directory** to `tell-vercel`.
4. Framework preset: **Other** (static). Deploy.

The page will be live at the project's `.vercel.app` URL (root `/`).

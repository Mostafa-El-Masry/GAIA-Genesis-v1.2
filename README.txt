GAIA Genesis — Phase 3 (Week 4) — Full App Router Project
=========================================================

What you get
------------
- Lowercase route folders for **best practice** and consistent imports.
- **Import aliases** (`@/*`) via `tsconfig.json` so no more brittle relative paths.
- Integrated Weeks 1–3 work + **Week 4** (Wealth actual receipts + variance + stages, Dashboard KPIs).
- **Gallery** updated: side **thumbnail controls** for First/Prev and Next/Last (no arrows), plus categories/tags and video stars/filters.
- **Dashboard** links point to the lowercase routes and are verified in this bundle.

Routes
------
/dashboard, /gallery, /apollo, /healthtracker, /wealth, /wealth/certificates, /timeline, /sync

Quick start
-----------
1. `npm i`
2. `npm run dev`
3. Drop your media under `/public/media/**` and your own `public/manifest.json` if you have it.
   (This bundle includes a tiny sample manifest just so the Gallery boots.)

Data keys (localStorage)
------------------------
- gaia_finances, gaia_certificates, gallery_meta, video_meta, gaia_apollo, healthRecords, gaia_timeline

Notes
-----
- If you previously used uppercase route names, this bundle standardizes to lowercase and updates all links.
- ESLint config included (Next default). Turbopack is used by default in Next 14 dev.

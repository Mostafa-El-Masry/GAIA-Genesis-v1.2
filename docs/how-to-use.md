# GAIA Week 6 Debug Kit (Drop-in, App Router safe)
1) Unzip into your project root. It only adds:
   - app/components/Dev/ErrorBoundary.tsx
   - app/(routes)/dev/diag/page.tsx
   - scripts/case-guard.mjs
   - docs/* snippets

2) Start dev and open /dev/diag
   - Confirms manifest path, alias import resolution, and localStorage dataset presence.
   - If an import fails, you'll see the error message here.

3) (Optional) Run the case guard
   - Node 18+ required.
   - `node scripts/case-guard.mjs`
   - It will list imports whose casing doesn't match what's on disk or are missing.

4) Ensure alias config (only if imports fail)
   - Compare your next.config.mjs with docs/next.config.mjs.snippet
   - Compare your tsconfig.json with docs/tsconfig.paths.json.snippet

5) When you send me an error snapshot
   - Also paste the exact error text (copy/paste if possible).
   - Tell me the file path where it triggers (if shown) and the command you ran (`dev` vs `build`).

We’ll reply with: root cause, file(s) to edit, and a tiny patch-zip (only the changed files).

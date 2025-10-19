# GAIA — PayMag Final Bundle

- App Router (Next.js), alias `@/*` assumed.
- Public manifest at `public/manifest.json`.
- Search across Apollo/Timeline/Media/Certificates at `/search`.
- Markdown utility at `lib/markdown.ts` → use via:
  ```tsx
  import { renderMarkdown } from '@/lib/markdown';
  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(myMd) }} />
  ```
- Sync: `/sync` (save/download JSON; save to `/public/backups`; load latest).
- Main entry: `/dashboard`.


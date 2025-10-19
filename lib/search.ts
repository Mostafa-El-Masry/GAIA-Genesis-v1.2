
/** Full-text search across GAIA local data (Apollo, Timeline, Certificates, Manifest media). */
export type SearchKind = 'apollo'|'timeline'|'image'|'video'|'certificate';
export type SearchHit = { id: string; kind: SearchKind; title: string; snippet?: string; href?: string; tags?: string[]; score: number };

type Apollo = { id:string; topic:string; notes:string; sources:string[]; createdAt:string };
type Timeline = { id:string; title:string; date:string; description?:string; category?:string };
type Certificate = { id:string; title:string; currency:string; principal:number; rateAPR:number; startDate:string; endDate:string };
type ImageItem = { src:string; title?:string };
type VideoItem = { src:string; title?:string; poster?:string };

const APOLLO_KEY = 'gaia_apollo';
const TIMELINE_KEY = 'gaia_timeline';
const CERT_KEY = 'gaia_certificates';

const norm = (s:string)=> (s||'').toLowerCase();
const scoreOf = (q: string, text: string) => {
  const nq = norm(q).split(/\s+/).filter(Boolean);
  const nt = norm(text);
  let score = 0;
  for (const term of nq) {
    if (!term) continue;
    if (nt.includes(term)) score += 5;
    if (nt.startsWith(term)) score += 2;
  }
  return score;
};

export async function gatherSearchItems(): Promise<SearchHit[]> {
  const hits: SearchHit[] = [];
  try {
    const ap: Apollo[] = JSON.parse(localStorage.getItem(APOLLO_KEY) || '[]') || [];
    for (const a of ap) {
      hits.push({ id: a.id, kind: 'apollo', title: a.topic || 'Untitled', snippet: a.notes?.slice(0, 240), href: '/apollo', tags: a.sources, score: 0 });
    }
  } catch {}

  try {
    const tl: Timeline[] = JSON.parse(localStorage.getItem(TIMELINE_KEY) || '[]') || [];
    for (const t of tl) {
      hits.push({ id: t.id, kind: 'timeline', title: `${t.title} (${t.date})`, snippet: t.description, href: '/timeline', score: 0 });
    }
  } catch {}

  try {
    const certs: Certificate[] = JSON.parse(localStorage.getItem(CERT_KEY) || '[]') || [];
    for (const c of certs) {
      hits.push({ id: c.id, kind: 'certificate', title: `${c.title} · ${c.currency} ${c.principal.toLocaleString?.()||c.principal}`, snippet: `APR ${c.rateAPR}%  ·  ${c.startDate} → ${c.endDate}`, href: '/wealth/certificates', score: 0 });
    }
  } catch {}

  try {
    const res = await fetch('/manifest.json', { cache: 'no-store' });
    const json = await res.json();
    const images: ImageItem[] = json?.images || [];
    const videos: VideoItem[] = json?.videos || [];
    for (const im of images) hits.push({ id: im.src, kind: 'image', title: im.title || im.src.split('/').pop(), href: '/gallery?type=image', score: 0 });
    for (const v of videos) hits.push({ id: v.src, kind: 'video', title: v.title || v.src.split('/').pop(), href: '/gallery?type=video', score: 0 });
  } catch {}

  return hits;
}

export async function searchAll(query: string, limit = 50): Promise<SearchHit[]> {
  const items = await gatherSearchItems();
  const q = norm(query);
  if (!q) return items.slice(0, limit);
  const scored = items.map(h => {
    const text = [h.title, h.snippet, ...(h.tags||[])].filter(Boolean).join('  ');
    return { ...h, score: scoreOf(q, text) + (scoreOf(q, h.title) * 2) };
  }).filter(h => h.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

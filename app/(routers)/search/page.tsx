
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { searchAll, type SearchHit } from '@/lib/search';

export default function SearchPage(){
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  useEffect(() => { (async () => { setHits(await searchAll(q)); })(); }, [q]);

  const groups = useMemo(() => {
    const map = new Map<string, SearchHit[]>();
    for (const h of hits) {
      const arr = map.get(h.kind) || [];
      arr.push(h); map.set(h.kind, arr);
    }
    return Array.from(map.entries());
  }, [hits]);

  return (
    <main style={{ display: 'grid', gap: 12 }}>
      <h2 className="text-3xl font-bold">🔎 Search</h2>
      <input className="input" placeholder="Type to search across Apollo, Timeline, Images, Videos, Certificates…"
             value={q} onChange={e=>setQ(e.target.value)} />
      <div className="glass" style={{ padding: '1rem', borderRadius: 12 }}>
        {groups.length === 0 ? <div style={{opacity:.6}}>No results.</div> :
          groups.map(([kind, arr]) => (
            <section key={kind} style={{ margin: '12px 0' }}>
              <h4 style={{ opacity:.9, marginBottom: 6 }}>{kind.toUpperCase()} — {arr.length}</h4>
              <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                {arr.map(h => (
                  <li key={h.id} style={{ borderTop:'1px solid rgba(255,255,255,.12)', padding:'6px 0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                      <a className="text-blue-500 hover:underline" href={h.href || '#'}>{h.title}</a>
                      <span style={{ opacity:.6 }}>score {h.score}</span>
                    </div>
                    {h.snippet && <div style={{ opacity:.8, fontSize:12 }}>{h.snippet}</div>}
                  </li>
                ))}
              </ul>
            </section>
          ))
        }
      </div>
    </main>
  );
}

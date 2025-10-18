'use client';
import React, { useEffect, useState } from 'react';
import ErrorBoundary from '@/components/Dev/ErrorBoundary';
type Check = { name:string; status:'pending'|'ok'|'fail'; detail?:string };
const MANIFEST_CANDIDATES = ['/manifest.json', '/media/manifest.json'];
const IMPORTS = [
  '@/components/gallery/ImageGallery',
  '@/components/gallery/VideoGallery',
  '@/hooks/useMediaManifest',
  '@/hooks/useGalleryMeta',
  '@/hooks/useVideoMeta',
  '@/hooks/useCertificates',
];
export default function DevDiag(){
  const [checks, setChecks] = useState<Check[]>([
    { name: 'Fetch /manifest.json', status:'pending' },
    { name: 'Fetch /media/manifest.json', status:'pending' },
    { name: 'Alias import: @/components/gallery/ImageGallery', status:'pending' },
    { name: 'Alias import: @/components/gallery/VideoGallery', status:'pending' },
    { name: 'Alias import: @/hooks/useMediaManifest', status:'pending' },
    { name: 'Alias import: @/hooks/useGalleryMeta', status:'pending' },
    { name: 'Alias import: @/hooks/useVideoMeta', status:'pending' },
    { name: 'Alias import: @/hooks/useCertificates', status:'pending' },
    { name: 'LocalStorage keys present', status:'pending' },
  ]);
  const [lsData, setLsData] = useState<any>({});
  useEffect(()=>{
    (async()=>{
      // Manifest checks
      for (let i=0;i<MANIFEST_CANDIDATES.length;i++){
        const url = MANIFEST_CANDIDATES[i];
        try{
          const r = await fetch(url, { cache:'no-store' });
          const ok = r.ok;
          const idx = i;
          setChecks(prev => { const c=[...prev]; c[idx] = { ...c[idx], status: ok?'ok':'fail', detail: ok?'200 OK': String(r.status) }; return c; });
        }catch(err:any){
          const idx=i; setChecks(prev => { const c=[...prev]; c[idx] = { ...c[idx], status:'fail', detail: err?.message||String(err) }; return c; });
        }
      }
      // Import checks
      for (let j=0;j<IMPORTS.length;j++){
        const path = IMPORTS[j];
        try{ await import(/* @vite-ignore */ path); // webpack resolves alias
          const idx = 2 + j; setChecks(prev => { const c=[...prev]; c[idx] = { ...c[idx], status:'ok' }; return c; });
        }catch(err:any){
          const idx = 2 + j; setChecks(prev => { const c=[...prev]; c[idx] = { ...c[idx], status:'fail', detail: err?.message||String(err) }; return c; });
        }
      }
      // LocalStorage keys (read-only)
      try{
        const keys = ['gaia_certificates','gallery_meta','video_meta','gaia_apollo','gaia_timeline','healthRecords','__settings','gaia_worlds'];
        const out:any = {};
        for (const k of keys){
          try{ const raw = localStorage.getItem(k); out[k] = raw ? (Array.isArray(JSON.parse(raw)) ? { type:'array', count: JSON.parse(raw).length } : { type: typeof JSON.parse(raw) }) : null; } catch { out[k]='(parse error)'; }
        }
        setLsData(out);
        setChecks(prev => { const c=[...prev]; c[c.length-1] = { ...c[c.length-1], status:'ok' }; return c; });
      }catch(err:any){
        setChecks(prev => { const c=[...prev]; c[c.length-1] = { ...c[c.length-1], status:'fail', detail: err?.message||String(err) }; return c; });
      }
    })();
  },[]);
  return <main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">🧪 GAIA Dev Diagnostics</h2>
    <ErrorBoundary>
      <div className="glass" style={{padding:'1rem',borderRadius:12}}>
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-200"><tr><th className="p-2 border">Check</th><th className="p-2 border">Status</th><th className="p-2 border">Detail</th></tr></thead>
          <tbody>
            {checks.map((c,i)=>(<tr key={i} className="border-t">
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border" style={{color: c.status==='ok'?'#22c55e':(c.status==='fail'?'#ef4444':'inherit')}}>{c.status}</td>
              <td className="p-2 border"><small>{c.detail||''}</small></td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </ErrorBoundary>
    <div className="glass" style={{padding:'1rem',borderRadius:12}}>
      <h3>LocalStorage snapshot</h3>
      <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.85}}>{JSON.stringify(lsData,null,2)}</pre>
    </div>
    <div className="glass" style={{padding:'1rem',borderRadius:12}}>
      <h3>Tips</h3>
      <ul>
        <li>Keep pages under <code>app/(routes)/...</code> (lowercase) to avoid case-sensitive import bugs.</li>
        <li>Use alias imports like <code>@/hooks/...</code> instead of deep <code>../../..</code>.</li>
        <li>If <code>/manifest.json</code> fails but <code>/media/manifest.json</code> is OK, keep your file under <code>public/media/manifest.json</code>.</li>
      </ul>
    </div>
  </main>;
}

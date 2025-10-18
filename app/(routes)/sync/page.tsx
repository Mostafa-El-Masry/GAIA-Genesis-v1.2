'use client';
import React, { useRef, useState } from 'react';
export default function SyncCenter(){
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState('');
  const keys = ['gaia_apollo','healthRecords','gaia_finances','gaia_certificates','gallery_meta','video_meta','gaia_timeline','__settings','gaia_worlds'];
  const exportAll = () => {
    const bundle:any = { version:'W4W5', exportedAt:new Date().toISOString(), datasets:{} };
    for (const k of keys){ try{ bundle.datasets[k] = JSON.parse(localStorage.getItem(k)||'[]'); }catch{ bundle.datasets[k] = []; } }
    const blob = new Blob([JSON.stringify(bundle,null,2)], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gaia_bundle.json'; a.click();
  };
  const importAll = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    file.text().then(txt=>{ try{ const data=JSON.parse(txt); if(!data?.datasets) throw new Error('Invalid bundle'); for(const k of Object.keys(data.datasets)) localStorage.setItem(k, JSON.stringify(data.datasets[k])); setResult('Import complete. Reload to see updates.'); } catch(err:any){ setResult('Import failed: '+err.message); } });
  };
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">🔄 GAIA Sync Center</h2>
    <div className="glass" style={{padding:'1rem',borderRadius:12}}>
      <button className="btn btn-primary" onClick={exportAll}>Export All</button>
      <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={importAll}/>
      <button className="btn" onClick={()=>fileRef.current?.click()}>Import Bundle</button>
      {result && <p style={{marginTop:8}}><small>{result}</small></p>}
    </div>
  </main>);
}

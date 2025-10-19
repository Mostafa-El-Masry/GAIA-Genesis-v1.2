'use client';
import React, { useRef, useState } from 'react';
const GAIA_PREFIXES = ['gaia_', 'health', '__settings'];
function nowStamp(){ const d=new Date(); const pad=(n:number)=>String(n).padStart(2,'0'); return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`; }
function snapshotLocalStorage(){
  const data: Record<string,string|null> = {};
  for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i)!; if (GAIA_PREFIXES.some(p => k.startsWith(p))) data[k] = localStorage.getItem(k); }
  return { __meta: { createdAt: new Date().toISOString(), keys: Object.keys(data).length, prefixes: GAIA_PREFIXES }, data };
}
function applySnapshot(obj:any){
  if(!obj || typeof obj!=='object' || !obj.data) throw new Error('Invalid backup file format');
  const incoming = obj.data as Record<string,string|null>;
  try{ localStorage.setItem(`gaia_backup_${nowStamp()}`, JSON.stringify(snapshotLocalStorage())); }catch{}
  const toRemove:string[] = []; for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i)!; if (GAIA_PREFIXES.some(p=>k.startsWith(p))) toRemove.push(k); }
  for (const k of toRemove) try{ localStorage.removeItem(k); }catch{}
  for (const k of Object.keys(incoming)){ const v=incoming[k]; if (typeof v==='string') localStorage.setItem(k, v); }
  return Object.keys(incoming).length;
}
export default function BackupPanel(){
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const saveToDownload = () => {
    const snap = snapshotLocalStorage();
    const name = `gaia_localstorage_${nowStamp()}.json`;
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
    setLastSaved(name);
  };
  const saveToBackups = async () => {
    try{
      setBusy(true);
      const snap = snapshotLocalStorage();
      const res = await fetch('/api/ls/save', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ data: snap })});
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error||'Save failed');
      setLastSaved(json.path || json.filename); alert('Saved to ' + (json.path||json.filename));
    }catch(err:any){ alert('Save failed: ' + (err?.message||String(err))); } finally { setBusy(false); }
  };
  const loadFromFilePicker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    try{ const text = await f.text(); const json = JSON.parse(text); const applied = applySnapshot(json); alert(`Loaded ${applied} key(s).`); location.reload(); }
    catch(err:any){ alert('Invalid backup: ' + (err?.message||String(err))); }
    finally{ (e.target as HTMLInputElement).value = ''; }
  };
  const loadLatestFromBackups = async () => {
    try{
      setBusy(true);
      const res = await fetch('/api/ls/list'); const json = await res.json();
      const files = json?.files||[]; if (!files.length) throw new Error('No backup files in /public/backups');
      const name = files[0].name;
      const r2 = await fetch(`/backups/${name}?t=${Date.now()}`, { cache:'no-store' });
      const data = await r2.json(); const applied = applySnapshot(data); alert(`Loaded ${applied} key(s) from ${name}`); location.reload();
    }catch(err:any){ alert('Load failed: ' + (err?.message||String(err))); } finally { setBusy(false); }
  };
  return (
    <section className="glass" style={{padding:'1rem',borderRadius:12,display:'grid',gap:10}}>
      <h4>Backup & Sync</h4>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className="btn" onClick={saveToDownload} disabled={busy}>💾 Save → Download</button>
        <button className="btn btn-outline" onClick={saveToBackups} disabled={busy}>💾 Save → /public/backups</button>
        <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={loadFromFilePicker} />
        <button className="btn" onClick={()=>fileRef.current?.click()} disabled={busy}>📥 Load ← File…</button>
        <button className="btn btn-outline" onClick={loadLatestFromBackups} disabled={busy}>📥 Load ← Latest backup</button>
      </div>
      {!!lastSaved && <small style={{opacity:.8}}>Last saved: {lastSaved}</small>}
    </section>
  );
}

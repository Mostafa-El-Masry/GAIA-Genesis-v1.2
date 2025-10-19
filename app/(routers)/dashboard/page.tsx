'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
type Reading = { date:string; glucose:number; insulin?:number };
type TimelineItem = { id:string; title:string; date:string; description?:string; category?:string };
function useLocal<T>(key:string, def:T): [T] {
  const [val, setVal] = useState<T>(def);
  useEffect(()=>{ try{ const raw=localStorage.getItem(key); if(raw){ setVal(JSON.parse(raw)); } }catch{} },[key]);
  return [val];
}
function computeHealth(rows: Reading[]){
  const n = rows.length;
  if (!n) return { avg: 0, tir: 0, highs:0, lows:0 };
  const avg = rows.reduce((a,r)=>a+(r.glucose||0),0)/n;
  const highs = rows.filter(r=>r.glucose>=180).length;
  const lows  = rows.filter(r=>r.glucose<70).length;
  const tir  = 100 * (n - highs - lows) / n;
  return { avg, tir, highs, lows };
}
export default function Dashboard(){
  const [imagesCount, setImagesCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  useEffect(()=>{ (async()=>{ try{ const res=await fetch('/manifest.json',{cache:'no-store'}); const j=await res.json(); setImagesCount((j?.images||[]).length); setVideosCount((j?.videos||[]).length);}catch{}})(); },[]);
  const [apollo]   = useLocal<any[]>('gaia_apollo', []);
  const [timeline] = useLocal<TimelineItem[]>('gaia_timeline', []);
  const [records]  = useLocal<Reading[]>('healthRecords', []);
  const health = useMemo(()=>computeHealth(records), [records]);
  const [certs] = useLocal<any[]>('gaia_certificates', []);
  const totalPrincipal = certs.reduce((a,c)=>a+(c?.principal||0),0);
  return (
    <main style={{display:'grid',gap:16}}>
      <h1 className="text-3xl font-bold">🏠 Dashboard</h1>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <Card title="Images" value={imagesCount.toLocaleString()} href="/gallery?type=image" hint="From manifest" />
        <Card title="Videos" value={videosCount.toLocaleString()} href="/gallery?type=video" hint="From manifest" />
        <Card title="Apollo Notes" value={apollo.length.toString()} href="/apollo" />
        <Card title="Timeline Items" value={timeline.length.toString()} href="/timeline" />
        <Card title="Certificates Total" value={totalPrincipal.toLocaleString()} href="/wealth/certificates" />
        <Card title="Avg Glucose" value={health.avg ? Math.round(health.avg)+ ' mg/dL' : '—'} href="/health" hint={`TIR ${health.tir.toFixed(0)}%`} />
      </section>
      <section className="glass" style={{padding:'1rem',borderRadius:12}}>
        <h3 style={{marginBottom:8}}>Quick Actions</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Link className="btn btn-primary" href="/sync">🔄 Backup & Sync</Link>
          <Link className="btn" href="/apollo">🧠 New Apollo note</Link>
          <Link className="btn" href="/wealth/certificates">💳 Add certificate</Link>
          <Link className="btn" href="/gallery?type=image">🖼️ Open gallery</Link>
          <Link className="btn" href="/health/quick">💉 Add health reading</Link>
        </div>
      </section>
    </main>
  );
}
function Card({ title, value, hint, href }:{ title:string; value:string; hint?:string; href?:string }){
  const body = (
    <div className="glass" style={{padding:'1rem',borderRadius:12}}>
      <div style={{opacity:.8}}>{title}</div>
      <div style={{fontSize:'1.6rem',fontWeight:700}}>{value}</div>
      {hint && <div style={{opacity:.6,fontSize:12,marginTop:4}}>{hint}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

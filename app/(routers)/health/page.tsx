'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
type Reading = { date:string; glucose:number; insulin?:number };
function computeStats(rows: Reading[]){
  const last = rows.slice(0, 300).filter(Boolean);
  const n = last.length;
  if (!n) return { avg: 0, high: 0, low: 0, tir: 0 };
  const sum = last.reduce((a,r)=>a+(r.glucose||0),0);
  const avg = sum / n;
  const high = last.filter(r=>r.glucose>=180).length;
  const low  = last.filter(r=>r.glucose<70).length;
  const tir  = 100 * (n - high - low) / n;
  return { avg, high, low, tir };
}
export default function HealthHome(){
  const [rows, setRows] = useState<Reading[]>([]);
  const [unit, setUnit] = useState<'mgdl'|'mmol'>('mgdl');
  useEffect(()=>{ try{ setRows(JSON.parse(localStorage.getItem('healthRecords')||'[]')); }catch{} try{ const s=JSON.parse(localStorage.getItem('__settings')||'{}'); if(s.glucoseUnit) setUnit(s.glucoseUnit); }catch{} },[]);
  const m = useMemo(()=>computeStats(rows), [rows]);
  const show = (mg:number)=> unit==='mmol' ? (mg/18).toFixed(1) : Math.round(mg).toString();
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">🩺 Health</h2>
    <section className="glass" style={{padding:'1rem',borderRadius:12}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
        <div><div style={{opacity:.8}}>Avg Glucose</div><div style={{fontSize:'1.6rem',fontWeight:700}}>{show(m.avg)} {unit==='mmol'?'mmol/L':'mg/dL'}</div></div>
        <div><div style={{opacity:.8}}>Time In Range</div><div style={{fontSize:'1.6rem',fontWeight:700}}>{m.tir.toFixed(0)}%</div></div>
        <div><div style={{opacity:.8}}>High / Low</div><div style={{fontSize:'1.2rem',fontWeight:700}}>{m.high} high · {m.low} low</div></div>
      </div>
      <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
        <Link className="btn btn-primary" href="/health/quick">⚡ Quick tracker</Link>
      </div>
    </section>
  </main>);
}

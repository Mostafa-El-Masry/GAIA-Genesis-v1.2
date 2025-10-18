'use client';
import React, { useEffect, useState } from 'react';
type Reading = { date:string; glucose:number; insulin?:number };
export default function Health(){
  const [unit, setUnit] = useState<'mgdl'|'mmol'>('mgdl');
  const [rows, setRows] = useState<Reading[]>(()=>{ try{ return JSON.parse(localStorage.getItem('healthRecords')||'[]') }catch{ return [] } });
  useEffect(()=>{ const s = JSON.parse(localStorage.getItem('__settings')||'{}'); if(s.glucoseUnit) setUnit(s.glucoseUnit); },[]);
  useEffect(()=>{ const s = JSON.parse(localStorage.getItem('__settings')||'{}'); s.glucoseUnit=unit; localStorage.setItem('__settings', JSON.stringify(s)); },[unit]);
  const add = () => { const today=new Date().toISOString().slice(0,10); const g=Number(prompt('Glucose value')); if(!g) return; const insulin = Number(prompt('Insulin (optional)')); const mg = unit==='mmol' ? Math.round(g*18) : g; const r:Reading={date:today,glucose:mg,insulin:insulin||undefined}; const next=[r,...rows]; setRows(next); localStorage.setItem('healthRecords', JSON.stringify(next)); };
  const show = (mg:number)=> unit==='mmol' ? (mg/18).toFixed(1) : mg.toFixed(0);
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">💉 Health Tracker</h2>
    <div style={{display:'flex',gap:8,marginBottom:8}}>
      <label>Units:</label>
      <select className="input" value={unit} onChange={e=>setUnit(e.target.value as any)} style={{maxWidth:160}}><option value="mgdl">mg/dL</option><option value="mmol">mmol/L</option></select>
      <button className="btn btn-primary" onClick={add}>Add reading</button>
    </div>
    <div className="overflow-x-auto"><table className="min-w-full text-sm border">
      <thead className="bg-gray-200"><tr><th className="p-2 border">Date</th><th className="p-2 border">Glucose</th><th className="p-2 border">Insulin</th></tr></thead>
      <tbody>
        {rows.map((r,i)=>(<tr key={r.date+i} className="border-t"><td className="p-2 border">{r.date}</td><td className="p-2 border">{show(r.glucose)} {unit==='mmol'?'mmol/L':'mg/dL'}</td><td className="p-2 border">{r.insulin ?? '-'}</td></tr>))}
        {rows.length===0 && <tr><td colSpan={3} className="text-center text-gray-400 p-3">No data.</td></tr>}
      </tbody>
    </table></div>
  </main>);
}

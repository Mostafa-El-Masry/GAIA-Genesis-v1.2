'use client';
import React, { useMemo, useState } from 'react';
export default function StarPicker({ value, onChange, suggestions = [], placeholder = 'Add star/actor and Enter' }:{ value:string[]; onChange:(v:string[])=>void; suggestions?:string[]; placeholder?:string; }){
  const [input, setInput] = useState('');
  const add = (t:string) => { const v=t.trim(); if(!v || value.includes(v)) return; onChange([...value, v]); setInput(''); };
  const remove = (t:string) => onChange(value.filter(x=>x!==t));
  const filtered = useMemo(()=> suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0,8), [input, suggestions, value]);
  return (<div style={{display:'grid',gap:6}}>
    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
      {value.map(t=> <span key={t} className="glass" style={{padding:'2px 8px',borderRadius:999}}>★ {t}<button onClick={()=>remove(t)} style={{marginLeft:6,background:'transparent',border:0,cursor:'pointer'}}>×</button></span>)}
    </div>
    <input className="input" value={input} placeholder={placeholder} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ add(input); } }} />
    {filtered.length>0 && <div className="glass" style={{padding:6,borderRadius:8,display:'flex',gap:6,flexWrap:'wrap'}}>{filtered.map(s=><button key={s} className="btn btn-outline" onClick={()=>add(s)}>{s}</button>)}</div>}
  </div>);
}

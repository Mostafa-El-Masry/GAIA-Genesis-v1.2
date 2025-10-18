'use client';
import React, { useEffect, useRef, useState } from 'react';
import AFInput from '@/components/AFInput';
type Research = { id:string; topic:string; notes:string; sources:string[]; createdAt:string };
const RS_KEY='gaia_apollo'; const TL_KEY='gaia_timeline';
function uid(){ return String(Date.now())+Math.random().toString(16).slice(2); }
export default function Apollo(){
  const [topic,setTopic]=useState(''); const [notes,setNotes]=useState(''); const [sourcesText,setSourcesText]=useState('');
  const [saved,setSaved]=useState<Research[]>(()=>{ try{ return JSON.parse(localStorage.getItem(RS_KEY)||'[]') }catch{ return [] } });
  // mic
  const [listening,setListening]=useState(false); const ref=useRef<SpeechRecognition|null>(null as any);
  useEffect(()=>{ const SR=(window as any).webkitSpeechRecognition||(window as any).SpeechRecognition; if(!SR) return; const r=new SR(); r.continuous=true; r.interimResults=true; r.lang='en-US';
    r.onresult=(e:any)=>{ let txt=''; for(let i=e.resultIndex;i<e.results.length;i++){ txt += e.results[i][0].transcript; } setNotes(n=> (n? n+' ' : '')+txt); }; r.onend=()=>setListening(false); ref.current=r; },[]);
  const toggle=()=>{ const r=ref.current; if(!r){ alert('SpeechRecognition not supported'); return; } if(listening){ r.stop(); setListening(false); } else { r.start(); setListening(true); } };
  const speak=()=>{ if(!('speechSynthesis' in window)) return alert('SpeechSynthesis not supported'); const u=new SpeechSynthesisUtterance((topic?`Topic: ${topic}. `:'')+notes.slice(0,2400)); window.speechSynthesis.speak(u); };
  const save=()=>{ if(!topic && !notes) return; const srcs=sourcesText.split('\n').map(s=>s.trim()).filter(Boolean); const entry={ id:uid(), topic:topic||'Untitled', notes, sources:srcs, createdAt:new Date().toISOString() }; const next=[entry, ...saved]; setSaved(next); localStorage.setItem(RS_KEY, JSON.stringify(next)); setTopic(''); setNotes(''); setSourcesText(''); };
  const writeToTimeline=()=>{ const lines=notes.split(/\n|\. /).map(s=>s.trim()).filter(Boolean).slice(0,8); const today=new Date().toISOString().slice(0,10);
    const prev: any[] = (()=>{ try{ return JSON.parse(localStorage.getItem(TL_KEY)||'[]') }catch{ return [] } })();
    const evts = lines.map((l,i)=>({ id:uid(), title:(topic?`${topic} — Part ${i+1}`:`Note ${i+1}`), date: today, description: l, category:'global' }));
    localStorage.setItem(TL_KEY, JSON.stringify([...evts,...prev])); alert(`${evts.length} events appended.`);
  };
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">🧠 Apollo Research</h2>
    <div className="glass" style={{padding:'1rem',borderRadius:12,display:'grid',gap:8}}>
      <AFInput placeholder="Topic" value={topic} onChange={(e:any)=>setTopic(e.target.value)} />
      <textarea className="input" rows={6} placeholder="Notes… (dictate with mic)" value={notes} onChange={e=>setNotes(e.target.value)} />
      <textarea className="input" rows={3} placeholder="Sources (one per line)" value={sourcesText} onChange={e=>setSourcesText(e.target.value)} />
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className="btn" onClick={toggle}>{listening?'🎙️ Stop':'🎙️ Mic'}</button>
        <button className="btn" onClick={speak}>🔊 Speak</button>
        <button className="btn btn-primary" onClick={save}>💾 Save</button>
        <button className="btn btn-outline" onClick={writeToTimeline}>🗓️ Write to Timeline</button>
      </div>
    </div>
    <div className="glass" style={{padding:'1rem',borderRadius:12}}>
      <h3>Saved</h3>
      <ul style={{listStyle:'none',padding:0}}>
        {saved.map(r=>(<li key={r.id} style={{borderTop:'1px solid rgba(255,255,255,.12)',padding:'.5rem 0'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><strong>{r.topic}</strong><small>{new Date(r.createdAt).toLocaleString()}</small></div>
          {r.sources.length>0 && <div style={{fontSize:12,opacity:.8}}>Sources: {r.sources.join(', ')}</div>}
          <div style={{opacity:.9}}>{r.notes.slice(0,320)}{r.notes.length>320?'…':''}</div>
        </li>))}
        {saved.length===0 && <li style={{opacity:.6}}>No research yet.</li>}
      </ul>
    </div>
  </main>);
}

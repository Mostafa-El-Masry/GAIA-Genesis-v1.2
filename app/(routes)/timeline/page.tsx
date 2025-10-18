'use client';
import React, { useMemo, useState } from 'react';
import AFInput from '@/components/AFInput';
import AFButton from '@/components/AFButton';
import { useMediaManifest } from '@/hooks/useMediaManifest';
type TimelineEvent = { id:string; title:string; date:string; description:string; category:'personal'|'global'; };
const TL_KEY='gaia_timeline';
export default function TimelinePage(){
  const [events, setEvents] = useState<TimelineEvent[]>(()=>{ try{ return JSON.parse(localStorage.getItem(TL_KEY)||'[]') }catch{ return [] } });
  const [filter, setFilter] = useState('all'); const [search, setSearch]=useState(''); const [tags, setTags]=useState('');
  const { images } = useMediaManifest();
  const list = useMemo(()=> events.filter(e => (filter==='all'||e.category===filter) && ((e.title+' '+e.description).toLowerCase().includes(search.toLowerCase()))),[events,filter,search]);
  const startSlideshow = () => {
    const qs = tags.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const matched = images.filter(i => qs.length===0 || qs.some(t => (i.title||'').toLowerCase().includes(t)));
    if(matched.length===0) return alert('No matching images.');
    const w = window.open('', '_blank'); if(!w) return;
    w.document.write(`<html><body style="margin:0;background:#000;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center"><div id="r"></div><script>var i=0,imgs=${JSON.stringify(matched.map(m=>m.src))}; function show(){ document.getElementById('r').innerHTML='<img src="'+imgs[i]+'" style="max-height:100%;max-width:100%;object-fit:contain"/>'; i=(i+1)%imgs.length; } show(); setInterval(show,3000);</script></body></html>`);
  };
  return (<main className="glass" style={{padding:'1rem',borderRadius:12}}>
    <h2 className="text-3xl font-bold text-center mb-2">🕰️ Timeline</h2>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
      <AFInput placeholder="Search…" value={search} onChange={(e:any)=>setSearch(e.target.value)} />
      <select className="input" value={filter} onChange={(e:any)=>setFilter(e.target.value)} style={{maxWidth:180}}>
        <option value="all">All</option><option value="global">Global</option><option value="personal">Personal</option>
      </select>
      <AFInput placeholder="Slideshow tags (comma separated)" value={tags} onChange={(e:any)=>setTags(e.target.value)} />
      <AFButton onClick={startSlideshow}>Start Slideshow</AFButton>
    </div>
    <ul style={{listStyle:'none',padding:0,margin:0}}>
      {list.map(e=>(<li key={e.id} style={{padding:'.5rem 0',borderTop:'1px solid rgba(255,255,255,.12)'}}>
        <div><small>{e.date}</small></div><strong>{e.title}</strong><div style={{opacity:.85}}>{e.description}</div>
      </li>))}
      {list.length===0 && <li style={{opacity:.6}}>No entries.</li>}
    </ul>
  </main>);
}

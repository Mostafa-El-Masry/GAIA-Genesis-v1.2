'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
type View = 'slideshow'|'grid';
export type ImageGalleryItem = { src:string; title?:string; category?:string; tags?:string[] };
export default function ImageGallery({ items, enableSelection=false, onToggleSelect, isSelected }:{ items:ImageGalleryItem[]; enableSelection?:boolean; onToggleSelect?:(src:string)=>void; isSelected?:(src:string)=>boolean; }){
  const [view, setView] = useState<View>('slideshow'); const [index, setIndex] = useState(0);
  const count = items.length; const current = items[index];
  const next = useCallback(()=> setIndex(i => (i+1)%count), [count]);
  const prev = useCallback(()=> setIndex(i => (i-1+count)%count), [count]);
  const first = useCallback(()=> setIndex(0), []);
  const last = useCallback(()=> setIndex(count-1), [count]);
  useEffect(()=>{ function onKey(e:KeyboardEvent){ if(view!=='slideshow') return; if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); if(e.key==='Home') first(); if(e.key==='End') last(); } window.addEventListener('keydown', onKey); return ()=>window.removeEventListener('keydown', onKey); },[view,next,prev,first,last]);
  const prevIdx = (index - 1 + count) % count; const nextIdx = (index + 1) % count;
  const grid = useMemo(()=> (<div style={{display:'grid',gridTemplateColumns:'repeat(5, minmax(0,1fr))',gap:12}}>
    {items.map((img, i)=>(<div key={img.src+i} style={{position:'relative',border:'1px solid rgba(255,255,255,.12)',borderRadius:12,overflow:'hidden',background:'#0f1117'}} onClick={()=>setIndex(i)}>
      {enableSelection && <label style={{position:'absolute',top:8,left:8,zIndex:2,background:'rgba(0,0,0,.45)',padding:'2px 6px',borderRadius:8}} onClick={e=>e.stopPropagation()}><input type="checkbox" checked={!!isSelected?.(img.src)} onChange={()=>onToggleSelect?.(img.src)} /> select</label>}
      <img src={img.src} style={{width:'100%',height:220,objectFit:'cover',display:'block'}} alt={img.title||''}/>
      <div style={{position:'absolute',left:0,right:0,bottom:0,padding:'6px 8px',background:'linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))'}}><small>{img.title}</small></div>
    </div>))}
  </div>),[items,isSelected,onToggleSelect]);
  return (<section style={{display:'grid',gap:12}}>
    <div style={{display:'flex',gap:8}}>
      <button className={view==='slideshow'?'btn btn-primary':'btn'} onClick={()=>setView('slideshow')}>Slideshow</button>
      <button className={view==='grid'?'btn btn-primary':'btn'} onClick={()=>setView('grid')}>Grid (5 cols)</button>
    </div>
    {view==='slideshow' ? (
      <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',height:'55vh',border:'1px solid rgba(255,255,255,.12)',borderRadius:12,background:'#0f1117'}}>
        {current?.src ? <img src={current.src} alt={current.title||''} style={{maxHeight:'100%',maxWidth:'100%',objectFit:'contain'}}/> : <div style={{opacity:.6}}>No image</div>}
        {count>0 && (<div style={{position:'absolute',top:'50%',left:8,transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:6}}>
          <img src={items[0].src} onClick={first} title="First" style={{width:64,height:64,objectFit:'cover',borderRadius:8, cursor:'pointer', border:'1px solid rgba(255,255,255,.12)'}}/>
          <img src={items[prevIdx].src} onClick={prev} title="Prev" style={{width:64,height:64,objectFit:'cover',borderRadius:8, cursor:'pointer', border:'1px solid rgba(255,255,255,.12)'}}/>
        </div>)}
        {count>0 && (<div style={{position:'absolute',top:'50%',right:8,transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:6}}>
          <img src={items[nextIdx].src} onClick={next} title="Next" style={{width:64,height:64,objectFit:'cover',borderRadius:8, cursor:'pointer', border:'1px solid rgba(255,255,255,.12)'}}/>
          <img src={items[count-1].src} onClick={last} title="Last" style={{width:64,height:64,objectFit:'cover',borderRadius:8, cursor:'pointer', border:'1px solid rgba(255,255,255,.12)'}}/>
        </div>)}
      </div>
    ) : grid}
  </section>);
}

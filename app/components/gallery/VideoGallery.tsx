'use client';
import React, { useEffect, useState } from 'react';
export type VideoItem = { src:string; title?:string; poster?:string; stars?:string[]; genre?:string; year?:number };
export default function VideoGallery({ items, enableSelection=false, onToggleSelect, isSelected }:{ items:VideoItem[]; enableSelection?:boolean; onToggleSelect?:(src:string)=>void; isSelected?:(src:string)=>boolean; }){
  const [current, setCurrent] = useState<VideoItem | null>(items[0] || null);
  useEffect(()=>{ if(!current && items.length) setCurrent(items[0]); },[items,current]);
  return (<section style={{display:'grid',gap:12}}>
    <div style={{border:'1px solid rgba(255,255,255,.12)',borderRadius:12,background:'#0f1117',padding:6}}>
      {current ? <video key={current.src} src={current.src} poster={current.poster} controls preload="metadata" style={{width:'100%',maxHeight:'50vh',borderRadius:8}}/> : <div style={{padding:'1rem'}}>No video selected</div>}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:12}}>
      {items.map((v,i)=>(
        <div key={v.src+i} role="button" tabIndex={0} onClick={()=>setCurrent(v)} style={{position:'relative',border:'1px solid rgba(255,255,255,.12)',borderRadius:12,overflow:'hidden',background:'#0f1117'}}>
          {enableSelection && <label style={{position:'absolute',top:8,left:8,zIndex:2,background:'rgba(0,0,0,.45)',padding:'2px 6px',borderRadius:8}} onClick={e=>e.stopPropagation()}>
            <input type="checkbox" checked={!!isSelected?.(v.src)} onChange={()=>onToggleSelect?.(v.src)} /> select
          </label>}
          <img src={v.poster || '/media/previews/placeholder.jpg'} alt={v.title||''} style={{width:'100%',height:160,objectFit:'cover',display:'block'}}/>
          <div style={{position:'absolute',left:0,right:0,bottom:0,padding:'6px 8px',background:'linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))'}}>
            <small>{v.title}</small>
            <div style={{fontSize:11,opacity:.8}}>{v.genre||'-'} {v.year?`• ${v.year}`:''}</div>
          </div>
        </div>
      ))}
    </div>
  </section>);
}

'use client';
import { useEffect, useMemo, useState } from 'react';
import { load, save } from '@/hooks/useStorage';
export type VideoMeta = { src:string; title?:string; stars:string[]; genre?:string; year?:number; tags?:string[]; createdAt?:string; updatedAt?:string };
const KEY='video_meta';
function migrate(x:any): VideoMeta[]{ const arr = Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : []; return arr.map((it:any)=>({ src:String(it.src), title:it.title, stars:Array.isArray(it.stars)?it.stars:[], genre:typeof it.genre==='string'?it.genre:undefined, year:typeof it.year==='number'?it.year:(typeof it.year==='string'?Number(it.year)||undefined:undefined), tags:Array.isArray(it.tags)?it.tags:[], createdAt:it.createdAt, updatedAt:it.updatedAt })); }
export function useVideoMeta(source:{src:string;title?:string}[]){
  const [meta, setMeta] = useState<VideoMeta[]>(() => load(KEY, [], migrate));
  useEffect(()=>{
    setMeta(prev => {
      const map = new Map(prev.map(m=>[m.src,m])); let changed=false;
      for (const v of source){ if(!map.has(v.src)){ map.set(v.src,{ src:v.src, title:v.title, stars:[], tags:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }); changed=true; } }
      const next = Array.from(map.values()); if (changed) save(KEY, next); return next;
    });
  }, [source]);
  useEffect(()=>{ save(KEY, meta); },[meta]);
  const addStars = (srcs:string[], stars:string[]) => setMeta(p=>p.map(m=>srcs.includes(m.src)?{...m,stars:Array.from(new Set([...(m.stars||[]), ...stars.map(s=>s.trim()).filter(Boolean)])),updatedAt:new Date().toISOString()}:m));
  const setGenre = (srcs:string[], genre?:string) => setMeta(p=>p.map(m=>srcs.includes(m.src)?{...m,genre:genre||undefined,updatedAt:new Date().toISOString()}:m));
  const setYear = (srcs:string[], year?:number) => setMeta(p=>p.map(m=>srcs.includes(m.src)?{...m,year,updatedAt:new Date().toISOString()}:m));
  const allGenres = useMemo(()=>{ const s=new Set<string>(); for(const m of meta) if(m.genre) s.add(m.genre); return Array.from(s).sort(); },[meta]);
  const allStars = useMemo(()=>{ const s=new Set<string>(); for(const m of meta) for(const a of (m.stars||[])) s.add(a); return Array.from(s).sort(); },[meta]);
  return { meta, setMeta, addStars, setGenre, setYear, allGenres, allStars };
}

'use client';
import { useEffect, useMemo, useState } from 'react';
import { load, save } from '@/hooks/useStorage';
export type Category = 'Unsorted'|'Personal'|'Family'|'Work'|'Travel'|'Art'|'Private';
export type ImageMeta = { src:string; title?:string; category:Category; tags:string[]; createdAt?:string; updatedAt?:string };
const KEY='gallery_meta';
function migrate(x:any): ImageMeta[]{ const arr = Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : []; return arr.map((it:any)=>({ src:String(it.src), title:it.title, category:(it.category as Category)||'Unsorted', tags:Array.isArray(it.tags)?it.tags:[], createdAt:it.createdAt, updatedAt:it.updatedAt })); }
export function useGalleryMeta(source:{src:string;title?:string}[]){
  const [meta, setMeta] = useState<ImageMeta[]>(() => load(KEY, [], migrate));
  useEffect(()=>{ // ensure every image has a meta row
    setMeta(prev => {
      const map = new Map(prev.map(m=>[m.src,m])); let changed=false;
      for (const img of source){ if(!map.has(img.src)){ map.set(img.src,{ src:img.src, title:img.title, category:'Unsorted', tags:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }); changed=true; } }
      const next = Array.from(map.values()); if (changed) save(KEY, next); return next;
    });
  }, [source]);
  useEffect(()=>{ save(KEY, meta); }, [meta]);
  const categories = useMemo(()=>['Unsorted','Personal','Family','Work','Travel','Art','Private'] as const, []);
  const setCategory = (srcs:string[], category:Category) => setMeta(p=>p.map(m=>srcs.includes(m.src)?{...m,category,updatedAt:new Date().toISOString()}:m));
  const addTags = (srcs:string[], tags:string[]) => setMeta(p=>p.map(m=>srcs.includes(m.src)?{...m,tags:Array.from(new Set([...(m.tags||[]), ...tags.map(t=>t.trim()).filter(Boolean)])),updatedAt:new Date().toISOString()}:m));
  return { meta, setMeta, categories, setCategory, addTags };
}

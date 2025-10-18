'use client';
import { useEffect, useState } from 'react';
export type Manifest = { images: { src:string; title?:string }[]; videos: { src:string; title?:string; poster?:string }[] };
const CANDIDATES = ['/manifest.json', '/media/manifest.json'];
export function useMediaManifest(){
  const [images, setImages] = useState<Manifest['images']>([]);
  const [videos, setVideos] = useState<Manifest['videos']>([]);
  useEffect(() => {
    let live = true;
    async function boot(){
      try{ const cached = localStorage.getItem('gaia_manifest_cache'); if (cached){ const m = JSON.parse(cached); setImages(m.images||[]); setVideos(m.videos||[]); } }catch {}
      for (const url of CANDIDATES){
        try{ const r = await fetch(url, { cache:'no-store' }); if (r.ok){ const m = await r.json(); if(!live) return; setImages(m.images||[]); setVideos(m.videos||[]); try{ localStorage.setItem('gaia_manifest_cache', JSON.stringify(m)); }catch{} return; } }catch {}
      }
    }
    boot(); return () => { live = false; };
  }, []);
  return { images, videos };
}

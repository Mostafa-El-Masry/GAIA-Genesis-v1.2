'use client';
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ImageGallery from '@/components/gallery/ImageGallery';
import VideoGallery from '@/components/gallery/VideoGallery';
type ImageItem = { src:string; title?:string };
type VideoItem = { src:string; title?:string; poster?:string; preview?:{count?:number;pattern?:string} };
function useManifest(){ const [data,setData]=React.useState<{images:ImageItem[],videos:VideoItem[]}>({images:[],videos:[]});
  React.useEffect(()=>{ (async()=>{ try{ const res=await fetch('/manifest.json',{cache:'no-store'}); const j=await res.json(); setData({ images:j?.images||[], videos:j?.videos||[] }); }catch{ setData({images:[],videos:[]}); } })(); },[]); return data; }
export default function GalleryPage(){
  const params = useSearchParams(); const router = useRouter();
  const rawType = (params.get('type')||'image').toLowerCase();
  const type = (rawType==='video'?'video':'image') as 'image'|'video';
  const { images, videos } = useManifest();
  const setType=(t:'image'|'video')=>{ const qs=new URLSearchParams(params.toString()); qs.set('type', t); router.push(`/gallery?${qs.toString()}`); };
  return (<main style={{display:'grid',gap:12}}>
    <header style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
      <div className="tab">
        <button className={type==='image'?'btn btn-primary':'btn'} onClick={()=>setType('image')}>Images</button>
        <button className={type==='video'?'btn btn-primary':'btn'} onClick={()=>setType('video')}>Videos</button>
      </div>
    </header>
    {type==='image' ? (<ImageGallery />) : (<VideoGallery items={videos} />)}
  </main>);
}

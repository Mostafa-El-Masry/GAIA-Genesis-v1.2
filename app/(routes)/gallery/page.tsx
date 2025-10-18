'use client';
import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMediaManifest } from '@/hooks/useMediaManifest';
import ImageGallery from '@/components/gallery/ImageGallery';
import VideoGallery from '@/components/gallery/VideoGallery';
import { useGalleryMeta, type Category } from '@/hooks/useGalleryMeta';
import { useVideoMeta } from '@/hooks/useVideoMeta';
import TagPicker from '@/components/TagPicker';
import StarPicker from '@/components/StarPicker';
export default function GalleryPage(){
  const params = useSearchParams(); const router = useRouter();
  const type = (params.get('type')==='video'?'video':'image') as 'image'|'video';
  const { images, videos } = useMediaManifest();
  const { meta: imgMeta, categories, setCategory, addTags } = useGalleryMeta(images.map(i=>({src:i.src,title:i.title})));
  const { meta: vidMeta, addStars, setGenre, setYear, allGenres, allStars } = useVideoMeta(videos.map(v=>({src:v.src,title:v.title})));
  const [category, setCat] = useState<Category>('Unsorted');
  const [tagQuery, setTagQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [starQuery, setStarQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [bulkStars, setBulkStars] = useState<string[]>([]);
  const [bulkGenre, setBulkGenre] = useState('');
  const [bulkYear, setBulkYear] = useState('');
  const setType=(t:'image'|'video')=>{ const qs=new URLSearchParams(params.toString()); qs.set('type', t); router.push(`/gallery?${qs.toString()}`); };
  const imageItems = useMemo(()=>{ const map=new Map(imgMeta.map(m=>[m.src,m])); return images.map(i=>{ const m=map.get(i.src); return { ...i, category:m?.category||'Unsorted', tags:m?.tags||[] }; }); },[images,imgMeta]);
  const filteredImages = useMemo(()=>{ const q=tagQuery.trim().toLowerCase(); return imageItems.filter(it=>{ const byCat = category==='Unsorted' ? true : it.category===category; const byTag = !q || (it.tags||[]).some(t=>t.toLowerCase().includes(q)) || (it.title||'').toLowerCase().includes(q); return byCat && byTag; }); },[imageItems,category,tagQuery]);
  const videoItems = useMemo(()=>{ const map=new Map(vidMeta.map(m=>[m.src,m])); return videos.map(v=>{ const m=map.get(v.src); return { ...v, stars:m?.stars||[], genre:m?.genre, year:m?.year }; }); },[videos,vidMeta]);
  const filteredVideos = useMemo(()=>{ const sq=starQuery.trim().toLowerCase(); const yf=yearFilter.trim(); return videoItems.filter(it=>{ const sOk=!sq || (it.stars||[]).some(s=>s.toLowerCase().includes(sq)); const gOk=!genreFilter || it.genre===genreFilter; const yOk=!yf || String(it.year||'').startsWith(yf); return sOk && gOk && yOk; }); },[videoItems,starQuery,genreFilter,yearFilter]);
  const toggleImage = (src:string)=> setSelectedImages(p=>{ const n=new Set(p); n.has(src)?n.delete(src):n.add(src); return n; });
  const toggleVideo = (src:string)=> setSelectedVideos(p=>{ const n=new Set(p); n.has(src)?n.delete(src):n.add(src); return n; });
  const applyImages=()=>{ const ids=[...selectedImages]; if(!ids.length) return; if(bulkTags.length) addTags(ids, bulkTags); if(category!=='Unsorted') setCategory(ids, category); setSelectedImages(new Set()); setBulkTags([]); };
  const applyVideos=()=>{ const ids=[...selectedVideos]; if(!ids.length) return; if(bulkStars.length) addStars(ids, bulkStars); if(bulkGenre.trim()) setGenre(ids, bulkGenre.trim()); if(bulkYear.trim()) setYear(ids, Number(bulkYear)||undefined); setSelectedVideos(new Set()); setBulkStars([]); setBulkGenre(''); setBulkYear(''); };
  const fileRef = useRef<HTMLInputElement>(null);
  const onUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f) return; f.text().then(txt=>{ try{ const m=JSON.parse(txt); localStorage.setItem('gaia_manifest_cache', JSON.stringify(m)); location.reload(); }catch(err:any){ alert('Invalid manifest: '+err.message); } }); };
  return (<main style={{display:'grid',gap:12}}>
    <header style={{display:'flex',gap:8,alignItems:'center'}}>
      <div className="tab">
        <button className={type==='image'?'btn btn-primary':'btn'} onClick={()=>setType('image')}>Images</button>
        <button className={type==='video'?'btn btn-primary':'btn'} onClick={()=>setType('video')}>Videos</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={onUpload}/>
      <button className="btn btn-outline" onClick={()=>fileRef.current?.click()}>Load manifest.json…</button>
    </header>
    {type==='image' ? (<>
      {selectedImages.size>0 && (<section className="glass" style={{padding:'1rem',borderRadius:12}}>
        <h4 style={{marginBottom:6}}>Bulk tag / recategorize</h4>
        <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr',maxWidth:720}}>
          <div><label style={{fontSize:12,opacity:.8}}>Category</label><select className="input" value={category} onChange={e=>setCat(e.target.value as Category)}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div><label style={{fontSize:12,opacity:.8}}>Tags</label><TagPicker value={bulkTags} onChange={setBulkTags} /></div>
          <div style={{display:'flex',gap:8}}><button className="btn btn-primary" onClick={applyImages}>Apply</button><button className="btn btn-outline" onClick={()=>setSelectedImages(new Set())}>Cancel</button></div>
        </div>
      </section>)}
      <ImageGallery items={filteredImages} enableSelection onToggleSelect={toggleImage} isSelected={(s)=>selectedImages.has(s)} />
    </>) : (<>
      {selectedVideos.size>0 && (<section className="glass" style={{padding:'1rem',borderRadius:12}}>
        <h4 style={{marginBottom:6}}>Bulk assign (videos)</h4>
        <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr',maxWidth:720}}>
          <div><label style={{fontSize:12,opacity:.8}}>Stars</label><StarPicker value={bulkStars} onChange={setBulkStars} suggestions={allStars}/></div>
          <div><label style={{fontSize:12,opacity:.8}}>Genre</label><input className="input" value={bulkGenre} onChange={e=>setBulkGenre(e.target.value)} placeholder="e.g. Documentary" /></div>
          <div><label style={{fontSize:12,opacity:.8}}>Year</label><input className="input" value={bulkYear} onChange={e=>setBulkYear(e.target.value)} placeholder="e.g. 2021" /></div>
          <div style={{display:'flex',gap:8}}><button className="btn btn-primary" onClick={applyVideos}>Apply</button><button className="btn btn-outline" onClick={()=>setSelectedVideos(new Set())}>Cancel</button></div>
        </div>
      </section>)}
      <VideoGallery items={filteredVideos} enableSelection onToggleSelect={toggleVideo} isSelected={(s)=>selectedVideos.has(s)} />
    </>)}
  </main>);
}

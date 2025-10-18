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

  // --------- Multi-select chips (no "All"): categories + top tags ---------
  const [activeCats, setActiveCats] = useState<Category[]>([]);
  const toggleCat = (c:Category) => setActiveCats(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]);

  // collect top tags from meta
  const tagCounts = useMemo(()=>{
    const m = new Map<string, number>();
    for (const r of imgMeta) for (const t of r.tags || []) m.set(t, (m.get(t)||0)+1);
    return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);
  }, [imgMeta]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const toggleTag = (t:string) => setActiveTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);

  // search bar for images (kept, but optional)
  const [tagQuery, setTagQuery] = useState('');

  // --------- Image pipeline ---------
  const imageItems = useMemo(()=>{
    const map=new Map(imgMeta.map(m=>[m.src,m]));
    return images.map(i=>{
      const m=map.get(i.src);
      return { ...i, category:m?.category||'Unsorted', tags:m?.tags||[] };
    });
  },[images,imgMeta]);

  const filteredImages = useMemo(()=>{
    const q = tagQuery.trim().toLowerCase();
    const byCats = (it:any) => activeCats.length===0 ? true : activeCats.includes(it.category);
    const byTags = (it:any) => activeTags.length===0 ? true : activeTags.some(t => (it.tags||[]).includes(t));
    const byQuery = (it:any) => !q || (it.tags||[]).some((t:string)=>t.toLowerCase().includes(q)) || (it.title||'').toLowerCase().includes(q);
    return imageItems.filter(it => byCats(it) && byTags(it) && byQuery(it));
  }, [imageItems, activeCats, activeTags, tagQuery]);

  // --------- Video pipeline (unchanged filters for now) ---------
  const [starQuery, setStarQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [bulkStars, setBulkStars] = useState<string[]>([]);
  const [bulkGenre, setBulkGenre] = useState('');
  const [bulkYear, setBulkYear] = useState('');

  const videoItems = useMemo(()=>{
    const map=new Map(vidMeta.map(m=>[m.src,m]));
    return videos.map(v=>{
      const m=map.get(v.src);
      return { ...v, stars:m?.stars||[], genre:m?.genre, year:m?.year };
    });
  },[videos,vidMeta]);

  const filteredVideos = useMemo(()=>{
    const sq=starQuery.trim().toLowerCase();
    const yf=yearFilter.trim();
    return videoItems.filter(it=>{
      const sOk=!sq || (it.stars||[]).some((s:string)=>s.toLowerCase().includes(sq));
      const gOk=!genreFilter || it.genre===genreFilter;
      const yOk=!yf || String(it.year||'').startsWith(yf);
      return sOk && gOk && yOk;
    });
  },[videoItems,starQuery,genreFilter,yearFilter]);

  const setType=(t:'image'|'video')=>{ const qs=new URLSearchParams(params.toString()); qs.set('type', t); router.push(`/gallery?${qs.toString()}`); };
  const toggleImage = (src:string)=> setSelectedImages(p=>{ const n=new Set(p); n.has(src)?n.delete(src):n.add(src); return n; });
  const toggleVideo = (src:string)=> setSelectedVideos(p=>{ const n=new Set(p); n.has(src)?n.delete(src):n.add(src); return n; });

  const applyImages=()=>{
    const ids=[...selectedImages]; if(!ids.length) return;
    if(bulkTags.length) addTags(ids, bulkTags);
    if(activeCats.length===1) setCategory(ids, activeCats[0]); // if exactly one cat is selected, recategorize
    setSelectedImages(new Set()); setBulkTags([]);
  };
  const applyVideos=()=>{
    const ids=[...selectedVideos]; if(!ids.length) return;
    if(bulkStars.length) addStars(ids, bulkStars);
    if(bulkGenre.trim()) setGenre(ids, bulkGenre.trim());
    if(bulkYear.trim()) setYear(ids, Number(bulkYear)||undefined);
    setSelectedVideos(new Set()); setBulkStars([]); setBulkGenre(''); setBulkYear('');
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const onUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return;
    f.text().then(txt=>{ try{ const m=JSON.parse(txt); localStorage.setItem('gaia_manifest_cache', JSON.stringify(m)); location.reload(); }catch(err:any){ alert('Invalid manifest: '+err.message); } });
  };

  return (<main style={{display:'grid',gap:12}}>
    <header style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
      <div className="tab">
        <button className={type==='image'?'btn btn-primary':'btn'} onClick={()=>setType('image')}>Images</button>
        <button className={type==='video'?'btn btn-primary':'btn'} onClick={()=>setType('video')}>Videos</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={onUpload}/>
      <button className="btn btn-outline" onClick={()=>fileRef.current?.click()}>Load manifest.json…</button>
    </header>

    {type==='image' ? (<>
      {/* Multi-select chips for categories */}
      <section className="glass" style={{padding:'8px 10px',borderRadius:12}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          {categories.map(c => (
            <button key={c}
                    onClick={()=>toggleCat(c)}
                    className="btn"
                    style={{borderColor: activeCats.includes(c)?'#60a5fa':'rgba(255,255,255,.2)',
                            background: activeCats.includes(c)?'rgba(96,165,250,.15)':'transparent'}}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Optional text search & top tag chips */}
      <section style={{display:'grid',gap:8}}>
        <input className="input" placeholder="Search by tag/title..." value={tagQuery} onChange={e=>setTagQuery(e.target.value)} />
        {tagCounts.length>0 && (
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {tagCounts.map(t => (
              <button key={t}
                      onClick={()=>toggleTag(t)}
                      className="btn btn-outline"
                      style={{borderColor: activeTags.includes(t)?'#60a5fa':'rgba(255,255,255,.2)',
                              background: activeTags.includes(t)?'rgba(96,165,250,.15)':'transparent'}}>
                #{t}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedImages.size>0 && (
        <section className="glass" style={{padding:'1rem',borderRadius:12}}>
          <h4 style={{marginBottom:6}}>Bulk tag / recategorize ({selectedImages.size} selected)</h4>
          <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr',maxWidth:720}}>
            <div><label style={{fontSize:12,opacity:.8}}>Tags</label><TagPicker value={Array.from(new Set([...activeTags]))} onChange={()=>{}} suggestions={tagCounts}/></div>
            <div><label style={{fontSize:12,opacity:.8}}>Add new tags</label><TagPicker value={[]} onChange={(v)=>{}} suggestions={tagCounts}/></div>
            <div><label style={{fontSize:12,opacity:.8}}>Or quick add:</label><TagPicker value={[]} onChange={(v)=>{}} suggestions={tagCounts}/></div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={applyImages}>Apply</button>
              <button className="btn btn-outline" onClick={()=>setSelectedImages(new Set())}>Cancel</button>
            </div>
          </div>
        </section>
      )}

      <ImageGallery
        items={filteredImages}
        enableSelection
        onToggleSelect={toggleImage}
        isSelected={(s)=>selectedImages.has(s)}
        showThumbStrip
        masonryColumnWidth={240}
        masonryGap={12}
      />
    </>) : (<>
      {/* video bulk tools unchanged */}
      {selectedVideos.size>0 && (<section className="glass" style={{padding:'1rem',borderRadius:12}}>
        <h4 style={{marginBottom:6}}>Bulk assign (videos)</h4>
        <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr',maxWidth:720}}>
          <div><label style={{fontSize:12,opacity:.8}}>Stars</label><StarPicker value={bulkStars} onChange={setBulkStars} suggestions={allStars}/></div>
          <div><label style={{fontSize:12,opacity:.8}}>Genre</label><input className="input" value={bulkGenre} onChange={e=>setBulkGenre(e.target.value)} placeholder="e.g. Documentary" /></div>
          <div><label style={{fontSize:12,opacity:.8}}>Year</label><input className="input" value={bulkYear} onChange={e=>setBulkYear(e.target.value)} placeholder="e.g. 2021" /></div>
          <div style={{display:'flex',gap:8}}><button className="btn btn-primary" onClick={applyVideos}>Apply</button><button className="btn btn-outline" onClick={()=>setSelectedVideos(new Set())}>Cancel</button></div>
        </div>
      </section>)}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input className="input" placeholder="Search stars…" value={starQuery} onChange={e=>setStarQuery(e.target.value)} />
        <select className="input" value={genreFilter} onChange={e=>setGenreFilter(e.target.value)} style={{maxWidth:200}}>
          <option value="">Genre…</option>
          {allGenres.map(g=> <option key={g} value={g}>{g}</option>)}
        </select>
        <input className="input" placeholder="Year…" value={yearFilter} onChange={e=>setYearFilter(e.target.value)} style={{maxWidth:120}} />
      </div>
      <VideoGallery items={filteredVideos} enableSelection onToggleSelect={toggleVideo} isSelected={(s)=>selectedVideos.has(s)} />
    </>)}
  </main>);
}

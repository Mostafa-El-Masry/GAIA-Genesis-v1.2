'use client';
import React, { useEffect, useMemo, useState } from 'react';
import '@/styles/gallery.css';
type VideoItem = { src:string; title?:string; poster?:string };
const STORAGE_KEY = 'video:viewCounts'; const FILTER_KEY = 'video:activeFilter';
function loadViewCounts(): Record<string, number> { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : {}; } catch { return {}; } }
function saveViewCounts(counts: Record<string, number>) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(counts)); } catch {} }
function incrementViews(videoSrc: string) { const counts = loadViewCounts(); counts[videoSrc] = (counts[videoSrc] || 0) + 1; saveViewCounts(counts); return counts[videoSrc]; }
export default function VideoGallery({ items }: { items: VideoItem[] }){
  const [current, setCurrent] = useState<VideoItem | null>(items[0] || null);
  const [selectedStar, setSelectedStar] = useState<string>('');
  const [showMostViewed, setShowMostViewed] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>(loadViewCounts);
  useEffect(() => { try { const saved = localStorage.getItem(FILTER_KEY); if (saved) { const f = JSON.parse(saved); setSelectedStar(f.star || ''); setShowMostViewed(!!f.mostViewed); } } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(FILTER_KEY, JSON.stringify({ star: selectedStar, mostViewed: showMostViewed })); } catch {} }, [selectedStar, showMostViewed]);
  const stars = useMemo(() => { const names = new Set<string>(); items.forEach((item) => { const name = item.title?.split(' - ')[0] || ''; if (name) names.add(name); }); return Array.from(names).sort(); }, [items]);
  const filteredItems = useMemo(() => { let filtered = items.map((item) => ({ ...item, views: viewCounts[item.src] || 0 })); if (selectedStar) filtered = filtered.filter((item) => item.title?.toLowerCase().startsWith(selectedStar.toLowerCase())); if (showMostViewed) filtered.sort((a, b) => (b as any).views - (a as any).views); return filtered; }, [items, selectedStar, showMostViewed, viewCounts]);
  useEffect(() => { if (!current && filteredItems.length) setCurrent(filteredItems[0]); }, [filteredItems, current]);
  useEffect(() => { if (filteredItems.length === 0) setCurrent(null); else if (!filteredItems.includes(current as any)) setCurrent(filteredItems[0]); }, [filteredItems, current]);
  const onVideoSelect = (video: VideoItem) => { setCurrent(video); const newCount = incrementViews(video.src); setViewCounts((prev) => ({ ...prev, [video.src]: newCount })); };
  return (
    <section className="gallery-container">
      <div className="gallery-toolbar">
        <div className="filters-container">
          <div className="select-wrapper">
            <select value={selectedStar} onChange={(e) => setSelectedStar(e.target.value)} className="star-select" aria-label="Filter videos by star">
              <option value="">Select Star</option>
              {stars.map((star) => (<option key={star} value={star}>{star}</option>))}
            </select>
            {selectedStar && (<button className="clear-filter" onClick={() => setSelectedStar('')} aria-label="Clear star filter">×</button>)}
          </div>
          <button className={'view-toggle-btn' + (showMostViewed ? ' active' : '')} onClick={() => setShowMostViewed(!showMostViewed)}>Most Viewed</button>
        </div>
      </div>
      <div className="video-player glass">
        {current ? (<>
          <video key={current.src} src={current.src} poster={current.poster} controls preload="metadata" />
          <div className="video-info"><div className="video-title">{current.title}</div><div className="video-views">{viewCounts[current.src] || 0} views</div></div>
        </>) : (<div style={{ padding: '2rem' }}>No video selected</div>)}
      </div>
      <div className="gallery-grid">
        {filteredItems.map((v, i) => (
          <div key={v.src + i} className="gallery-card" onClick={() => onVideoSelect(v)}>
            {v.poster ? <img src={v.poster} alt={v.title || 'Poster'} /> : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span>{v.title || 'Video'}</span></div>}
            <div className="label"><div>{v.title || v.src.split('/').pop()}</div><div className="views-count">{viewCounts[v.src] || 0} views</div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

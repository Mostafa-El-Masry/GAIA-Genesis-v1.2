'use client';
import React, { useMemo } from 'react';
import LinkCard from '@/components/LinkCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useMediaManifest } from '@/hooks/useMediaManifest';
import { useGalleryMeta } from '@/hooks/useGalleryMeta';
import { useVideoMeta } from '@/hooks/useVideoMeta';
import { useCertificates, buildSchedule } from '@/hooks/useCertificates';

function useHealthSummary(){
  try{
    const rows = JSON.parse(localStorage.getItem('healthRecords')||'[]') as {date:string;glucose:number;insulin?:number}[];
    const s = JSON.parse(localStorage.getItem('__settings')||'{}');
    const unit = s.glucoseUnit==='mmol' ? 'mmol' : 'mgdl';
    if(!Array.isArray(rows) || rows.length===0) return { last:null, unit };
    const last = rows[0];
    const val = unit==='mmol' ? (last.glucose/18).toFixed(1) : String(Math.round(last.glucose));
    return { last:{...last, value: val}, unit };
  }catch{ return { last:null, unit:'mgdl' }; }
}

export default function Dashboard(){
  const { images, videos } = useMediaManifest();
  const { meta: imgMeta } = useGalleryMeta(images);
  const { meta: vidMeta } = useVideoMeta(videos);
  const { items, totals, nextPayoutSummary } = useCertificates();
  const health = useHealthSummary();

  const categories = useMemo(()=>{
    const c = new Map<string, number>();
    for(const m of imgMeta){ c.set(m.category, (c.get(m.category)||0)+1); }
    return Array.from(c.entries()).sort((a,b)=>b[1]-a[1]).slice(0,4);
  }, [imgMeta]);

  const topStars = useMemo(()=>{
    const s = new Map<string, number>();
    for(const m of vidMeta){ for(const a of (m.stars||[])) s.set(a, (s.get(a)||0)+1); }
    return Array.from(s.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
  }, [vidMeta]);

  const nextPay = nextPayoutSummary();

  return (
    <main style={{display:'grid',gap:12}}>
      <h2 className="text-3xl font-bold text-center mb-2">🧭 Dashboard</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
        <ErrorBoundary>
          <LinkCard href="/wealth/certificates" title="Certificates"
            subtitle={`${items.length} items • Principal ${totals.principal.toLocaleString()} • Expected this month ${totals.expectedMonthly.toFixed(2)}`}
            extra={nextPay ? <div style={{fontSize:12,opacity:.85}}>Next payout: <strong>{nextPay.date}</strong> • {nextPay.amount.toFixed(2)} {nextPay.currency}</div> : <div style={{fontSize:12,opacity:.7}}>No upcoming payouts</div>}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <LinkCard href="/gallery" title="Gallery (Images)"
            subtitle={`${images.length} images`}
            extra={<div style={{fontSize:12,opacity:.85}}>
              Top categories: {categories.map(([k,v])=>`${k} (${v})`).join(', ') || '—'}
            </div>}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <LinkCard href="/gallery?type=video" title="Gallery (Videos)"
            subtitle={`${videos.length} videos`}
            extra={<div style={{fontSize:12,opacity:.85}}>
              Top stars: {topStars.map(([k,v])=>`${k} (${v})`).join(', ') || '—'}
            </div>}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <LinkCard href="/timeline" title="Timeline"
            subtitle="Recent entries"
            extra={<TimelinePeek />}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <LinkCard href="/healthtracker" title="Health Tracker"
            subtitle={health.last ? `Last: ${health.last.date}` : 'No data yet'}
            extra={<div style={{fontSize:12,opacity:.85}}>
              {health.last ? <>Glucose: <strong>{health.last.value}</strong> {health.unit=='mmol'?'mmol/L':'mg/dL'}</> : 'Add your first reading'}
            </div>}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <LinkCard href="/apollo" title="Apollo Research"
            subtitle="Mic dictation → Save → Append to Timeline"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <LinkCard href="/sync" title="Sync Center"
            subtitle="Export/Import local data"
          />
        </ErrorBoundary>
      </div>
    </main>
  );
}

function TimelinePeek(){
  try{
    const rows = JSON.parse(localStorage.getItem('gaia_timeline')||'[]') as any[];
    const last = rows.slice(0,3);
    if(last.length===0) return <div style={{fontSize:12,opacity:.7}}>No entries</div>;
    return <ul style={{listStyle:'none',padding:0,margin:0,fontSize:12,opacity:.9}}>{last.map((r,i)=>(
      <li key={r.id||i} style={{borderTop:'1px solid rgba(255,255,255,.12)',padding:'.25rem 0'}}>
        <div style={{opacity:.8}}>{r.date}</div>
        <div style={{whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden'}}>{r.title||'-'}</div>
      </li>
    ))}</ul>;
  }catch{
    return <div style={{fontSize:12,opacity:.7}}>No entries</div>;
  }
}

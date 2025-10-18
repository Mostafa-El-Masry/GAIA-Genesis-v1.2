'use client';
import React from 'react';
import Link from 'next/link';
import { checkRoute } from '@/lib/routeHealth';
export default function LinkCard({ href, title, subtitle, extra }:{ href:string; title:string; subtitle?:string; extra?:React.ReactNode; }){
  const ok = checkRoute(href);
  return (
    <div className="glass" style={{padding:'1rem',borderRadius:12,display:'grid',gap:6}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
        <h3 style={{fontWeight:700}}>{title}</h3>
        {ok ? <Link className="btn btn-outline" href={href}>Open</Link> : <span style={{opacity:.7}}>invalid path</span>}
      </div>
      {subtitle && <div style={{opacity:.8}}>{subtitle}</div>}
      {extra}
    </div>
  );
}

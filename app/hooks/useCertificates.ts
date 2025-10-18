'use client';
import { useEffect, useMemo, useState } from 'react';
import { load, save } from '@/hooks/useStorage';
export type Currency = 'KWD'|'EGP'|'USD'|'EUR'|'SAR'|'AED'|'QAR';
export type Receipt = { date:string; amount:number };
export type Certificate = { id:string; title:string; currency:Currency; principal:number; rateAPR:number; startDate:string; endDate:string; payoutDay:number; actualReceipts?:Receipt[]; createdAt:string; updatedAt:string };
export type ScheduleItem = { date:string; expectedAmount:number; status:'past'|'due'|'upcoming' };
const KEY='gaia_certificates';
function migrate(x:any): Certificate[]{ const arr = Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : []; return arr.map((c:any)=>({ id:String(c.id||crypto.randomUUID?.()||Date.now()), title:String(c.title||'Certificate'), currency:(c.currency||'KWD') as Currency, principal:Number(c.principal||0), rateAPR:Number(c.rateAPR||0), startDate:String(c.startDate||new Date().toISOString().slice(0,10)), endDate:String(c.endDate||new Date().toISOString().slice(0,10)), payoutDay:Number(c.payoutDay||15), actualReceipts:Array.isArray(c.actualReceipts)?c.actualReceipts.map((r:any)=>({date:String(r.date),amount:Number(r.amount)})) : [], createdAt:String(c.createdAt||new Date().toISOString()), updatedAt:String(c.updatedAt||new Date().toISOString()) })); }
function clampDay(y:number,m0:number,d:number){ const last=new Date(y,m0+1,0).getDate(); return Math.max(1,Math.min(d,last)); }
function monthDiff(a:Date,b:Date){ return (b.getFullYear()-a.getFullYear())*12 + (b.getMonth()-a.getMonth()); }
function iso(y:number,m:number,d:number){ const mm=String(m+1).padStart(2,'0'); const dd=String(d).padStart(2,'0'); return `${y}-${mm}-${dd}`; }
export function buildSchedule(cert: Certificate, now=new Date()): ScheduleItem[]{
  const s=new Date(cert.startDate+'T00:00:00'); const e=new Date(cert.endDate+'T00:00:00');
  if(isNaN(s.getTime())||isNaN(e.getTime())||e<s) return [];
  const months=monthDiff(new Date(s.getFullYear(),s.getMonth(),1), new Date(e.getFullYear(),e.getMonth(),1))+1;
  const r=cert.rateAPR/100/12; const expected=cert.principal*r;
  const items: ScheduleItem[]=[];
  for(let i=0;i<months;i++){
    const y=s.getFullYear()+Math.floor((s.getMonth()+i)/12);
    const m=(s.getMonth()+i)%12;
    const d=new Date(y,m,clampDay(y,m,cert.payoutDay));
    const today=new Date(now.toDateString());
    const status = d<today ? 'past' : (d.toDateString()===today.toDateString() ? 'due' : 'upcoming');
    items.push({ date: iso(y,m,d.getDate()), expectedAmount: expected, status });
  }
  return items;
}
export function useCertificates(){
  const [items,setItems]=useState<Certificate[]>(() => load(KEY, [], migrate));
  useEffect(()=>{ save(KEY, items); },[items]);
  function upsert(partial: Partial<Certificate> & { id?: string }){
    setItems(prev=>{
      const id = partial.id || (typeof crypto!=='undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : String(Date.now()));
      const idx = prev.findIndex(x=>x.id===id);
      const base: Certificate = idx>=0 ? prev[idx] : { id, title:'Certificate', currency:'KWD', principal:0, rateAPR:0, startDate:new Date().toISOString().slice(0,10), endDate:new Date().toISOString().slice(0,10), payoutDay:15, actualReceipts:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
      const next = { ...base, ...partial, updatedAt:new Date().toISOString() } as Certificate;
      if(idx>=0){ const arr=[...prev]; arr[idx]=next; return arr; } else { return [next, ...prev]; }
    });
  }
  function remove(id:string){ setItems(prev=>prev.filter(x=>x.id!==id)); }
  function addReceipt(id:string, r:Receipt){ setItems(prev=>prev.map(c=>c.id===id?{...c, actualReceipts:[...(c.actualReceipts||[]), r], updatedAt:new Date().toISOString()}:c)); }
  function deleteReceipt(id:string, date:string){ setItems(prev=>prev.map(c=>c.id===id?{...c, actualReceipts:(c.actualReceipts||[]).filter(x=>x.date!==date), updatedAt:new Date().toISOString()}:c)); }
  const totals = useMemo(()=>{
    const principal=items.reduce((s,c)=>s+c.principal,0);
    const expectedMonthly=items.reduce((s,c)=>s + (c.principal*(c.rateAPR/100/12)),0);
    const ym=new Date(); const y=ym.getFullYear(), m=ym.getMonth(); const start=new Date(y,m,1).toISOString().slice(0,10); const end=new Date(y,m+1,0).toISOString().slice(0,10);
    let actual=0; for(const c of items){ for(const r of (c.actualReceipts||[])){ if(r.date>=start && r.date<=end) actual+=r.amount; } }
    return { principal, expectedMonthly, actualMonthly: actual };
  },[items]);
  function nextPayoutSummary(now=new Date()){
    let soon:null | { date:string; amount:number; title:string; currency:Currency } = null;
    for(const c of items){
      const sch=buildSchedule(c, now).filter(s=>s.status!=='past');
      if(!sch.length) continue;
      const n=sch[0];
      if(!soon || new Date(n.date) < new Date(soon.date)){ soon = { date:n.date, amount:n.expectedAmount, title:c.title, currency:c.currency }; }
    }
    return soon;
  }
  const stage = useMemo(()=>{
    const savings = Number(localStorage.getItem('__gaia_savings')||'0');
    const wealth = savings + items.reduce((s,c)=>s+c.principal,0);
    let level=1,label='Builder',next=100000;
    if(wealth>=100000 && wealth<250000){ level=2; label='Achiever'; next=250000; }
    else if(wealth>=250000 && wealth<500000){ level=3; label='Wealthy'; next=500000; }
    else if(wealth>=500000){ level=4; label='Abundant'; next=wealth; }
    return { wealth, level, label, nextTarget: next };
  },[items]);
  return { items, upsert, remove, addReceipt, deleteReceipt, totals, nextPayoutSummary, stage };
}

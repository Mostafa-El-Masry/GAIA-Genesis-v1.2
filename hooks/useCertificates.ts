'use client';
import { useEffect, useState } from 'react';
export type Currency = 'KWD'|'EGP'|'USD'|'EUR'|'SAR'|'AED'|'QAR';
export type Receipt = { date:string; amount:number };
export type Certificate = { id: string; title: string; currency: Currency; principal: number; rateAPR: number; startDate: string; endDate: string; payoutDay: number; actualReceipts?: Receipt[]; };
const KEY = 'gaia_certificates';
function uid(){ return String(Date.now()) + Math.random().toString(16).slice(2); }
export function useCertificates(){
  const [items, setItems] = useState<Certificate[]>([]);
  useEffect(()=>{ try{ const arr=JSON.parse(localStorage.getItem(KEY)||'[]'); if(Array.isArray(arr)) setItems(arr); }catch{} },[]);
  useEffect(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(items)); }catch{} },[items]);
  function upsert(input: Omit<Certificate,'id'|'actualReceipts'>){ const next: Certificate = { id: uid(), actualReceipts: [], ...input }; setItems(prev => [next, ...prev]); }
  function remove(id:string){ setItems(prev => prev.filter(x=>x.id!==id)); }
  function addReceipt(id:string, r:Receipt){ setItems(prev => prev.map(x=> x.id===id ? { ...x, actualReceipts:[...(x.actualReceipts||[]), r] } : x )); }
  function deleteReceipt(id:string, date:string){ setItems(prev => prev.map(x=> x.id===id ? { ...x, actualReceipts:(x.actualReceipts||[]).filter(r=>r.date!==date) } : x  )); }
  return { items, upsert, remove, addReceipt, deleteReceipt };
}
export function buildSchedule(c: Certificate){
  const sched: { date:string; expectedAmount:number; status:'past'|'upcoming'|'final' }[] = [];
  const start = new Date(c.startDate); const end = new Date(c.endDate);
  const monthly = c.principal * (c.rateAPR/100) / 12;
  const payoutDay = Math.min(28, Math.max(1, Math.floor(c.payoutDay||15)));
  const cur = new Date(start.getFullYear(), start.getMonth(), payoutDay);
  if (cur < start) cur.setMonth(cur.getMonth()+1);
  while (cur <= end){
    const y=cur.getFullYear(), m=String(cur.getMonth()+1).padStart(2,'0'), d=String(cur.getDate()).padStart(2,'0');
    const date = `${y}-${m}-${d}`;
    const isPast = new Date(date) < new Date();
    const isFinal = new Date(date).getTime() >= new Date(end.getFullYear(), end.getMonth(), payoutDay).getTime();
    sched.push({ date, expectedAmount: monthly, status: isFinal?'final': (isPast?'past':'upcoming') });
    cur.setMonth(cur.getMonth()+1);
  }
  return sched;
}

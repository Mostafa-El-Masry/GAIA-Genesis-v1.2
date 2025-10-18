'use client';
import React, { useState } from 'react';
import { useCertificates } from '@/hooks/useCertificates';
import { type Currency } from '@/hooks/useCertificates';
export default function CertificateForm(){
  const { upsert } = useCertificates();
  const [title, setTitle] = useState('Savings Certificate');
  const [currency, setCurrency] = useState<Currency>('KWD');
  const [principal, setPrincipal] = useState<number>(0);
  const [rateAPR, setRateAPR] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payoutDay, setPayoutDay] = useState(15);
  const submit = () => { if(!startDate||!endDate) return; upsert({ title, currency, principal, rateAPR, startDate, endDate, payoutDay }); setTitle('Savings Certificate'); setPrincipal(0); setRateAPR(0); setStartDate(''); setEndDate(''); setPayoutDay(15); };
  return (<div className="glass" style={{padding:'1rem',borderRadius:12}}>
    <h3 style={{marginBottom:8}}>Create Certificate</h3>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
      <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <select className="input" value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>{['KWD','EGP','USD','EUR','SAR','AED','QAR'].map(c=><option key={c} value={c}>{c}</option>)}</select>
      <input className="input" type="number" placeholder="Principal" value={principal} onChange={e=>setPrincipal(Number(e.target.value))} />
      <input className="input" type="number" placeholder="APR %" value={rateAPR} onChange={e=>setRateAPR(Number(e.target.value))} />
      <input className="input" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
      <input className="input" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
      <input className="input" type="number" placeholder="Payout day (1-28)" value={payoutDay} onChange={e=>setPayoutDay(Math.max(1,Math.min(28, Number(e.target.value)||15)))} />
    </div>
    <div style={{display:'flex',gap:8,marginTop:8}}><button className="btn btn-primary" onClick={submit}>Add</button></div>
  </div>);
}

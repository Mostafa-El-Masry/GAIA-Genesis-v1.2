'use client';
import React, { useMemo, useState } from 'react';
import { useCertificates, buildSchedule } from '@/hooks/useCertificates';
export default function CertificateDetail({ id, onClose }:{ id:string|null; onClose:()=>void }){
  const { items, addReceipt, deleteReceipt } = useCertificates();
  const cert = items.find(x=>x.id===id) || null;
  const schedule = useMemo(()=> cert ? buildSchedule(cert) : [], [cert]);
  const [date, setDate] = useState(''); const [amount, setAmount] = useState('');
  if (!id || !cert) return null;
  const receipts = cert.actualReceipts || [];
  return (<div className="glass" style={{padding:'1rem',borderRadius:12}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <h3>{cert.title}</h3><button className="btn btn-outline" onClick={onClose}>Close</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,marginBottom:8}}>
      <div><small>Currency</small><div><strong>{cert.currency}</strong></div></div>
      <div><small>Principal</small><div><strong>{cert.principal.toLocaleString()}</strong></div></div>
      <div><small>APR%</small><div><strong>{cert.rateAPR}</strong></div></div>
      <div><small>Range</small><div><strong>{cert.startDate} → {cert.endDate}</strong></div></div>
    </div>
    <h4 style={{margin:'8px 0'}}>Schedule</h4>
    <div className="overflow-x-auto"><table className="min-w-full text-sm border">
      <thead className="bg-gray-200"><tr><th className="p-2 border">Date</th><th className="p-2 border">Expected</th><th className="p-2 border">Status</th></tr></thead>
      <tbody>{schedule.map(s=>(<tr key={s.date} className="border-t" style={{opacity: s.status==='past'?0.6:1}}>
        <td className="p-2 border">{s.date}</td><td className="p-2 border">{s.expectedAmount.toFixed(2)}</td><td className="p-2 border">{s.status}</td>
      </tr>))}{schedule.length===0 && <tr><td colSpan={3} className="text-center text-gray-400 p-3">No schedule.</td></tr>}</tbody>
    </table></div>
    <h4 style={{margin:'8px 0'}}>Receipts</h4>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <input className="input" type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
      <button className="btn btn-primary" onClick={()=>{ if(!date||!amount) return; addReceipt(cert.id,{date,amount:Number(amount)}); setDate(''); setAmount(''); }}>Add Receipt</button>
    </div>
    <div className="overflow-x-auto" style={{marginTop:8}}><table className="min-w-full text-sm border">
      <thead className="bg-gray-200"><tr><th className="p-2 border">Date</th><th className="p-2 border">Amount</th><th className="p-2 border">Actions</th></tr></thead>
      <tbody>{receipts.map(r=>(<tr key={r.date} className="border-t"><td className="p-2 border">{r.date}</td><td className="p-2 border">{r.amount.toFixed(2)}</td><td className="p-2 border"><button className="btn" onClick={()=>deleteReceipt(cert.id, r.date)}>Delete</button></td></tr>))}
        {receipts.length===0 && <tr><td colSpan={3} className="text-center text-gray-400 p-3">No receipts yet.</td></tr>}
      </tbody>
    </table></div>
  </div>);
}

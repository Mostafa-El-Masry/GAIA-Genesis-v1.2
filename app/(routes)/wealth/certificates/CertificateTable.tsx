'use client';
import React from 'react';
import { useCertificates, buildSchedule } from '@/hooks/useCertificates';
export default function CertificateTable({ onOpen }:{ onOpen:(id:string)=>void }){
  const { items, remove } = useCertificates();
  return (<div className="glass" style={{padding:'1rem',borderRadius:12}}>
    <h3 style={{marginBottom:8}}>Certificates</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-200">
          <tr><th className="p-2 border">Title</th><th className="p-2 border">Curr</th><th className="p-2 border">Principal</th><th className="p-2 border">APR%</th><th className="p-2 border">Start</th><th className="p-2 border">End</th><th className="p-2 border">Next</th><th className="p-2 border">Actions</th></tr>
        </thead>
        <tbody>
          {items.map(c=>{
            const sch=buildSchedule(c).filter(s=>s.status!=='past'); const next=sch[0];
            return (<tr key={c.id} className="border-t">
              <td className="p-2 border">{c.title}</td>
              <td className="p-2 border">{c.currency}</td>
              <td className="p-2 border">{c.principal.toLocaleString()}</td>
              <td className="p-2 border">{c.rateAPR}</td>
              <td className="p-2 border">{c.startDate}</td>
              <td className="p-2 border">{c.endDate}</td>
              <td className="p-2 border">{next?`${next.date} • ${next.expectedAmount.toFixed(2)}`:'—'}</td>
              <td className="p-2 border"><button className="btn btn-outline" onClick={()=>onOpen(c.id)}>Open</button> <button className="btn" onClick={()=>remove(c.id)}>Delete</button></td>
            </tr>);
          })}
          {items.length===0 && <tr><td colSpan={8} className="text-center text-gray-400 p-3">No certificates yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>);
}

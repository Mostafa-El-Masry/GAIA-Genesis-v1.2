'use client';
import React, { useState } from 'react';
import CertificateForm from '@/components/wealth/CertificateForm';
import CertificateTable from '@/components/wealth/CertificateTable';
import CertificateDetail from '@/components/wealth/CertificateDetail';
export default function CertificatesPage(){
  const [openId, setOpenId] = useState<string | null>(null);
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold text-center mb-2">💳 Certificates</h2>
    <CertificateForm />
    <CertificateTable onOpen={id=>setOpenId(id)} />
    <CertificateDetail id={openId} onClose={()=>setOpenId(null)} />
  </main>);
}

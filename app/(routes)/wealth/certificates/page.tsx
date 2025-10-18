'use client';
import React, { useState } from 'react';
import CertificateForm from './CertificateForm';
import CertificateTable from './CertificateTable';
import CertificateDetail from './CertificateDetail';
export default function CertificatesPage(){
  const [openId, setOpenId] = useState<string | null>(null);
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold text-center mb-2">💳 Certificates</h2>
    <CertificateForm />
    <CertificateTable onOpen={id=>setOpenId(id)} />
    <CertificateDetail id={openId} onClose={()=>setOpenId(null)} />
  </main>);
}

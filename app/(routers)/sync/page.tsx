'use client';
import React from 'react';
import BackupPanel from '@/components/shared/BackupPanel';
export default function SyncPage(){
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">🔄 Sync</h2>
    <BackupPanel />
  </main>);
}

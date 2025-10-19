'use client';
import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
export default function AF1Showcase(){
  const { theme, toggleTheme } = useTheme();
  return (<main style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1>AF1 Glacium Theme Showcase</h1>
      <button onClick={toggleTheme} className="btn btn-outline">Toggle Theme ({theme})</button>
    </header>
    <section className="glass" style={{padding:'1rem',borderRadius:12}}>
      <h3>Buttons</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap:'wrap' }}>
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-outline">Outline</button>
      </div>
    </section>
  </main>);
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { ROUTES } from '@/lib/routes';
import { useTheme } from '@/providers/ThemeProvider';

export default function TopNav(){
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <Link href="/dashboard" className="nav-logo">GAIA</Link>
      </div>
      <div className="nav-center">
        {ROUTES.map(r => {
          const active = pathname === r.path || (r.path !== '/dashboard' && (pathname?.startsWith(r.path)));
          return <Link key={r.path} href={r.path} className={"nav-link"+(active?' active':'')}>{r.label}</Link>;
        })}
      </div>
      <div className="nav-right">
        <button className="nav-btn" onClick={toggleTheme} title="Toggle theme">{theme === 'light' ? '🌞' : '🌙'}</button>
      </div>
    </nav>
  );
}

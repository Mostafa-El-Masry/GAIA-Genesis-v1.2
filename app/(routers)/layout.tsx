import React from 'react';
import TopNav from '@/components/nav/TopNav';
import { ThemeProvider } from '@/providers/ThemeProvider';
import '@/globals.css';
import '@/glacium.css';

export default function RoutersLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="page-with-nav">
        <ThemeProvider>
          <TopNav />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

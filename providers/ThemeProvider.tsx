'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
type Theme = 'light'|'dark';
interface Ctx { theme: Theme; toggleTheme:()=>void }
const C = createContext<Ctx|undefined>(undefined);
export const ThemeProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [theme,setTheme] = useState<Theme>('light');
  useEffect(()=>{
    try{
      const stored = localStorage.getItem('theme') as Theme|null;
      const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
      setTheme(initial); document.documentElement.setAttribute('data-theme', initial);
    }catch{}
  },[]);
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark':'light';
    setTheme(next);
    try{ localStorage.setItem('theme', next); }catch{}
    document.documentElement.setAttribute('data-theme', next);
  };
  return <C.Provider value={{theme,toggleTheme}}>{children}</C.Provider>;
};
export const useTheme = ()=>{
  const v = useContext(C); if(!v) throw new Error('useTheme must be used inside ThemeProvider'); return v;
};

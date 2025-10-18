'use client';
export function load<T>(key: string, fallback: T, migrate?: (x:any) => T): T {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback;
    const parsed = JSON.parse(raw); return migrate ? migrate(parsed) : parsed as T;
  } catch { return fallback; }
}
export function save<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

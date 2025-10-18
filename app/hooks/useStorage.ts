"use client";

export type MergeStrategy = "replace" | "mergeById" | "appendNew";

type WithVersion<T> = T & { __v?: number; __updatedAt?: string };

export function load<T>(key: string, fallback: T, migrate?: (x: any) => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as WithVersion<T>;
    return migrate ? migrate(parsed) : (parsed as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, data: T, v = 3) {
  if (Array.isArray(data)) {
    localStorage.setItem(key, JSON.stringify(data));
    return;
  }
  const wrapper: WithVersion<T> = {
    ...(data as any),
    __v: v,
    __updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(wrapper));
}

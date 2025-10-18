"use client";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "./useStorage";

export type VideoMeta = {
  src: string;
  title?: string;
  stars: string[];
  genre?: string;
  year?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type VideoRecord = { src: string; title?: string };

const META_KEY = "video_meta";

function migrateMeta(x: any): VideoMeta[] {
  const arr = Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];
  return arr.map((it: any) => ({
    src: it.src,
    title: it.title,
    stars: Array.isArray(it.stars) ? it.stars : [],
    genre: typeof it.genre === "string" ? it.genre : undefined,
    year: typeof it.year === "number" ? it.year : (typeof it.year === "string" ? Number(it.year) || undefined : undefined),
    tags: Array.isArray(it.tags) ? it.tags : [],
    createdAt: it.createdAt,
    updatedAt: it.updatedAt,
  }));
}

export function useVideoMeta(sourceVideos: VideoRecord[]) {
  const [meta, setMeta] = useState<VideoMeta[]>([]);

  useEffect(() => {
    const initial = load<VideoMeta[] | { items: VideoMeta[] }>(META_KEY, [], migrateMeta);
    setMeta(migrateMeta(initial));
  }, []);

  // ensure every video has a meta record
  useEffect(() => {
    if (!sourceVideos?.length) return;
    setMeta((prev) => {
      const map = new Map(prev.map((m) => [m.src, m]));
      let changed = false;
      for (const v of sourceVideos) {
        if (!map.has(v.src)) {
          map.set(v.src, {
            src: v.src,
            title: v.title,
            stars: [],
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          changed = true;
        } else {
          const cur = map.get(v.src)!;
          if (!cur.title && v.title) {
            map.set(v.src, { ...cur, title: v.title });
            changed = true;
          }
        }
      }
      const next = Array.from(map.values());
      if (changed) save(META_KEY, next);
      return next;
    });
  }, [sourceVideos]);

  // persist on change
  useEffect(() => {
    save(META_KEY, meta);
  }, [meta]);

  const addStars = (srcs: string[], stars: string[]) =>
    setMeta((prev) =>
      prev.map((m) =>
        srcs.includes(m.src)
          ? {
              ...m,
              stars: Array.from(new Set([...(m.stars ?? []), ...stars.map((s) => s.trim()).filter(Boolean)])),
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );

  const setGenre = (srcs: string[], genre: string | undefined) =>
    setMeta((prev) =>
      prev.map((m) => (srcs.includes(m.src) ? { ...m, genre: genre || undefined, updatedAt: new Date().toISOString() } : m))
    );

  const setYear = (srcs: string[], year: number | undefined) =>
    setMeta((prev) =>
      prev.map((m) => (srcs.includes(m.src) ? { ...m, year, updatedAt: new Date().toISOString() } : m))
    );

  const removeStar = (srcs: string[], star: string) =>
    setMeta((prev) =>
      prev.map((m) =>
        srcs.includes(m.src) ? { ...m, stars: (m.stars ?? []).filter((s) => s !== star), updatedAt: new Date().toISOString() } : m
      )
    );

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    for (const m of meta) if (m.genre) set.add(m.genre);
    return Array.from(set).sort();
  }, [meta]);

  const allStars = useMemo(() => {
    const set = new Set<string>();
    for (const m of meta) for (const s of m.stars ?? []) set.add(s);
    return Array.from(set).sort();
  }, [meta]);

  return { meta, setMeta, addStars, setGenre, setYear, removeStar, allGenres, allStars };
}

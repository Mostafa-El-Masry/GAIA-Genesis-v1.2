"use client";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "./useStorage";

export type Category =
  | "Unsorted"
  | "Personal"
  | "Family"
  | "Work"
  | "Travel"
  | "Art"
  | "Private";

export type ImageMeta = {
  src: string;
  title?: string;
  category: Category;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ImageRecord = {
  src: string;
  title?: string;
};

const META_KEY = "gallery_meta";

function migrateMeta(x: any): ImageMeta[] {
  const arr = Array.isArray(x) ? x : Array.isArray(x?.items) ? x.items : [];
  return arr.map((it: any) => ({
    src: it.src,
    title: it.title,
    category: (it.category as Category) ?? "Unsorted",
    tags: Array.isArray(it.tags) ? it.tags : [],
    createdAt: it.createdAt,
    updatedAt: it.updatedAt,
  }));
}

export function useGalleryMeta(sourceImages: ImageRecord[]) {
  const [meta, setMeta] = useState<ImageMeta[]>([]);

  useEffect(() => {
    const initial = load<ImageMeta[] | { items: ImageMeta[] }>(META_KEY, [], migrateMeta);
    setMeta(migrateMeta(initial));
  }, []);

  useEffect(() => {
    if (!sourceImages?.length) return;
    setMeta((prev) => {
      const map = new Map(prev.map((m) => [m.src, m]));
      let changed = false;
      for (const img of sourceImages) {
        if (!map.has(img.src)) {
          map.set(img.src, {
            src: img.src,
            title: img.title,
            category: "Unsorted",
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          changed = true;
        } else {
          const cur = map.get(img.src)!;
          if (!cur.title && img.title) {
            map.set(img.src, { ...cur, title: img.title });
            changed = true;
          }
        }
      }
      const next = Array.from(map.values());
      if (changed) save(META_KEY, next);
      return next;
    });
  }, [sourceImages]);

  useEffect(() => {
    save(META_KEY, meta);
  }, [meta]);

  const setCategory = (srcs: string[], category: Category) =>
    setMeta((prev) =>
      prev.map((m) =>
        srcs.includes(m.src) ? { ...m, category, updatedAt: new Date().toISOString() } : m
      )
    );

  const addTags = (srcs: string[], tags: string[]) =>
    setMeta((prev) =>
      prev.map((m) =>
        srcs.includes(m.src)
          ? {
              ...m,
              tags: Array.from(
                new Set([...(m.tags ?? []), ...tags.map((t) => t.trim()).filter(Boolean)])
              ),
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );

  const removeTag = (srcs: string[], tag: string) =>
    setMeta((prev) =>
      prev.map((m) =>
        srcs.includes(m.src)
          ? {
              ...m,
              tags: (m.tags ?? []).filter((t) => t !== tag),
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );

  const categories: Category[] = useMemo(
    () => ["Unsorted", "Personal", "Family", "Work", "Travel", "Art", "Private"],
    []
  );

  return { meta, setMeta, categories, setCategory, addTags, removeTag };
}

"use client";
import React, { useMemo, useState } from "react";
import "../styles/gallery.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useMediaManifest } from "../hooks/useMediaManifest";
import ImageGallery from "../components/gallery/ImageGallery";
import { useGalleryMeta, Category } from "../hooks/useGalleryMeta";
import TagPicker from "../components/TagPicker";
import VideoGallery from "./components/VideoGallery";

export default function GalleryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const type = (params.get("type") === "VideoGallery" ? "VideoGallery" : "ImageGallery") as
    | "ImageGallery"
    | "VideoGallery";
  const { images, videos } = useMediaManifest();

  const { meta, categories, setCategory, addTags } = useGalleryMeta(
    images.map((i) => ({ src: i.src, title: i.title }))
  );

  const [category, setCat] = useState<Category>("Unsorted");
  const [tagQuery, setTagQuery] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTags, setBulkTags] = useState<string[]>([]);

  const setType = (next: "ImageGallery" | "VideoGallery") => {
    const qs = new URLSearchParams(params.toString());
    qs.set("type", next);
    router.push(`/gallery?${qs.toString()}`);
  };

  const imageItems = useMemo(() => {
    const map = new Map(meta.map((m) => [m.src, m]));
    return images.map((img) => {
      const m = map.get(img.src);
      return {
        ...img,
        category: m?.category ?? "Unsorted",
        tags: m?.tags ?? [],
      };
    });
  }, [images, meta]);

  const filteredImages = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    return imageItems.filter((it) => {
      const matchCat = category === "Unsorted" ? true : it.category === category;
      const matchTag =
        !q ||
        (it.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (it.title ?? "").toLowerCase().includes(q);
      return matchCat && matchTag;
    });
  }, [imageItems, category, tagQuery]);

  const toggleSelect = (src: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(src) ? next.delete(src) : next.add(src);
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const applyBulk = () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (bulkTags.length) addTags(ids, bulkTags);
    if (category !== "Unsorted") setCategory(ids, category);
    clearSelection();
    setBulkTags([]);
  };

  return (
    <main className="gallery-container">
      <header className="gallery-toolbar">
        <div className="tab">
          <button className={type === "ImageGallery" ? "active" : ""} onClick={() => setType("ImageGallery")}>
            Images
          </button>
          <button className={type === "VideoGallery" ? "active" : ""} onClick={() => setType("VideoGallery")}>
            Videos
          </button>
        </div>

        {type === "ImageGallery" && (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="input"
              value={category}
              onChange={(e) => setCat(e.target.value as Category)}
              style={{ maxWidth: 220 }}
            >
              <option value="Unsorted">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Search by tag/title…"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              style={{ minWidth: 220 }}
            />

            {selected.size > 0 && (
              <div className="glass" style={{ padding: ".5rem 1rem", borderRadius: 12 }}>
                <strong>{selected.size}</strong> selected
                <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={clearSelection}>
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {type === "ImageGallery" ? (
        <>
          {selected.size > 0 && (
            <section className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
              <h4 style={{ marginBottom: ".5rem" }}>Bulk tag / recategorize</h4>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", maxWidth: 720 }}>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Category</label>
                  <select className="input" value={category} onChange={(e) => setCat(e.target.value as Category)}>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Tags</label>
                  <TagPicker value={bulkTags} onChange={setBulkTags} />
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button className="btn btn-primary" onClick={applyBulk}>
                    Apply to selected
                  </button>
                  <button className="btn btn-outline" onClick={clearSelection}>
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          )}

          <ImageGallery
            items={filteredImages}
            enableSelection
            onToggleSelect={toggleSelect}
            isSelected={(src) => selected.has(src)}
          />
        </>
      ) : (
        <VideoGallery items={videos} />
      )}
    </main>
  );
}

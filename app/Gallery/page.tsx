"use client";
import React, { useMemo, useState } from "react";
import "../styles/gallery.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useMediaManifest } from "../hooks/useMediaManifest";
import ImageGallery from '@/components/gallery/ImageGallery';

import { useGalleryMeta, Category } from "../hooks/useGalleryMeta";
import { useVideoMeta } from "../hooks/useVideoMeta";
import TagPicker from "../components/TagPicker";
import StarPicker from "../components/StarPicker";
import VideoGallery from '@/components/gallery/VideoGallery';

export default function GalleryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const type = (params.get("type") === "VideoGallery" ? "VideoGallery" : "ImageGallery") as
    | "ImageGallery"
    | "VideoGallery";
  const { images, videos } = useMediaManifest();

  // Images meta overlay
  const { meta: imgMeta, categories, setCategory, addTags } = useGalleryMeta(
    images.map((i) => ({ src: i.src, title: i.title }))
  );

  // Videos meta overlay
  const { meta: vidMeta, addStars, setGenre, setYear, allGenres, allStars } = useVideoMeta(
    videos.map((v) => ({ src: v.src, title: v.title }))
  );

  // --- Images state ---
  const [category, setCat] = useState<Category>("Unsorted");
  const [tagQuery, setTagQuery] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [bulkTags, setBulkTags] = useState<string[]>([]);

  // --- Videos state ---
  const [starQuery, setStarQuery] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [bulkStars, setBulkStars] = useState<string[]>([]);
  const [bulkGenre, setBulkGenre] = useState<string>("");
  const [bulkYear, setBulkYear] = useState<string>("");

  const setType = (next: "ImageGallery" | "VideoGallery") => {
    const qs = new URLSearchParams(params.toString());
    qs.set("type", next);
    router.push(`/gallery?${qs.toString()}`);
  };

  // Compose images with meta
  const imageItems = useMemo(() => {
    const map = new Map(imgMeta.map((m) => [m.src, m]));
    return images.map((img) => {
      const m = map.get(img.src);
      return { ...img, category: m?.category ?? "Unsorted", tags: m?.tags ?? [] };
    });
  }, [images, imgMeta]);

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

  // Compose videos with meta
  const videoItems = useMemo(() => {
    const map = new Map(vidMeta.map((m) => [m.src, m]));
    return videos.map((v) => {
      const m = map.get(v.src);
      return {
        ...v,
        stars: m?.stars ?? [],
        genre: m?.genre,
        year: m?.year,
      };
    });
  }, [videos, vidMeta]);

  const filteredVideos = useMemo(() => {
    const sq = starQuery.trim().toLowerCase();
    const yf = yearFilter.trim();
    return videoItems.filter((it) => {
      const matchStar = !sq || (it.stars ?? []).some((s) => s.toLowerCase().includes(sq));
      const matchGenre = !genreFilter || it.genre === genreFilter;
      const matchYear = !yf || String(it.year || "").startsWith(yf);
      return matchStar && matchGenre && matchYear;
    });
  }, [videoItems, starQuery, genreFilter, yearFilter]);

  // Selection toggles
  const toggleSelectImage = (src: string) =>
    setSelectedImages((prev) => {
      const next = new Set(prev);
      next.has(src) ? next.delete(src) : next.add(src);
      return next;
    });
  const toggleSelectVideo = (src: string) =>
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      next.has(src) ? next.delete(src) : next.add(src);
      return next;
    });

  // Bulk apply
  const applyBulkImages = () => {
    const ids = Array.from(selectedImages);
    if (!ids.length) return;
    if (bulkTags.length) addTags(ids, bulkTags);
    if (category !== "Unsorted") setCategory(ids, category);
    setSelectedImages(new Set());
    setBulkTags([]);
  };

  const applyBulkVideos = () => {
    const ids = Array.from(selectedVideos);
    if (!ids.length) return;
    if (bulkStars.length) addStars(ids, bulkStars);
    if (bulkGenre.trim()) setGenre(ids, bulkGenre.trim());
    if (bulkYear.trim()) setYear(ids, Number(bulkYear) || undefined);
    setSelectedVideos(new Set());
    setBulkStars([]);
    setBulkGenre("");
    setBulkYear("");
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
            <select className="input" value={category} onChange={(e) => setCat(e.target.value as Category)} style={{ maxWidth: 220 }}>
              <option value="Unsorted">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input className="input" placeholder="Search by tag/title…" value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} style={{ minWidth: 220 }} />
            {selectedImages.size > 0 && (
              <div className="glass" style={{ padding: ".5rem 1rem", borderRadius: 12 }}>
                <strong>{selectedImages.size}</strong> selected
                <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={() => setSelectedImages(new Set())}>Clear</button>
              </div>
            )}
          </div>
        )}

        {type === "VideoGallery" && (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <input className="input" placeholder="Filter by star…" value={starQuery} onChange={(e) => setStarQuery(e.target.value)} style={{ minWidth: 180 }} />
            <select className="input" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="">All Genres</option>
              {allGenres.map((g) => (<option key={g} value={g}>{g}</option>))}
            </select>
            <input className="input" placeholder="Year (e.g. 2019)" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ width: 140 }} />
            {selectedVideos.size > 0 && (
              <div className="glass" style={{ padding: ".5rem 1rem", borderRadius: 12 }}>
                <strong>{selectedVideos.size}</strong> selected
                <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={() => setSelectedVideos(new Set())}>Clear</button>
              </div>
            )}
          </div>
        )}
      </header>

      {type === "ImageGallery" ? (
        <>
          {selectedImages.size > 0 && (
            <section className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
              <h4 style={{ marginBottom: ".5rem" }}>Bulk tag / recategorize</h4>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", maxWidth: 720 }}>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Category</label>
                  <select className="input" value={category} onChange={(e) => setCat(e.target.value as Category)}>
                    {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Tags</label>
                  <TagPicker value={bulkTags} onChange={setBulkTags} />
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button className="btn btn-primary" onClick={applyBulkImages}>Apply to selected</button>
                  <button className="btn btn-outline" onClick={() => setSelectedImages(new Set())}>Cancel</button>
                </div>
              </div>
            </section>
          )}

          <ImageGallery
            items={filteredImages}
            enableSelection
            onToggleSelect={toggleSelectImage}
            isSelected={(src) => selectedImages.has(src)}
          />
        </>
      ) : (
        <>
          {selectedVideos.size > 0 && (
            <section className="glass" style={{ padding: "1rem", borderRadius: 12 }}>
              <h4 style={{ marginBottom: ".5rem" }}>Bulk assign (videos)</h4>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", maxWidth: 720 }}>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Stars</label>
                  <StarPicker value={bulkStars} onChange={setBulkStars} suggestions={allStars} />
                </div>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Genre</label>
                  <input className="input" placeholder="e.g. Documentary" value={bulkGenre} onChange={(e) => setBulkGenre(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, opacity: 0.8 }}>Year</label>
                  <input className="input" placeholder="e.g. 2021" value={bulkYear} onChange={(e) => setBulkYear(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: ".5rem" }}>
                  <button className="btn btn-primary" onClick={applyBulkVideos}>Apply to selected</button>
                  <button className="btn btn-outline" onClick={() => setSelectedVideos(new Set())}>Cancel</button>
                </div>
              </div>
            </section>
          )}

          <VideoGallery  
            items={filteredVideos}
            enableSelection
            onToggleSelect={toggleSelectVideo}
            isSelected={(src) => selectedVideos.has(src)}
          />
        </>
      )}
    </main>
  );
}

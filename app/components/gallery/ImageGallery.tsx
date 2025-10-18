"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/gallery.css";

type View = "slideshow" | "grid";

export type ImageGalleryItem = {
  src: string;
  title?: string;
  category?: string;
  tags?: string[];
};

export default function ImageGallery({
  items,
  enableSelection = false,
  onToggleSelect,
  isSelected,
}: {
  items: ImageGalleryItem[];
  enableSelection?: boolean;
  onToggleSelect?: (src: string) => void;
  isSelected?: (src: string) => boolean;
}) {
  const [view, setView] = useState<View>("slideshow");
  const [index, setIndex] = useState(0);

  const count = items.length;
  const current = items[index]?.src;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const first = useCallback(() => setIndex(0), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (view !== "slideshow") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key.toLowerCase() === "home") first();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, first, view]);

  useEffect(() => {
    if (view !== "slideshow") return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [view, next]);

  const grid = useMemo(
    () => (
      <div className="gallery-grid">
        {items.map((img, i) => (
          <div
            className="gallery-card"
            key={img.src + i}
            onClick={() => setIndex(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIndex(i);
            }}
          >
            {enableSelection && (
              <label
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(0,0,0,0.4)",
                  padding: "2px 6px",
                  borderRadius: 8,
                  color: "#fff",
                  userSelect: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected?.(img.src) ?? false}
                  onChange={() => onToggleSelect?.(img.src)}
                />
                <span style={{ fontSize: 12 }}>Select</span>
              </label>
            )}

            {img.src ? (
              <img src={img.src} alt={img.title || `Image ${i + 1}`} />
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span>Missing file</span>
              </div>
            )}

            <div className="label" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong>{img.title || `Image ${i + 1}`}</strong>
                {img.category && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.45)",
                    }}
                  >
                    {img.category}
                  </span>
                )}
              </div>
              {img.tags && img.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {img.tags.slice(0, 4).map((t) => (
                    <span key={t} style={{ fontSize: 11, background: "rgba(0,0,0,0.35)", padding: "2px 6px", borderRadius: 6 }}>
                      #{t}
                    </span>
                  ))}
                  {img.tags.length > 4 && (
                    <span style={{ fontSize: 11, opacity: 0.85 }}>+{img.tags.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
    [items, enableSelection, isSelected, onToggleSelect]
  );

  return (
    <section className="gallery-container">
      <div className="gallery-toolbar">
        <div className="view-toggle">
          <button className={view === "slideshow" ? "active" : ""} onClick={() => setView("slideshow")}>
            Slideshow
          </button>
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>
            Grid (5 cols)
          </button>
        </div>
      </div>
      {view === "slideshow" ? (
        <div className="slideshow">
          <div className="slideshow-view glass">
            {current ? (
              <img src={current} alt={items[index]?.title || `Slide ${index + 1}`} />
            ) : (
              <div style={{ padding: "2rem" }}>No image</div>
            )}
          </div>
          <div className="slideshow-controls">
            <button onClick={first}>First</button>
            <button onClick={prev}>Prev</button>
            <button onClick={next}>Next</button>
            <span style={{ marginLeft: "auto" }}>
              {Math.min(index + 1, count)} / {count}
            </span>
          </div>
        </div>
      ) : (
        grid
      )}
    </section>
  );
}

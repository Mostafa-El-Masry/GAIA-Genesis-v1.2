"use client";
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/gallery.css";
import { useHoverPreview } from "../../hooks/useHoverPreview";

type VideoItemX = {
  src: string;
  title?: string;
  poster?: string;
  preview?: { count?: number; pattern?: string };
  stars?: string[];
  genre?: string;
  year?: number;
};

export default function VideoGallery({
  items,
  enableSelection = false,
  onToggleSelect,
  isSelected,
}: {
  items: VideoItemX[];
  enableSelection?: boolean;
  onToggleSelect?: (src: string) => void;
  isSelected?: (src: string) => boolean;
}) {
  const [current, setCurrent] = useState<VideoItemX | null>(items[0] || null);

  useEffect(() => {
    if (!current && items.length) setCurrent(items[0]);
  }, [items, current]);

  return (
    <section className="gallery-container">
      <div className="video-player glass">
        {current ? (
          <video key={current.src} src={current.src} poster={current.poster} controls preload="metadata" />
        ) : (
          <div style={{ padding: "2rem" }}>No video selected</div>
        )}
      </div>

      <div className="gallery-grid">
        {items.map((v, i) => (
          <VideoCard key={v.src + i} item={v} onSelect={() => setCurrent(v)} enableSelection={enableSelection} onToggleSelect={onToggleSelect} isSelected={isSelected} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({
  item,
  onSelect,
  enableSelection = false,
  onToggleSelect,
  isSelected,
}: {
  item: VideoItemX;
  onSelect: () => void;
  enableSelection?: boolean;
  onToggleSelect?: (src: string) => void;
  isSelected?: (src: string) => boolean;
}) {
  const { frames, current, start, stop, hasFrames } = useHoverPreview({
    videoSrc: item.src,
    count: item.preview?.count,
    pattern: item.preview?.pattern,
    intervalMs: 140,
    maxProbe: 12,
  });

  const selected = isSelected?.(item.src) ?? false;

  return (
    <div
      className="gallery-card"
      onMouseEnter={start}
      onMouseLeave={stop}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
    >
      {/* selection checkbox (overlay) */}
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
            checked={selected}
            onChange={() => onToggleSelect?.(item.src)}
          />
          <span style={{ fontSize: 12 }}>Select</span>
        </label>
      )}

      {/* Poster or live preview */}
      {(!hasFrames && item.poster) ? (
        <img src={item.poster} alt={item.title || "Poster"} />
      ) : hasFrames && current ? (
        <div className="preview-overlay" style={{ display: "block" }}>
          <img src={current} alt={item.title || "Preview"} />
        </div>
      ) : (
        <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span>Loading preview…</span>
        </div>
      )}

      {/* label */}
      <div className="label" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <strong>{item.title || item.src.split("/").pop()}</strong>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {item.genre && (
            <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, background: "rgba(0,0,0,0.45)" }}>
              {item.genre}
            </span>
          )}
          {typeof item.year === "number" && (
            <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, background: "rgba(0,0,0,0.45)" }}>
              {item.year}
            </span>
          )}
        </div>
        {item.stars && item.stars.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {item.stars.slice(0, 4).map((s) => (
              <span key={s} style={{ fontSize: 11, background: "rgba(0,0,0,0.35)", padding: "2px 6px", borderRadius: 6 }}>
                ★ {s}
              </span>
            ))}
            {item.stars.length > 4 && (
              <span style={{ fontSize: 11, opacity: 0.85 }}>+{item.stars.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

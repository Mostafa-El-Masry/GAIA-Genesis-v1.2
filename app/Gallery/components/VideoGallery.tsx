"use client";
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/gallery.css";
import { VideoItem } from "../../hooks/useMediaManifest";
import { useHoverPreview } from "../../hooks/useHoverPreview";

type VideoWithViews = VideoItem & { views: number };

const STORAGE_KEY = "video:viewCounts";
const FILTER_KEY = "video:activeFilter";

function loadViewCounts(): Record<string, number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

function saveViewCounts(counts: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  } catch (e) {}
}

function incrementViews(videoSrc: string) {
  const counts = loadViewCounts();
  counts[videoSrc] = (counts[videoSrc] || 0) + 1;
  saveViewCounts(counts);
  return counts[videoSrc];
}

export default function VideoGallery({ items }: { items: VideoItem[] }) {
  const [current, setCurrent] = useState<VideoItem | null>(items[0] || null);
  const [selectedStar, setSelectedStar] = useState<string>("");
  const [showMostViewed, setShowMostViewed] = useState(false);
  const [viewCounts, setViewCounts] =
    useState<Record<string, number>>(loadViewCounts);

  // Load saved filters
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY);
      if (saved) {
        const filters = JSON.parse(saved);
        setSelectedStar(filters.star || "");
        setShowMostViewed(!!filters.mostViewed);
      }
    } catch (e) {}
  }, []);

  // Save filters
  useEffect(() => {
    try {
      localStorage.setItem(
        FILTER_KEY,
        JSON.stringify({
          star: selectedStar,
          mostViewed: showMostViewed,
        })
      );
    } catch (e) {}
  }, [selectedStar, showMostViewed]);

  // Extract unique names/stars from video titles
  const stars = useMemo(() => {
    const names = new Set<string>();
    items.forEach((item) => {
      const name = item.title?.split(" - ")[0] || "";
      if (name) names.add(name);
    });
    return Array.from(names).sort();
  }, [items]);

  // Filter and sort videos
  const filteredItems = useMemo(() => {
    let filtered = items.map((item) => ({
      ...item,
      views: viewCounts[item.src] || 0,
    }));

    // Apply star filter if selected
    if (selectedStar) {
      filtered = filtered.filter((item) =>
        item.title?.toLowerCase().startsWith(selectedStar.toLowerCase())
      );
    }

    // Sort by views if most viewed is active
    if (showMostViewed) {
      filtered.sort((a, b) => b.views - a.views);
    }

    return filtered;
  }, [items, selectedStar, showMostViewed, viewCounts]);

  useEffect(() => {
    if (!current && filteredItems.length) setCurrent(filteredItems[0]);
  }, [filteredItems, current]);

  // Update current video when filters change
  useEffect(() => {
    if (filteredItems.length === 0) {
      setCurrent(null);
    } else if (!filteredItems.includes(current as VideoWithViews)) {
      setCurrent(filteredItems[0]);
    }
  }, [filteredItems, current]);

  // Track video views
  const onVideoSelect = (video: VideoItem) => {
    setCurrent(video);
    const newCount = incrementViews(video.src);
    setViewCounts((prev) => ({ ...prev, [video.src]: newCount }));
  };

  return (
    <section className="gallery-container">
      {/* Filter bar */}
      <div className="gallery-toolbar">
        <div className="filters-container">
          <div className="select-wrapper">
            <select
              value={selectedStar}
              onChange={(e) => setSelectedStar(e.target.value)}
              className="star-select"
              aria-label="Filter videos by star"
            >
              <option value="">Select Star</option>
              {stars.map((star) => (
                <option key={star} value={star}>
                  {star}
                </option>
              ))}
            </select>
            {selectedStar && (
              <button
                className="clear-filter"
                onClick={() => setSelectedStar("")}
                aria-label="Clear star filter"
              >
                ×
              </button>
            )}
          </div>

          <button
            className={"view-toggle-btn" + (showMostViewed ? " active" : "")}
            onClick={() => setShowMostViewed(!showMostViewed)}
          >
            Most Viewed
          </button>
        </div>
      </div>

      <div className="video-player glass">
        {current ? (
          <>
            <video
              key={current.src}
              src={current.src}
              poster={current.poster}
              controls
              preload="metadata"
            />
            <div className="video-info">
              <div className="video-title">{current.title}</div>
              <div className="video-views">
                {viewCounts[current.src] || 0} views
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "2rem" }}>No video selected</div>
        )}
      </div>

      <div className="gallery-grid">
        {filteredItems.map((v, i) => (
          <VideoCard
            key={v.src + i}
            item={v}
            views={v.views}
            onSelect={() => onVideoSelect(v)}
          />
        ))}
      </div>
    </section>
  );
}

function VideoCard({
  item,
  views,
  onSelect,
}: {
  item: VideoItem;
  views: number;
  onSelect: () => void;
}) {
  const { frames, current, start, stop, hasFrames } = useHoverPreview({
    videoSrc: item.src,
    count: item.preview?.count,
    pattern: item.preview?.pattern,
    intervalMs: 140,
    maxProbe: 12,
  });

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
      {/* Poster or first frame */}
      {!hasFrames && item.poster ? (
        <img src={item.poster} alt={item.title || "Poster"} />
      ) : hasFrames && current ? (
        <div className="preview-overlay" style={{ display: "block" }}>
          <img src={current} alt={item.title || "Preview"} />
        </div>
      ) : (
        <div
          style={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Loading preview…</span>
        </div>
      )}
      <div className="label">
        <div>{item.title || item.src.split("/").pop()}</div>
        <div className="views-count">{views} views</div>
      </div>
    </div>
  );
}

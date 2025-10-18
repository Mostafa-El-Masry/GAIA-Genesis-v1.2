"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/gallery.css";
import { ImageItem } from "../../hooks/useMediaManifest";

type View = "slideshow" | "grid";

type Props = {
  items: ImageItem[];
  enableSelection?: boolean;
  onToggleSelect?: (src: string) => void;
  isSelected?: (src: string) => boolean;
};

export default function ImageGallery({ items, enableSelection, onToggleSelect, isSelected }: Props) {
  const [view, setView] = useState<View>("slideshow");
  const [index, setIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // helpers
  const getExt = (src: string) => {
    const m = src?.toLowerCase().match(/\.([a-z0-9]+)(?:$|\?)/);
    return m ? m[1] : "";
  };

  // available filters based on the items (order preferred)
  const allExts = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(getExt(it.src));
    return s;
  }, [items]);

  const preferred = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
  const filters = useMemo(() => {
    const out: string[] = [];
    for (const p of preferred) if (allExts.has(p)) out.push(p);
    // add any other extensions discovered
    for (const e of Array.from(allExts).sort())
      if (!out.includes(e) && e) out.push(e);
    return out;
  }, [allExts]);

  // load saved filters and view from localStorage on mount
  useEffect(() => {
    try {
      // Load filters
      const savedFilters = localStorage.getItem("gallery:activeFilters");
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        if (Array.isArray(parsed)) {
          // Only restore valid filters that exist in current filters list
          const validFilters = parsed.filter((f) => filters.includes(f));
          if (validFilters.length > 0) {
            setActiveFilters(new Set(validFilters));
          }
        }
      }

      // Load view preference
      const savedView = localStorage.getItem("gallery:view") as View;
      if (savedView && (savedView === "grid" || savedView === "slideshow")) {
        setView(savedView);
      }
      // Load autoplay preference
      const savedPlay = localStorage.getItem("gallery:isPlaying");
      if (savedPlay !== null) setIsPlaying(savedPlay === "true");
    } catch (e) {
      console.error("Error loading gallery preferences:", e);
    }
  }, [filters]);

  // persist active filters and view
  useEffect(() => {
    try {
      // Save filters
      localStorage.setItem(
        "gallery:activeFilters",
        JSON.stringify(Array.from(activeFilters))
      );

      // Save view preference
      localStorage.setItem("gallery:view", view);
      // Save autoplay
      localStorage.setItem("gallery:isPlaying", String(isPlaying));
    } catch (e) {
      console.error("Error saving gallery preferences:", e);
    }
  }, [activeFilters, view, isPlaying]);

  // ordered and shuffled items (stable until items/filters change)
  const [orderedItems, setOrderedItems] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (!items || !items.length) {
      setOrderedItems([]);
      setIndex(0);
      return;
    }

    // apply filters
    const filtered =
      activeFilters.size === 0
        ? [...items]
        : items.filter((it) => activeFilters.has(getExt(it.src)));

    // shuffle once using Fisher-Yates
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    setOrderedItems(filtered);
    // reset index when the set changes so we start at the beginning of new order
    setIndex(0);
  }, [items, activeFilters]);

  // ensure index is valid when orderedItems changes
  useEffect(() => {
    if (index >= orderedItems.length) setIndex(0);
  }, [orderedItems.length]);

  // current slide src comes from orderedItems
  const count = orderedItems.length;
  const current = orderedItems[index]?.src;

  // safe navigation indices
  const firstIndex = count > 0 ? 0 : -1;
  const lastIndex = count > 0 ? count - 1 : -1;
  const prevIndex = count > 0 ? (index - 1 + count) % count : -1;
  const nextIndex = count > 0 ? (index + 1) % count : -1;

  const next = useCallback(() => {
    if (count === 0) return;
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count === 0) return;
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const first = useCallback(() => setIndex(0), []);
  const last = useCallback(() => setIndex(count > 0 ? count - 1 : 0), [count]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (view !== "slideshow") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Home") first();
      if (e.key === "End") last();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, first, last, view]);

  // Auto-advance every 5s in slideshow
  useEffect(() => {
    if (view !== "slideshow" || count === 0 || !isPlaying) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [view, next, count, isPlaying]);

  const grid = useMemo(
    () => (
      <div className="gallery-grid">
        {orderedItems.map((img: ImageItem, i: number) => (
          <div
            className="gallery-card"
            key={img.src + i}
            onClick={() => {
              if (enableSelection && onToggleSelect) {
                onToggleSelect(img.src);
                return;
              }
              setIndex(i);
              setView("slideshow");
            }}
          >
            <img
              src={encodeURI(img.src)}
              alt={img.title || `Image ${i + 1}`}
              loading="lazy"
            />
            <div className="label">{img.title || `Image ${i + 1}`}</div>
            {enableSelection && isSelected && (
              <div className={"select-overlay" + (isSelected(img.src) ? " selected" : "")}
                onClick={(e) => { e.stopPropagation(); onToggleSelect?.(img.src); }}
                role="button"
                aria-pressed={isSelected(img.src)}
                title={isSelected(img.src) ? "Deselect" : "Select"}
              >
                {isSelected(img.src) ? "✓" : "+"}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    [orderedItems]
  );

  return (
    <section className="gallery-container">
      <div className="gallery-toolbar">
        {/* centered filter bar */}
        <div className="filter-bar">
          {filters.map((f) => (
            <button
              key={f}
              className={"filter-btn" + (activeFilters.has(f) ? " active" : "")}
              onClick={() => {
                setActiveFilters((prev) => {
                  const newFilters = new Set(prev);
                  if (newFilters.has(f)) {
                    newFilters.delete(f);
                  } else {
                    newFilters.add(f);
                  }
                  return newFilters;
                });
                setIndex(0);
              }}
              title={`Toggle ${f.toUpperCase()} files`}
            >
              {f === "all" ? "All" : f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button
            className={view === "slideshow" ? "active" : ""}
            onClick={() => setView("slideshow")}
          >
            Slideshow
          </button>
          <button
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
          >
            Grid (5 cols)
          </button>
        </div>
      </div>

      {view === "slideshow" ? (
        <div className="slideshow">
          <div className="slideshow-view glass">
            {current ? (
              <img
                src={encodeURI(current)}
                alt={orderedItems[index]?.title || `Slide ${index + 1}`}
              />
            ) : (
              <div style={{ padding: 24, textAlign: "center" }}>
                No images match the selected filters
              </div>
            )}

            {/* Left controls: First, Prev (thumbnail previews) */}
            <div className="slideshow-nav left" aria-hidden={false}>
              <button
                className="nav-btn first"
                onClick={first}
                aria-label="First image"
                title="First"
              >
                {/* show small thumb of the first item if available */}
                {firstIndex >= 0 ? (
                  <img
                    src={encodeURI(orderedItems[firstIndex].src)}
                    alt={orderedItems[firstIndex].title || "First image"}
                    className="nav-thumb"
                  />
                ) : (
                  "⏮"
                )}
              </button>

              <button
                className="nav-btn prev"
                onClick={prev}
                aria-label="Previous image"
                title="Previous"
              >
                {/* show small thumb of the previous item if available */}
                {prevIndex >= 0 ? (
                  <img
                    src={encodeURI(orderedItems[prevIndex].src)}
                    alt={orderedItems[prevIndex].title || "Previous image"}
                    className="nav-thumb"
                  />
                ) : (
                  "◀"
                )}
              </button>
            </div>

            {/* Right controls: Next, Last (thumbnail previews) */}
            <div className="slideshow-nav right" aria-hidden={false}>
              <button
                className="nav-btn next"
                onClick={next}
                aria-label="Next image"
                title="Next"
              >
                {nextIndex >= 0 ? (
                  <img
                    src={encodeURI(orderedItems[nextIndex].src)}
                    alt={orderedItems[nextIndex].title || "Next"}
                    className="nav-thumb"
                  />
                ) : (
                  "▶"
                )}
              </button>

              <button
                className="nav-btn last"
                onClick={last}
                aria-label="Last image"
                title="Last"
              >
                {lastIndex >= 0 ? (
                  <img
                    src={encodeURI(orderedItems[lastIndex].src)}
                    alt={orderedItems[lastIndex].title || "Last image"}
                    className="nav-thumb"
                  />
                ) : (
                  "⏭"
                )}
              </button>
            </div>

            {/* center caption / index */}
            <div className="slideshow-controls-center">
              <button
                className={"autoplay-btn" + (isPlaying ? " playing" : "")}
                onClick={() => setIsPlaying((p) => !p)}
                aria-pressed={isPlaying}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <div className="slideshow-index">
                {index + 1} / {count}
              </div>
            </div>
          </div>

          {/* Thumbnails strip - show all thumbnails and allow clicking to jump to that slide */}
          <div className="thumbnails-strip">
            {orderedItems.map((it: ImageItem, i: number) => (
              <button
                key={it.src + i}
                className={"thumb" + (i === index ? " active" : "")}
                onClick={() => {
                  if (enableSelection && onToggleSelect) {
                    onToggleSelect(it.src);
                  } else {
                    setIndex(i);
                  }
                }}
                title={it.title || `Image ${i + 1}`}
              >
                <img
                  src={encodeURI(it.src)}
                  alt={it.title || `Image ${i + 1}`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        grid
      )}
    </section>
  );
}

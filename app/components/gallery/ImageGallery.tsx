"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  showThumbStrip = true,
  thumbSize = 96,
  masonryColumnWidth = 240,
  masonryGap = 12,
}: {
  items: ImageGalleryItem[];
  enableSelection?: boolean;
  onToggleSelect?: (src: string) => void;
  isSelected?: (src: string) => boolean;
  showThumbStrip?: boolean;
  thumbSize?: number;
  masonryColumnWidth?: number;
  masonryGap?: number;
}) {
  const [view, setView] = useState<View>("slideshow");
  const [index, setIndex] = useState(0);

  const count = items?.length || 0;
  const current = count > 0 ? items[index % count] : null;

  const next = useCallback(
    () => setIndex((i) => (count === 0 ? 0 : (i + 1) % count)),
    [count]
  );
  const prev = useCallback(
    () => setIndex((i) => (count === 0 ? 0 : (i - 1 + count) % count)),
    [count]
  );
  const first = useCallback(() => setIndex(0), []);
  const last = useCallback(() => setIndex(Math.max(0, count - 1)), [count]);

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
  }, [view, next, prev, first, last]);

  const grid = useMemo(
    () => (
      <div style={{ columnWidth: masonryColumnWidth, columnGap: masonryGap }}>
        {items.map((img, i) => {
          const cardStyleBase = {
            breakInside: "avoid",
            pageBreakInside: "avoid",
            marginBottom: masonryGap,
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 12,
            overflow: "hidden",
            background: "transparent",
            position: "relative",
            cursor: "pointer",
          } as any;
          cardStyleBase["WebkitColumnBreakInside" as any] = "avoid";
          const cardStyle: React.CSSProperties =
            cardStyleBase as React.CSSProperties;
          return (
            <div
              key={img.src + i}
              style={cardStyle}
              onClick={() => setIndex(i)}
            >
              {enableSelection && (
                <label
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 2,
                    background: "rgba(0,0,0,.45)",
                    padding: "2px 6px",
                    borderRadius: 8,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={!!isSelected?.(img.src)}
                    onChange={() => onToggleSelect?.(img.src)}
                  />{" "}
                  select
                </label>
              )}
              <img
                src={img.src}
                alt={img.title || ""}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              {(img.title || img.tags?.length) && (
                <div style={{ padding: "6px 8px" }}>
                  <small>{img.title}</small>
                  {!!img.tags?.length && (
                    <div style={{ opacity: 0.8, fontSize: 11, marginTop: 2 }}>
                      {(img.tags || []).slice(0, 4).join(" • ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ),
    [
      items,
      enableSelection,
      isSelected,
      onToggleSelect,
      masonryColumnWidth,
      masonryGap,
    ]
  );

  const stripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!showThumbStrip || !stripRef.current) return;
    const el = stripRef.current;
    const child = el.querySelector(
      `[data-idx="${index}"]`
    ) as HTMLElement | null;
    if (child) {
      const pad = 16;
      const cLeft = child.offsetLeft;
      if (cLeft < el.scrollLeft + pad)
        el.scrollTo({ left: Math.max(0, cLeft - pad), behavior: "smooth" });
      else if (cLeft + child.offsetWidth > el.scrollLeft + el.clientWidth - pad)
        el.scrollTo({
          left: cLeft - el.clientWidth + child.offsetWidth + pad,
          behavior: "smooth",
        });
    }
  }, [index, showThumbStrip]);

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className={view === "slideshow" ? "btn btn-primary" : "btn"}
          onClick={() => setView("slideshow")}
        >
          Slideshow
        </button>
        <button
          className={view === "grid" ? "btn btn-primary" : "btn"}
          onClick={() => setView("grid")}
        >
          Grid
        </button>
      </div>

      {view === "slideshow" ? (
        <div style={{ position: "relative", display: "grid", gap: 10 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "65vh",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 12,
            }}
          >
            {current?.src ? (
              <img
                src={current.src}
                alt={current.title || ""}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ opacity: 0.6 }}>No image</div>
            )}

            {count > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <img
                  src={items[0].src}
                  onClick={first}
                  title="First"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                />
                <img
                  src={items[(index - 1 + count) % count].src}
                  onClick={prev}
                  title="Prev"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                />
              </div>
            )}

            {count > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 8,
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <img
                  src={items[(index + 1) % count].src}
                  onClick={next}
                  title="Next"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                />
                <img
                  src={items[count - 1].src}
                  onClick={last}
                  title="Last"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                />
              </div>
            )}
          </div>

          {showThumbStrip && count > 0 && (
            <div
              ref={stripRef}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(auto-fill, minmax(${thumbSize}px, 1fr))`,
                gap: 12,
                padding: 6,
                borderRadius: 12,
              }}
            >
              {items.map((img, i) => (
                <button
                  key={img.src + i}
                  data-idx={i}
                  title={img.title || ""}
                  onClick={() => setIndex(i)}
                  style={{
                    width: "100%",
                    height: thumbSize,
                    borderRadius: 12,
                    padding: 0,
                    cursor: "pointer",
                    border:
                      i === index
                        ? "2px solid #60a5fa"
                        : "1px solid rgba(255,255,255,.08)",
                    outline: "none",
                    background: "transparent",
                    overflow: "hidden",
                    display: "block",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.title || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        grid
      )}
    </section>
  );
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type PreviewOpts = {
  videoSrc: string;
  count?: number; // optional: known count
  pattern?: string; // optional: "{dir}/{base}_{i3}.jpg" or "{dir}/{base}_some_{i3}.jpg"
  maxProbe?: number; // max images to probe if count is unknown
  intervalMs?: number;
};

function splitPath(src: string) {
  const url = new URL(src, location.origin);
  const parts = url.pathname.split("/");
  const filename = parts.pop() || "";
  const dir = parts.join("/");
  const dot = filename.lastIndexOf(".");
  const base = dot > -1 ? filename.slice(0, dot) : filename;
  return { dir, base };
}

function formatPattern(dir: string, base: string, i: number, pattern: string) {
  const i3 = String(i).padStart(3, "0");
  return pattern
    .replace("{dir}", dir)
    .replace("{base}", base)
    .replace("{i}", String(i))
    .replace("{i3}", i3);
}

async function imageExists(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export function useHoverPreview(opts: PreviewOpts) {
  const { videoSrc, count, pattern, maxProbe = 12, intervalMs = 160 } = opts;
  const { dir, base } = useMemo(() => splitPath(videoSrc), [videoSrc]);

  // Try two patterns if none provided
  const patterns = useMemo(() => {
    if (pattern) return [pattern];
    return ["{dir}/{base}_{i3}.jpg", "{dir}/{base}_some_{i3}.jpg"];
  }, [pattern]);

  const [frames, setFrames] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadFrames() {
      // If count provided, build straight away using first working pattern
      if (typeof count === "number" && count > 0) {
        for (const pat of patterns) {
          const first = formatPattern(dir, base, 1, pat);
          if (await imageExists(first)) {
            const list = Array.from({ length: count }, (_, k) => formatPattern(dir, base, k + 1, pat));
            if (!cancelled) setFrames(list);
            return;
          }
        }
      }
      // Otherwise probe both patterns up to maxProbe
      for (const pat of patterns) {
        const found: string[] = [];
        for (let i = 1; i <= maxProbe; i++) {
          const url = formatPattern(dir, base, i, pat);
          // eslint-disable-next-line no-await-in-loop
          const ok = await imageExists(url);
          if (ok) found.push(url);
          else if (found.length > 0) break; // stop on first gap after finding some
        }
        if (found.length > 0) {
          if (!cancelled) setFrames(found);
          return;
        }
      }
      if (!cancelled) setFrames([]);
    }
    loadFrames();
    return () => { cancelled = true; };
  }, [dir, base, patterns, count, maxProbe]);

  const start = () => {
    if (timerRef.current || frames.length === 0) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, intervalMs);
  };
  const stop = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIndex(0);
    }
  };

  return { frames, current: frames[index] || null, start, stop, hasFrames: frames.length > 0 };
}
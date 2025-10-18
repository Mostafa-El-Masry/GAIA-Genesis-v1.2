"use client";
import { useEffect, useState } from "react";

export type VideoItem = {
  src: string;
  title?: string;
  poster?: string;
  preview?: {
    pattern?: string; // e.g. "{dir}/{base}_{i3}.jpg" or "{dir}/{base}_some_{i3}.jpg"
    count?: number;   // if known
  };
};

export type ImageItem = {
  src: string;
  title?: string;
};

type Manifest = {
  images?: ImageItem[];
  videos?: VideoItem[];
};

const DEFAULT_IMAGES: ImageItem[] = [
  { src: "/media/images/sample1.jpg", title: "Sample 1" },
  { src: "/media/images/sample2.jpg", title: "Sample 2" },
  { src: "/media/images/sample3.jpg", title: "Sample 3" },
  { src: "/media/images/sample4.jpg", title: "Sample 4" },
  { src: "/media/images/sample5.jpg", title: "Sample 5" },
];

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    src: "/media/videos/sample1.mp4",
    title: "Sample Video 1",
    poster: "/media/previews/sample1_001.jpg",
    preview: { pattern: "{dir}/{base}_{i3}.jpg", count: 6 }
  },
  {
    src: "/media/videos/sample2.mp4",
    title: "Sample Video 2",
    poster: "/media/previews/sample2_001.jpg",
    preview: { pattern: "{dir}/{base}_some_{i3}.jpg", count: 6 }
  },
  {
    src: "/media/videos/sample3.mp4",
    title: "Sample Video 3",
    poster: "/media/previews/sample3_001.jpg",
    preview: { pattern: "{dir}/{base}_{i3}.jpg", count: 8 }
  }
];

export function useMediaManifest() {
  const [images, setImages] = useState<ImageItem[]>(DEFAULT_IMAGES);
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS);
  const [loadedFromManifest, setLoadedFromManifest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/media/manifest.json", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("no manifest");
        const data: Manifest = await r.json();
        if (!cancelled) {
          if (data.images?.length) setImages(data.images);
          if (data.videos?.length) setVideos(data.videos);
          setLoadedFromManifest(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadedFromManifest(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { images, videos, loadedFromManifest };
}
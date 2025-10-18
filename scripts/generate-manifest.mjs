import fs from "fs/promises";
import path from "path";

const root = path.resolve(process.cwd());
const mediaDir = path.join(root, "public", "media");
const imagesDir = path.join(mediaDir, "images");
const videosDir = path.join(mediaDir, "videos");

const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
const videoExts = [".mp4", ".webm", ".mov"];

function makeSrc(p) {
  // return path relative to public (start with /media/...) using POSIX separators
  const rel = path.relative(path.join(root, "public"), p).split(path.sep).join("/");
  return "/" + rel;
}

async function listFiles(dir) {
  try {
    const names = await fs.readdir(dir);
    return names.map((n) => path.join(dir, n));
  } catch (e) {
    return [];
  }
}

async function main() {
  const images = [];
  const videos = [];

  const imageFiles = await listFiles(imagesDir);
  for (const f of imageFiles) {
    const ext = path.extname(f).toLowerCase();
    if (imageExts.includes(ext)) {
      images.push({ src: makeSrc(f), title: path.basename(f) });
    } else if (videoExts.includes(ext)) {
      // some users put mp4 in images folder by mistake
      videos.push({ src: makeSrc(f), title: path.basename(f) });
    }
  }

  const videoFiles = await listFiles(videosDir);
  for (const f of videoFiles) {
    const ext = path.extname(f).toLowerCase();
    if (videoExts.includes(ext))
      videos.push({ src: makeSrc(f), title: path.basename(f) });
    else if (imageExts.includes(ext))
      images.push({ src: makeSrc(f), title: path.basename(f) });
  }

  const manifest = { images, videos };
  const out = path.join(mediaDir, "manifest.json");
  await fs.writeFile(out, JSON.stringify(manifest, null, 2), "utf8");
  console.log(
    "Wrote",
    out,
    "with",
    images.length,
    "images and",
    videos.length,
    "videos"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

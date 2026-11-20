import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const artSourceDir = path.resolve(rootDir, "..", "art");
const showcaseSrcDir = path.join(artSourceDir, "showcase");
const cutoutsSrcDir = path.join(artSourceDir, "with transparency");

const showcaseOutDir = path.join(rootDir, "public", "art", "showcase");
const cutoutsOutDir = path.join(rootDir, "public", "art", "cutouts");
const gifSrcDir = path.join(artSourceDir, "gif");
const gifOutDir = path.join(rootDir, "public", "art", "gif");

fs.mkdirSync(showcaseOutDir, { recursive: true });
fs.mkdirSync(cutoutsOutDir, { recursive: true });
fs.mkdirSync(gifOutDir, { recursive: true });

const showcaseMap = [
  ["big luma buzul.png", "big-luma-buzul"],
  ["Havatea at beach (1).png", "havatea-at-beach"],
  ["empire girl.png", "empire-girl"],
  ["IMG_1224.PNG", "coastal-surge"],
  ["IMG_1139.PNG", "sunwards-eyes"],
  ["IMG_1174.PNG", "iron-knight"],
  ["IMG_1158.PNG", "dune-leviathan"],
  ["IMG_1219.PNG", "highland-study"],
  ["IMG_1147.PNG", "fog-railway"],
  ["IMG_0080.PNG", "one-more-instrument"],
  ["IMG_2076.PNG", "courtyard-light"],
  ["IMG_0500.PNG", "fishbowl-encore"],
  ["IMG_2089.PNG", "orbital-drift"],
];

const cutoutsMap = [
  ["IMG_2714.PNG", "pencil", { trim: "normal", maxDim: 1200 }],
  ["IMG_2715.PNG", "polaroid", { trim: "normal", maxDim: 1200 }],
  ["IMG_2716.PNG", "burger", { trim: "normal", maxDim: 1200 }],
  ["IMG_2717.PNG", "mint-van", { trim: "normal", maxDim: 1200 }],
  ["IMG_2718.PNG", "pigeon", { trim: "normal", maxDim: 1200 }],
  ["IMG_2719.PNG", "angler-fish", { trim: "normal", maxDim: 1200 }],
  ["IMG_2720.PNG", "glass-sheep", { trim: "none", maxDim: 1600 }],
  ["IMG_2721.PNG", "visor-portrait", { trim: "flush-bl", maxDim: 1200 }],
  ["IMG_2722.PNG", "trex-skull", { trim: "normal", maxDim: 1200 }],
  ["IMG_2723.PNG", "red-rig", { trim: "normal", maxDim: 1200 }],
];

async function processShowcase() {
  console.log("Processing showcase pieces...");
  for (const [srcFile, slug] of showcaseMap) {
    const srcPath = path.join(showcaseSrcDir, srcFile);
    const smOut = path.join(showcaseOutDir, `${slug}-sm.webp`);
    const galleryOut = path.join(showcaseOutDir, `${slug}.webp`);
    const fullOut = path.join(showcaseOutDir, `${slug}-full.webp`);

    await sharp(srcPath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(smOut);

    await sharp(srcPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(galleryOut);

    await sharp(srcPath)
      .resize({ width: 2600, withoutEnlargement: true })
      .webp({ quality: 90, effort: 6, smartSubsample: true })
      .toFile(fullOut);

    if (slug === "sunwards-eyes") {
      const gridOut = path.join(showcaseOutDir, `${slug}-grid.webp`);
      await sharp(srcPath)
        .resize({ width: 320, height: 134, fit: "fill" })
        .webp({ quality: 95, effort: 6, smartSubsample: true })
        .toFile(gridOut);
      const gridSize = (fs.statSync(gridOut).size / 1024).toFixed(1);
      console.log(`  ✓ ${slug}-grid: ${gridSize}KB (320x134 voxel color map)`);
    }

    const smSize = (fs.statSync(smOut).size / 1024).toFixed(1);
    const gSize = (fs.statSync(galleryOut).size / 1024).toFixed(1);
    const fSize = (fs.statSync(fullOut).size / 1024).toFixed(1);
    console.log(`  ✓ ${slug}: ${smSize}KB (800w), ${gSize}KB (1600w), ${fSize}KB (full)`);
  }
}

async function computeAlphaBounds(srcPath, mode) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const a = data[rowOffset + x * 4 + 3];
      if (a > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { left: 0, top: 0, width, height };
  }

  const pad = 12;
  const left = mode === "flush-bl" ? 0 : Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = mode === "flush-bl" ? height - 1 : Math.min(height - 1, maxY + pad);

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

async function processCutouts() {
  console.log("\nProcessing transparent cutouts...");
  for (const [srcFile, slug, opts] of cutoutsMap) {
    const srcPath = path.join(cutoutsSrcDir, srcFile);
    const outPath = path.join(cutoutsOutDir, `${slug}.webp`);

    let pipeline = sharp(srcPath).ensureAlpha();

    if (opts.trim !== "none") {
      const box = await computeAlphaBounds(srcPath, opts.trim);
      pipeline = pipeline.extract(box);
    }

    await pipeline
      .resize({
        width: opts.maxDim,
        height: opts.maxDim,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88, alphaQuality: 100 })
      .toFile(outPath);

    const meta = await sharp(outPath).metadata();
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  ✓ ${slug}.webp: ${meta.width}x${meta.height}, hasAlpha=${meta.hasAlpha}, ${kb}KB`);
  }
}

await processShowcase();
await processCutouts();

// Pre-bake a tileable monochrome alpha paper grain texture (eliminates runtime SVG feTurbulence + mix-blend-mode: multiply)
{
  const noiseSize = 128;
  const noiseBuf = Buffer.alloc(noiseSize * noiseSize * 4);
  let seed = 0x517cc1b7;
  for (let i = 0; i < noiseSize * noiseSize; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    const u = (seed >>> 0) / 0xffffffff;
    // Ink RGB (14, 14, 13) with alpha encoding 0.055 * (1 - g) -> mathematically identical to mix-blend-mode: multiply at 0.055 opacity
    noiseBuf[i * 4] = 14;
    noiseBuf[i * 4 + 1] = 14;
    noiseBuf[i * 4 + 2] = 13;
    noiseBuf[i * 4 + 3] = Math.round(u * 28);
  }
  const noiseOut = path.join(rootDir, "public", "noise.webp");
  await sharp(noiseBuf, { raw: { width: noiseSize, height: noiseSize, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(noiseOut);
  const nKb = (fs.statSync(noiseOut).size / 1024).toFixed(1);
  console.log(`\n✓ Pre-baked paper grain texture: noise.webp (${nKb}KB)`);
}

if (fs.existsSync(path.join(gifSrcDir, "IMG_0990.gif"))) {
  console.log("\nProcessing scroll-scrubbed GIF animation...");
  const srcGif = path.join(gifSrcDir, "IMG_0990.gif");
  fs.copyFileSync(srcGif, path.join(gifOutDir, "IMG_0990.gif"));

  // Animated WebP loop for Lightbox (168KB vs 1399KB GIF, full 24-bit quality)
  const loopOut = path.join(gifOutDir, "eye-loop.webp");
  await sharp(srcGif, { animated: true })
    .webp({ quality: 92, effort: 6 })
    .toFile(loopOut);
  const loopKb = (fs.statSync(loopOut).size / 1024).toFixed(1);
  console.log(`  ✓ eye-loop.webp (${loopKb}KB animated WebP)`);

  // Vertical sprite strip for scroll-scrubbed canvas
  const { data, info } = await sharp(srcGif, { animated: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stripOut = path.join(gifOutDir, "eye-strip.webp");
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(stripOut);
  const stripKb = (fs.statSync(stripOut).size / 1024).toFixed(1);
  console.log(`  ✓ eye-strip.webp (${info.width}x${info.height}, ${stripKb}KB)`);
}

const projectsSrcDir = path.resolve(rootDir, "..", "projects");
const projectsOutDir = path.join(rootDir, "public", "projects");

if (fs.existsSync(projectsSrcDir)) {
  console.log("\nProcessing project assets for isometric grid...");
  fs.mkdirSync(projectsOutDir, { recursive: true });

  const projectJobs = [
    ["The visual index/IMG_2292.gif", "visual-index-1.webp", { animated: true, width: 540, quality: 72 }],
    ["The visual index/IMG_2208.gif", "visual-index-2.webp", { animated: true, width: 540, quality: 72 }],
    ["The visual index/IMG_2146.gif", "visual-index-3.webp", { animated: true, width: 540, quality: 72 }],
    ["The visual index/IMG_2292.gif", "visual-index-1-static.webp", { page: 0, width: 720, quality: 86 }],
    ["The visual index/IMG_2208.gif", "visual-index-2-static.webp", { page: 0, width: 720, quality: 86 }],
    ["The visual index/IMG_2146.gif", "visual-index-3-static.webp", { page: 0, width: 720, quality: 86 }],
    ["Pindrop Board/Screenshot 2026-09-12 211848.png", "pindrop-1.webp", { width: 900, quality: 86 }],
    ["Pindrop Board/Screenshot 2026-09-15 071153.png", "pindrop-2.webp", { width: 900, quality: 86 }],
    ["Pindrop Board/Screenshot 2026-09-22 225229.png", "pindrop-3.webp", { width: 900, quality: 86 }],
    ["Starling dot exe/Screenshot 2026-11-14 223103.png", "starling-1.webp", { width: 900, quality: 86 }],
    ["Starling dot exe/Screenshot 2026-11-15 174403.png", "starling-2.webp", { width: 900, quality: 86 }],
    ["Starling dot exe/Screenshot 2026-11-16 214444.png", "starling-3.webp", { width: 900, quality: 86 }],
    ["Godup Modeler/Screenshot 2026-11-19 071153.png", "godup-1.webp", { width: 900, quality: 88 }],
    ["Godup Modeler/Screenshot 2026-11-19 071612.png", "godup-2.webp", { width: 900, quality: 88 }],
    ["Godup Modeler/Screenshot 2026-11-19 160535.png", "godup-3.webp", { width: 900, quality: 88 }],
    ["catle heardin/QPwQn8.png", "catle-1.webp", { width: 960, nearest: true, quality: 92 }],
    ["catle heardin/Screenshot 2026-11-19 232839.png", "catle-2.webp", { width: 960, nearest: true, quality: 92 }],
    ["Were you ever free/ggxucu.png", "free-1.webp", { width: 900, nearest: true, lossless: true }],
    ["Were you ever free/wArld8.png", "free-2.webp", { width: 900, nearest: true, lossless: true }],
    ["Were you ever free/vMVqDh.png", "free-3.webp", { width: 900, nearest: true, lossless: true }],
  ];

  for (const [relSrc, outName, opts] of projectJobs) {
    const srcPath = path.join(projectsSrcDir, relSrc);
    const outPath = path.join(projectsOutDir, outName);
    const sharpOpts = opts.animated
      ? { animated: true, limitInputPixels: false }
      : opts.page !== undefined
        ? { page: opts.page }
        : {};
    let p = sharp(srcPath, sharpOpts);
    if (opts.nearest) {
      p = p.resize({ width: opts.width, kernel: sharp.kernel.nearest });
    } else {
      p = p.resize({ width: opts.width, withoutEnlargement: true });
    }
    p = p.webp(
      opts.lossless
        ? { lossless: true, effort: 6 }
        : { quality: opts.quality, effort: 6, smartSubsample: true }
    );
    await p.toFile(outPath);
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  ✓ ${outName}: ${kb}KB`);
  }
}

console.log("\nAll art assets prepared successfully.");

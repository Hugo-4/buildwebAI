#!/usr/bin/env node
/**
 * Transforme une vidéo en séquence d'images pilotée par le scroll.
 *
 *   npm run frames -- <video.mp4> <nom> [--frames 150] [--start 0] [--end 0]
 *
 * Exemple : npm run frames -- ~/Videos/arrivee.mp4 hero
 *
 * Écrit dans public/sequences/<nom>/ :
 *   1920/frame_0001.webp …  (ordinateur)
 *   960/frame_0001.webp  …  (mobile, écrans étroits)
 *   manifest.json            (nombre d'images, tailles, ratio)
 * Le site lit le manifest : rien d'autre à modifier.
 *
 * ffmpeg est fourni par le paquet ffmpeg-static (aucune installation système).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import ffmpegStatic from "ffmpeg-static";

const ffmpeg = process.env.FFMPEG || ffmpegStatic || "ffmpeg";
const ffprobe = ffmpeg.replace(/ffmpeg(\.exe)?$/, "ffprobe$1");

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const [input, name] = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!input || !name || !existsSync(input)) {
  console.error("Usage : npm run frames -- <video.mp4> <nom> [--frames 150] [--start s] [--end s]");
  process.exit(1);
}

const TARGET = flag("frames", 150); // ~150 images : fluide au scroll, poids raisonnable
const START = flag("start", 0);
const END = flag("end", 0);
const SIZES = [1920, 960];
const QUALITY = 62; // au-delà, le poids grimpe sans gain visible en mouvement

/** Durée de la vidéo (via ffmpeg -i, pour ne pas dépendre de ffprobe). */
function duration(file) {
  const out = spawnSync(ffmpeg, ["-i", file], { encoding: "utf8" }).stderr;
  const m = out.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (!m) throw new Error("Durée illisible : " + file);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const total = duration(input);
const span = (END || total) - START;
const fps = TARGET / span;
const outDir = resolve("public/sequences", name);
rmSync(outDir, { recursive: true, force: true });

let ratio = 16 / 9;
for (const w of SIZES) {
  const dir = join(outDir, String(w));
  mkdirSync(dir, { recursive: true });
  const res = spawnSync(
    ffmpeg,
    [
      "-loglevel", "error",
      "-ss", String(START),
      "-t", String(span),
      "-i", input,
      // fps constant : une image par cran de scroll, réparties régulièrement
      "-vf", `fps=${fps.toFixed(5)},scale=${w}:-2:flags=lanczos`,
      "-frames:v", String(TARGET),
      "-c:v", "libwebp", "-quality", String(QUALITY), "-compression_level", "6",
      join(dir, "frame_%04d.webp"),
    ],
    { stdio: "inherit" },
  );
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const count = readdirSync(join(outDir, String(SIZES[0]))).filter((f) => f.endsWith(".webp")).length;
// ratio réel, lu sur la première image extraite
const probe = spawnSync(ffmpeg, ["-i", join(outDir, String(SIZES[0]), "frame_0001.webp")], { encoding: "utf8" }).stderr;
const dim = probe.match(/, (\d{2,5})x(\d{2,5})/);
if (dim) ratio = Number(dim[1]) / Number(dim[2]);

writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ name, count, sizes: SIZES, ratio, ext: "webp" }, null, 2) + "\n");
console.log(`✓ ${count} images × ${SIZES.length} tailles → public/sequences/${name}/  (ffprobe: ${existsSync(ffprobe) ? "ok" : "non requis"})`);

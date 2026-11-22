/**
 * Séquences d'images du site. Chaque manifest est écrit par `npm run frames`.
 * Pour remplacer une séquence : `npm run frames -- ma-video.mp4 hero`.
 * Les séquences actuelles sont des PLACEHOLDERS (travelling simulé sur photo).
 */
import hero from "@/public/sequences/hero/manifest.json";
import suites from "@/public/sequences/suites/manifest.json";

export type SequenceManifest = {
  name: string;
  count: number;
  sizes: number[];
  ratio: number;
  ext: string;
};

export const SEQUENCES = {
  hero: hero as SequenceManifest,
  suites: suites as SequenceManifest,
};

/** Première image d'une séquence (affiche du hero, préchargée en priorité). */
export const firstFrame = (m: SequenceManifest, size = m.sizes[0]) => `/sequences/${m.name}/${size}/frame_0001.${m.ext}`;

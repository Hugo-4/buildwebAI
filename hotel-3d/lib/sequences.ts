/**
 * Séquences d'images du site. Chaque manifest est écrit par `npm run frames`.
 * Pour remplacer une séquence : `npm run frames -- ma-video.mp4 hero`.
 * Séquences au scroll : l'arrivée (hero, rejouée de nuit dans le pied de page).
 * Les suites sont de vraies vidéos lues à la demande (public/video/suite-*.mp4).
 */
import hero from "@/public/sequences/hero/manifest.json";

export type SequenceManifest = {
  name: string;
  count: number;
  sizes: number[];
  ratio: number;
  ext: string;
};

export const SEQUENCES = {
  hero: hero as SequenceManifest,
};

/** Première image d'une séquence (affiche du hero, préchargée en priorité). */
export const firstFrame = (m: SequenceManifest, size = m.sizes[0]) => `/sequences/${m.name}/${size}/frame_0001.${m.ext}`;

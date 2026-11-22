/**
 * Grammaire de mouvement de L'Arolle.
 * Une seule famille de courbes : expo-out pour les entrées, in-out pour les
 * déplacements pilotés par le scroll. Les durées sont reprises dans DESIGN.md.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Enregistre ScrollTrigger une seule fois, côté client uniquement. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE.outExpo, duration: DUR.reveal });
  registered = true;
  return gsap;
}

export const EASE = {
  /** Entrées : rapide puis se pose, comme un skieur qui s'arrête. */
  outExpo: "expo.out",
  /** Trajets liés au scroll. */
  inOut: "power3.inOut",
  /** Sorties : plus courtes que les entrées (~75 %). */
  in: "power2.in",
} as const;

/** Équivalents cubic-bezier pour CSS et Framer Motion. */
export const BEZIER = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  in: [0.55, 0, 1, 0.45] as const,
};

export const DUR = {
  micro: 0.16,
  ui: 0.28,
  reveal: 1.1,
  title: 1.4,
  /** Décalage entre deux lettres du titre. */
  letter: 0.07,
} as const;

/** Angle de la pente, en degrés : la composition entière s'y aligne. */
export const SLOPE_DEG = 12;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };

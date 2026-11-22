"use client";
/**
 * Lecteur de séquence d'images piloté par le scroll (« vidéo au scroll »).
 *
 * Pourquoi des images et pas une <video> : le scrub d'une vidéo dépend des
 * images-clés du codec et saccade ; une séquence WebP se dessine image par image
 * sur un <canvas>, sans à-coup, dans les deux sens.
 *
 * - La section est haute (`length` × hauteur d'écran) ; l'intérieur reste épinglé.
 * - Chargement progressif : la 1re image d'abord (affichage immédiat), puis une
 *   image sur 16, sur 8, sur 4… On peut donc scroller avant la fin du chargement :
 *   on dessine l'image chargée la plus proche.
 * - Taille servie : 1920 px ou 960 px selon la largeur réelle de l'écran.
 * - prefers-reduced-motion : une seule image fixe (`stillFrame`), pas de scrub.
 * - `timeline` reçoit la timeline GSAP (durée 1 = toute la section) pour y
 *   synchroniser les textes en surimpression.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { firstFrame, type SequenceManifest } from "@/lib/sequences";

type Props = {
  manifest: SequenceManifest;
  /** Longueur de scroll, en hauteurs d'écran. */
  length: number;
  /** Image affichée quand le mouvement est réduit (0 → 1). */
  stillFrame?: number;
  /** Ajoute des tweens à la timeline scrubbée (position 0 → 1). */
  timeline?: (tl: gsap.core.Timeline, root: HTMLElement) => void;
  /** Écran portrait : hauteur (0 → 1) de la bande où l'image est cadrée, en haut. 1 = plein écran. */
  portraitBox?: number;
  /** Étalonnage nocturne (footer : la même maison, de nuit). */
  night?: boolean;
  /** Lecture à rebours : le départ rejoue l'arrivée à l'envers. */
  reverse?: boolean;
  /** Fond visible autour de l'image cadrée (portrait). */
  bg?: string;
  /** Description de la séquence pour les lecteurs d'écran. */
  label: string;
  id?: string;
  header?: "light" | "dark";
  className?: string;
  children?: ReactNode;
};

const pad = (n: number) => String(n).padStart(4, "0");

/** Ordre de chargement : 0, puis pas de 16, 8, 4, 2, 1 (couverture grossière d'abord). */
function loadOrder(count: number) {
  const seen = new Set<number>([0]);
  const order = [0];
  for (const step of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) if (!seen.has(i)) seen.add(i), order.push(i);
  }
  return order;
}

export default function ScrollSequence({
  manifest,
  length,
  stillFrame = 0,
  timeline,
  label,
  portraitBox = 1,
  night = false,
  reverse = false,
  bg = "#16245a",
  id,
  header = "light",
  className = "",
  children,
}: Props) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { count, sizes, name, ext } = manifest;
    const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
    const state = { frame: reduced ? Math.round(stillFrame * (count - 1)) : reverse ? count - 1 : 0 };
    let drawn = -1;
    let cancelled = false;

    // Taille servie selon la largeur physique de l'écran
    const pick = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const portrait = window.innerWidth / window.innerHeight < 0.9 && portraitBox < 1;
      // en portrait, l'image remplit la hauteur de sa bande : c'est cette hauteur qui compte
      const need = portrait ? window.innerHeight * portraitBox * manifest.ratio * dpr : window.innerWidth * dpr;
      return need > sizes[1] * 1.15 ? sizes[0] : sizes[1];
    };
    const size = pick();
    const src = (i: number) => `/sequences/${name}/${size}/frame_${pad(i + 1)}.${ext}`;

    /** Image chargée la plus proche de i (on cherche des deux côtés). */
    const nearest = (i: number) => {
      for (let d = 0; d < count; d++) {
        if (images[i - d]) return i - d;
        if (images[i + d]) return i + d;
      }
      return -1;
    };

    const draw = (force = false) => {
      const target = Math.round(state.frame);
      const i = nearest(target);
      if (i < 0 || (i === drawn && !force)) return;
      const img = images[i]!;
      const { width: cw, height: ch } = cv;
      // Portrait : l'image est cadrée dans une bande en haut, le reste reçoit le fond
      const portrait = cw / ch < 0.9 && portraitBox < 1;
      const boxH = portrait ? ch * portraitBox : ch;
      if (portrait) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, cw, ch);
      }
      // object-fit: cover dans la boîte
      const s = Math.max(cw / img.naturalWidth, boxH / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      if (night) ctx.filter = "brightness(0.62) saturate(0.8) contrast(1.08)";
      ctx.drawImage(img, (cw - w) / 2, (boxH - h) / 2, w, h);
      if (portrait) {
        // le champ du bas est coupé à 12° : l'image s'y termine en pente, comme une affiche
        const rise = cw * 0.2126;
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(0, boxH);
        ctx.lineTo(cw, boxH - rise);
        ctx.lineTo(cw, ch);
        ctx.lineTo(0, ch);
        ctx.closePath();
        ctx.fill();
      }
      if (night) {
        // nuit : on noie l'image dans le bleu d'altitude, seules les lumières chaudes résistent
        ctx.filter = "none";
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "#2a3a7a";
        ctx.fillRect(0, 0, cw, boxH);
        ctx.globalCompositeOperation = "source-over";
      }
      if (drawn < 0) cv.style.opacity = "1"; // le canvas remplace l'affiche dès sa 1re image
      drawn = i;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      draw(true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    // Chargement progressif, 6 requêtes en parallèle.
    // Rien d'autre que l'affiche n'est téléchargé avant que ce soit utile :
    // la séquence démarre quand la section approche ET que le visiteur a
    // interagi (scroll, toucher, clavier). Les images proches de la position
    // courante passent devant la file (priorité au scrub).
    const order = loadOrder(count);
    const queue: number[] = reduced ? [state.frame] : reverse ? order.map((i) => count - 1 - i) : order;
    const requested = new Set<number>();
    let active = 0;
    let started = false;
    const next = () => {
      while (started && !cancelled && active < 6 && queue.length) {
        const i = queue.shift()!;
        if (requested.has(i)) continue;
        requested.add(i);
        const img = new Image();
        img.decoding = "async";
        active++;
        img.onload = img.onerror = () => {
          active--;
          if (img.naturalWidth) {
            images[i] = img;
            // redessine si cette image est plus proche de la position voulue
            const t = Math.round(state.frame);
            if (drawn < 0 || Math.abs(i - t) < Math.abs(drawn - t)) draw(true);
          }
          next();
        };
        img.src = src(i);
      }
    };
    /** Met en tête de file les images autour de la position courante. */
    const prioritize = () => {
      const t = Math.round(state.frame);
      for (const d of [2, 1, 0]) {
        for (const i of [t - d, t + d]) if (i >= 0 && i < count && !requested.has(i)) queue.unshift(i);
      }
      next();
    };
    const start = () => {
      if (started) return;
      started = true;
      next();
    };
    let near = false;
    let interacted = reduced; // en mouvement réduit, une seule image : on la charge tout de suite
    const maybeStart = () => near && interacted && start();
    const io = new IntersectionObserver(([e]) => ((near = e.isIntersecting), maybeStart()), { rootMargin: "150% 0px" });
    io.observe(el);
    const onFirst = () => ((interacted = true), maybeStart());
    const evts = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"] as const;
    evts.forEach((ev) => window.addEventListener(ev, onFirst, { once: true, passive: true }));

    const cleanupLoad = () => {
      io.disconnect();
      evts.forEach((ev) => window.removeEventListener(ev, onFirst));
    };
    if (reduced) {
      return () => {
        cancelled = true;
        ro.disconnect();
        cleanupLoad();
      };
    }

    const gctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        // scrub direct : Lenis lisse déjà le défilement, on n'ajoute pas un second retard
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: true },
      });
      // la séquence couvre toute la timeline ; les textes s'y calent (0 → 1)
      tl.to(
        state,
        {
          frame: reverse ? 0 : count - 1,
          duration: 1,
          onUpdate: () => {
            if (!images[Math.round(state.frame)]) prioritize();
            draw();
          },
        },
        0,
      );
      timeline?.(tl, el);
    }, el);

    return () => {
      cancelled = true;
      ro.disconnect();
      cleanupLoad();
      gctx.revert();
    };
  }, [manifest, reduced, stillFrame, timeline, portraitBox, night, reverse, bg]);

  return (
    <section
      ref={root}
      id={id}
      data-header={header}
      aria-label={label}
      className={`relative ${className}`}
      style={{ height: reduced ? "100svh" : `${length * 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ backgroundColor: portraitBox < 1 ? bg : "#121417" }}>
        {/* Affiche : 1re image en <img> (LCP rapide, visible sans JavaScript) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={firstFrame(manifest, manifest.sizes[1])}
          srcSet={`${firstFrame(manifest, manifest.sizes[1])} ${manifest.sizes[1]}w, ${firstFrame(manifest)} ${manifest.sizes[0]}w`}
          sizes={portraitBox < 1 ? "(orientation: portrait) 240vw, 100vw" : "100vw"}
          alt=""
          fetchPriority={id === "top" ? "high" : "auto"}
          // portrait : même cadrage que le canvas (bande du haut, bas coupé à 12°)
          className={`absolute inset-x-0 top-0 h-full w-full object-cover ${night ? "brightness-50" : ""} ${
            portraitBox < 1 ? "portrait:h-[var(--pbox)] portrait:[clip-path:polygon(0_0,100%_0,100%_calc(100%-21.26vw),0_100%)]" : ""
          }`}
          style={{ ["--pbox" as string]: `${portraitBox * 100}%` }}
        />
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full opacity-0"
          role="img"
          aria-label={label}
        />
        {children}
      </div>
    </section>
  );
}

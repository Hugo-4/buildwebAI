"use client";
/**
 * Image ou vidéo révélée par bandes verticales : le cadre est découpé en N
 * bandes alignées sur les filets de la page ; avec le scroll, chacune s'ouvre
 * depuis son axe, l'une après l'autre, jusqu'à recomposer l'image entière.
 * Une seule image dessous (pas de copies) : les bandes sont un masque clip-path.
 * Mouvement réduit : l'image entière, tout de suite.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";

type Props = { children: ReactNode; strips?: number; className?: string; start?: string };

/** Polygone composé de N bandes, chacune ouverte à `k` (0 → 1) autour de son centre. */
function stripsPolygon(open: number[]) {
  const n = open.length;
  const pts: string[] = [];
  open.forEach((k, i) => {
    const c = ((i + 0.5) / n) * 100;
    const half = (k * 50) / n;
    const l = (c - half).toFixed(3);
    const r = (c + half).toFixed(3);
    // chaque bande est un rectangle ; on les relie par le bas (bord invisible de largeur nulle)
    pts.push(`${l}% 100%`, `${l}% 0%`, `${r}% 0%`, `${r}% 100%`);
  });
  return `polygon(${pts.join(", ")})`;
}

export default function StripReveal({ children, strips = 6, className = "", start = "top 85%" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    const l = layer.current;
    if (!el || !l) return;
    if (prefersReducedMotion()) return;
    // les bandes suivent la grille : six colonnes, quatre sur téléphone
    const n = window.innerWidth < 768 ? Math.min(strips, 4) : strips;
    const state = { p: 0 };
    const apply = () => {
      // décalage : la bande i commence quand p atteint i / (N + 2)
      const open = Array.from({ length: n }, (_, i) => {
        const s = (i / n) * 0.55;
        return gsap.utils.clamp(0, 1, (state.p - s) / 0.45);
      });
      l.style.clipPath = stripsPolygon(open.map((k) => gsap.parseEase("power2.out")(k)));
    };
    apply();
    const ctx = gsap.context(() => {
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: apply,
        scrollTrigger: { trigger: el, start, end: "top 15%", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [strips, start]);

  return (
    <div ref={root} className={`relative overflow-hidden ${className}`}>
      <div ref={layer} className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}

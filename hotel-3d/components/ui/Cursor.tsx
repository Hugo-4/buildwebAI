"use client";
/**
 * Curseur personnalisé : un point d'encre qui suit la souris exactement et un
 * anneau qui le rattrape avec un léger retard. Sur un lien ou un bouton,
 * l'anneau s'élargit ; sur la galerie, il porte un mot (« Découvrir »).
 * Désactivé sur écran tactile ; sans retard si le mouvement est réduit.
 * Le curseur système reste en place pour les champs de saisie.
 */
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

let labelSetter: ((l: string | null) => void) | null = null;
/** Affiche un mot dans l'anneau (null pour l'effacer). */
export const setCursorLabel = (l: string | null) => labelSetter?.(l);

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    labelSetter = setLabel;
    return () => {
      labelSetter = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const lag = prefersReducedMotion() ? 0.01 : 0.45;
    const dx = gsap.quickSetter(dot.current, "x", "px");
    const dy = gsap.quickSetter(dot.current, "y", "px");
    const rx = gsap.quickTo(ring.current, "x", { duration: lag, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: lag, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: Event) => {
      const t = e.target as Element;
      setHot(!!t.closest?.("a, button, [role='button'], label, select"));
    };
    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
    };
  }, [enabled]);

  if (!enabled) return null;
  const big = !!label;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div ref={dot} className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-amber" />
      <div
        ref={ring}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-amber transition-[width,height,margin,background-color] duration-300 ease-out-expo"
        style={{
          width: big ? 112 : hot ? 56 : 32,
          height: big ? 112 : hot ? 56 : 32,
          marginLeft: big ? -56 : hot ? -28 : -16,
          marginTop: big ? -56 : hot ? -28 : -16,
          backgroundColor: big ? "var(--amber)" : "transparent",
        }}
      >
        {label && <span className="caps text-[0.625rem] text-granite">{label}</span>}
      </div>
    </div>
  );
}

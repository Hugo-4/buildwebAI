"use client";
import { useEffect, useState } from "react";

/** Suit une media query. Renvoie `initial` au rendu serveur. */
export function useMedia(query: string, initial = false) {
  const [match, setMatch] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
/** Écrans tactiles ou étroits : on sert la version allégée de la 3D. */
export const useLiteMode = () => useMedia("(max-width: 767px), (pointer: coarse)");

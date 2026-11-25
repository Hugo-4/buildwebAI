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

const forced = () => typeof document !== "undefined" && document.documentElement.classList.contains("force-motion");

/** Mouvement réduit demandé par le système (sauf animations complètes forcées). */
export const useReducedMotion = () => {
  const m = useMedia("(prefers-reduced-motion: reduce)");
  return m && !forced();
};
/** Écrans tactiles ou étroits : version allégée (sauf animations complètes forcées). */
export const useLiteMode = () => {
  const m = useMedia("(max-width: 767px), (pointer: coarse)");
  return m && !forced();
};

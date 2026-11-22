"use client";
/**
 * Défilement lissé Lenis, synchronisé avec GSAP ScrollTrigger :
 * - Lenis avance sur le ticker GSAP (une seule boucle rAF pour tout le site) ;
 * - chaque mouvement de Lenis met ScrollTrigger à jour.
 * Avec prefers-reduced-motion, Lenis n'est pas démarré : scroll natif.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      duration: 1.15,
      // expo-out : le scroll freine longuement, comme une glisse
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

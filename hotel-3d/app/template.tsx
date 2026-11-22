"use client";
/**
 * Transition entre pages : à chaque navigation, un rideau de neige
 * couvre l'écran puis se lève comme une brume, et la page arrive
 * dessous. app/template.tsx est remonté à chaque changement de route.
 */
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { BEZIER } from "@/lib/motion";

// Premier affichage du site : c'est le préchargeur qui joue l'entrée, pas ce rideau
let firstMount = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const curtain = !firstMount && !reduce;
  useEffect(() => {
    firstMount = false;
  }, []);
  return (
    <>
      {curtain && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[95] bg-snow"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.55, ease: BEZIER.inOut }}
        />
      )}
      {children}
    </>
  );
}

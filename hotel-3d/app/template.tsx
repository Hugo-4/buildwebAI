"use client";
/**
 * Transition entre pages : à chaque navigation, un rideau bleu d'altitude
 * couvre l'écran puis se retire en biais (la pente à 12°), et la page arrive
 * dessous. app/template.tsx est remonté à chaque changement de route.
 */
import { motion, useReducedMotion } from "framer-motion";
import { BEZIER } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <>
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[95] bg-altitude"
          initial={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 121%)" }}
          animate={{ clipPath: "polygon(0% 0%, 100% 0%, 100% -21%, 0% 0%)" }}
          transition={{ duration: 0.9, ease: BEZIER.inOut, delay: 0.1 }}
        />
      )}
      {children}
    </>
  );
}

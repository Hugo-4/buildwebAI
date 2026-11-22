"use client";
/**
 * Texte révélé ligne par ligne : chaque ligne monte depuis son masque
 * quand le bloc entre dans l'écran. Les lignes sont données explicitement
 * (coupures éditoriales maîtrisées, pas de découpage automatique fragile).
 */
import { useEffect, useRef, type ElementType } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";

type Props = {
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Classe appliquée à une ligne précise (ex. italique sur la dernière). */
  lineClass?: (i: number) => string;
  delay?: number;
  id?: string;
};

export default function RevealLines({ lines, as: Tag = "p", className = "", lineClass, delay = 0, id }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-line]",
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.085,
          delay,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [delay]);

  return (
    <Tag ref={root} id={id} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span data-line className={`block ${lineClass?.(i) ?? ""}`}>
            {l}
          </span>
        </span>
      ))}
    </Tag>
  );
}

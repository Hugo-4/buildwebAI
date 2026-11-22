"use client";
/**
 * Phrase qui s'allume : un énoncé repose en gris de brume et passe à l'encre,
 * mot après mot, à mesure qu'il traverse le milieu de l'écran (lié au scroll,
 * il se rallume ou s'éteint dans les deux sens). Idée tirée du moment
 * « word-highlight » du skill taste, réécrite ici en composant React.
 * Mouvement réduit : toute la phrase à l'encre d'emblée.
 */
import { useEffect, useRef, type ElementType } from "react";
import { registerGsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  dark?: boolean;
  id?: string;
};

export default function ScrollWords({ text, as: Tag = "p", className = "", dark = false, id }: Props) {
  const root = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".w"));
    if (prefersReducedMotion()) {
      spans.forEach((s) => s.classList.add("on"));
      return;
    }
    let lit = -1;
    const st = ScrollTrigger.create({
      trigger: el,
      // le 1er mot s'allume quand le haut de la phrase passe à 85 % de l'écran,
      // le dernier quand son bas passe à 45 %
      start: "top 85%",
      end: "bottom 45%",
      onUpdate: (self) => {
        const k = Math.round(self.progress * spans.length);
        if (k === lit) return;
        lit = k;
        spans.forEach((s, i) => s.classList.toggle("on", i < k));
      },
    });
    return () => st.kill();
  }, [text]);

  return (
    <Tag ref={root} id={id} className={`words ${dark ? "on-dark" : ""} ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} className="w">
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}

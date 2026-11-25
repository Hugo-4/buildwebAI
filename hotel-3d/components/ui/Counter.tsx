"use client";
/**
 * Compteur mécanique : chaque chiffre est une bande 0→9 dans une fenêtre fixe,
 * comme un compteur de remontée mécanique. Les unités tournent d'abord,
 * les rangs supérieurs font un tour complet de plus avant de se caler.
 * Ils roulent à chaque apparition à l'écran (aller comme retour) et se remettent à
 * zéro dès qu'ils en sortent. Mouvement réduit : le chiffre final, sans roulement.
 */
import { useEffect, useRef } from "react";
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

type Props = { value: string; className?: string };

const STRIP = Array.from({ length: 20 }, (_, i) => i % 10); // deux tours de 0 à 9

export default function Counter({ value, className }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const chars = Array.from(value);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const strips = el.querySelectorAll<HTMLElement>("[data-strip]");

    // position finale : deuxième tour pour les chiffres, sauf mouvement réduit
    const finalY = (s: HTMLElement) => -((10 + Number(s.dataset.digit)) / STRIP.length) * 100;

    if (prefersReducedMotion()) {
      strips.forEach((s) => gsap.set(s, { yPercent: finalY(s) }));
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(strips, { yPercent: 0 });
      const roll = gsap.to(strips, {
        yPercent: (_i, s: HTMLElement) => finalY(s),
        duration: (i) => 1.3 + (strips.length - 1 - i) * 0.18,
        ease: "expo.inOut",
        stagger: { each: 0.06, from: "end" },
        paused: true,
      });
      // Les chiffres repartent de zéro à chaque fois qu'ils réapparaissent à l'écran
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        end: "bottom top",
        onEnter: () => roll.restart(),
        onEnterBack: () => roll.restart(),
        onLeave: () => roll.pause(0),
        onLeaveBack: () => roll.pause(0),
      });
    }, el);
    return () => ctx.revert();
  }, [value]);

  return (
    <span ref={root} className={`inline-flex ${className ?? ""}`} style={{ verticalAlign: "-0.07em" }}>
      <span className="sr-only">{value}</span>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden leading-none">
            {/* le chiffre final, invisible, donne sa largeur naturelle à la fenêtre */}
            <span className="invisible block leading-none">{c}</span>
            <span data-strip data-digit={c} className="absolute inset-x-0 top-0 flex flex-col will-change-transform">
              {STRIP.map((d, k) => (
                <span key={k} className="block h-[1em] text-center leading-none">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block leading-none">
            {c === " " ? " " : c}
          </span>
        ),
      )}
    </span>
  );
}

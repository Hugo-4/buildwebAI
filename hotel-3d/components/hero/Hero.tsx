"use client";
/**
 * Chapitre 1 — L'arrivée.
 * La vidéo d'approche (séquence d'images) avance avec le scroll. Par-dessus,
 * le vocabulaire de l'affiche : un aplat bleu d'altitude coupé à 12° porte le
 * titre ; il glisse hors champ dès qu'on descend, puis trois phrases se posent
 * tour à tour, chacune dans son cartouche coupé sur la pente.
 */
import { useEffect, useRef } from "react";
import ScrollSequence from "@/components/sequence/ScrollSequence";
import { SEQUENCES } from "@/lib/sequences";
import { registerGsap, gsap, DUR, EASE, prefersReducedMotion } from "@/lib/motion";

const TITLE = "L’Arolle";

/** Phrases calées sur la vidéo : [début, fin] en fraction du scroll. */
const CAPTIONS: { text: string; at: [number, number] }[] = [
  { text: "La route s’arrête au chalet.", at: [0.3, 0.52] },
  { text: "La porte est en arolle, comme le reste.", at: [0.56, 0.78] },
  { text: "Entrez, la neige reste dehors.", at: [0.82, 1] },
];

// Masques à 12° : le cartouche s'ouvre depuis le bas, en suivant la pente
const CLIP_SHUT = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
const CLIP_OPEN = "polygon(0% 22%, 100% 0%, 100% 100%, 0% 100%)";

/** Timeline scrubbée (définie hors du composant : identité stable). */
function heroTimeline(tl: gsap.core.Timeline) {
  // L'aplat-titre descend la pente et sort du cadre
  tl.to("[data-hero-band]", { yPercent: 105, duration: 0.24, ease: "power2.in" }, 0.02);
  tl.to("[data-hero-cue]", { opacity: 0, duration: 0.06 }, 0.02);

  CAPTIONS.forEach((_, i) => {
    const sel = `[data-caption="${i}"]`;
    const [a, b] = CAPTIONS[i].at;
    tl.fromTo(sel, { clipPath: CLIP_SHUT }, { clipPath: CLIP_OPEN, duration: 0.07, ease: "power2.out" }, a);
    tl.fromTo(`${sel} [data-caption-text]`, { yPercent: 60 }, { yPercent: 0, duration: 0.09, ease: "power2.out" }, a);
    // la dernière phrase reste jusqu'au chapitre suivant
    if (b < 1) tl.to(sel, { clipPath: CLIP_SHUT, duration: 0.05, ease: "power2.in" }, b - 0.05);
  });
}

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Entrée du titre, lettre par lettre (indépendante du scroll)
  useEffect(() => {
    registerGsap();
    const letters = titleRef.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (!letters) return;
    const band = document.querySelector<HTMLElement>("[data-hero-band]");
    if (!band || prefersReducedMotion()) return;
    // GSAP n'interpole pas var() : on calcule la montée de l'arête en % de l'aplat
    const rise = Math.min(((0.2126 * window.innerWidth) / band.offsetHeight) * 100, 60).toFixed(2);
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.2 })
        .fromTo(band, { clipPath: `polygon(0% ${100 + Number(rise)}%, 100% 100%, 100% 100%, 0% 100%)` }, {
          clipPath: `polygon(0% ${rise}%, 100% 0%, 100% 100%, 0% 100%)`,
          duration: 1.1,
          ease: EASE.outExpo,
        })
        .fromTo(letters, { yPercent: 110 }, { yPercent: 0, duration: DUR.title, stagger: DUR.letter, ease: EASE.outExpo }, 0.35)
        .fromTo("[data-hero-fade]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.9);
    });
    return () => ctx.revert();
  }, []);

  return (
    <ScrollSequence
      id="top"
      manifest={SEQUENCES.hero}
      length={3.4}
      stillFrame={0}
      timeline={heroTimeline}
      label="Approche du chalet L’Arolle dans la neige, à Courchevel"
      header="light"
    >
      {/* Voile haut, uniquement sous l'en-tête : lisibilité du menu sur la neige */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-granite/45 to-transparent" />

      {/* Cartouches de narration */}
      {CAPTIONS.map((c, i) => (
        <div
          key={i}
          data-caption={i}
          className="absolute right-[var(--gutter)] top-[30svh] max-w-[min(34rem,84vw)] bg-altitude px-7 pb-6 pt-12 text-snow md:top-[34svh] md:px-9 md:pb-8 md:pt-16"
          style={{ clipPath: CLIP_SHUT }}
        >
          <p data-caption-text className="display text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.02]">
            {c.text}
          </p>
        </div>
      ))}

      {/* Aplat bleu coupé à 12° : la pente qui porte le titre */}
      <div
        data-hero-band
        className="absolute inset-x-0 bottom-0 h-[56svh] bg-altitude text-snow md:h-[62svh]"
        style={{
          // montée de l'arête sur toute la largeur : tan(12°) × 100vw
          ["--band-rise" as string]: "min(calc(21.26vw), 60%)",
          clipPath: "polygon(0% var(--band-rise), 100% 0%, 100% 100%, 0% 100%)",
        }}
      >
        <div className="grain absolute inset-0" aria-hidden />
        {/* Titre et légende posés sur l'arête, parallèles à la pente */}
        <div
          className="absolute bottom-6 left-[var(--gutter)] origin-bottom-left md:bottom-8"
          style={{ transform: "rotate(var(--slope))" }}
        >
          <h1
            ref={titleRef}
            aria-label="L’Arolle, hôtel de vingt-quatre suites à Courchevel 1850"
            className="display whitespace-nowrap text-[26vw] leading-[0.8] md:text-[13.5vw]"
          >
            {Array.from(TITLE).map((ch, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.07em] align-bottom">
                <span data-letter className="inline-block will-change-transform">
                  {ch}
                </span>
              </span>
            ))}
          </h1>
          <p data-hero-fade className="caps mt-3 pl-[0.4em]">
            Courchevel 1850 · 24 suites
          </p>
        </div>
        <div className="absolute bottom-8 right-[var(--gutter)] flex flex-col items-end gap-5">
          <p data-hero-fade className="hidden max-w-[22rem] text-right text-[1.0625rem] leading-snug md:block">
            Une maison de bois d&rsquo;arolle, posée sur l&rsquo;arête au-dessus de Courchevel.
          </p>
          <p data-hero-cue data-hero-fade className="caps flex items-center gap-3" aria-hidden>
            Descendre
            <span className="relative block h-px w-10 overflow-hidden bg-snow/30">
              <span className="absolute inset-0 animate-[cue_2.4s_cubic-bezier(.65,0,.35,1)_infinite] bg-snow" />
            </span>
          </p>
        </div>
      </div>
    </ScrollSequence>
  );
}

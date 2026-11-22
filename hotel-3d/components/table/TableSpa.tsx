"use client";
/**
 * Chapitre 4 — La table et le spa.
 * La table : la salle filmée, révélée par bandes verticales alignées sur les filets.
 * Le spa : le fond passe de la neige à l'encre (le bassin est sombre), le champ
 * sombre monte depuis le bas avec le scroll ; la piscine est révélée de même.
 *
 * CONTENU DE DÉMONSTRATION : horaires, cuisine et équipements à confirmer.
 */
import { useEffect, useRef } from "react";
import LoopVideo from "@/components/ui/LoopVideo";
import ScrollWords from "@/components/ui/ScrollWords";
import StripReveal from "@/components/ui/StripReveal";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";

export default function TableSpa() {
  const spa = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = spa.current;
    const field = el?.querySelector<HTMLElement>("[data-tone-field]");
    if (!el || !field) return;
    if (prefersReducedMotion()) return;
    // le champ d'encre monte depuis le bas de la section, lié au scroll
    const ctx = gsap.context(() => {
      gsap.fromTo(
        field,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 30%", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ------------------------------ LA TABLE ------------------------------ */}
      <section id="table" data-header="dark" aria-labelledby="table-title" className="bg-snow py-[var(--section-y)] text-ink">
        <div className="grid grid-cols-4 px-[var(--gutter)] md:grid-cols-6">
          <h2 id="table-title" className="title col-span-4 text-[clamp(2.4rem,5vw,5rem)] md:col-span-4 md:col-start-2">
            Une seule salle, face à la vallée
          </h2>
        </div>

        <StripReveal strips={6} className="mx-[var(--gutter)] mt-16 aspect-[4/5] sm:aspect-[16/9]">
          <LoopVideo
            src="/video/table-salle.mp4"
            poster="/video/table-salle-poster.webp"
            label="La salle du restaurant, ses tables dressées et ses baies sur les sommets à l'heure bleue"
          />
        </StripReveal>

        <div className="mt-16 grid grid-cols-4 gap-y-10 px-[var(--gutter)] md:grid-cols-6">
          <p className="col-span-4 max-w-[46ch] text-[1.125rem] leading-relaxed text-ink/85 md:col-span-2 md:col-start-2">
            Une longue table d&rsquo;arolle et des baies sur toute la largeur. Fromages de Tarentaise, truites du lac, gibier
            en saison, pain cuit au feu de bois : le menu change avec ce que la montagne donne.
          </p>
          <dl className="caps col-span-4 grid grid-cols-[auto_1fr] content-start gap-x-8 gap-y-3 md:col-span-2 md:col-start-5">
            <dt className="text-ink/60">Dîner</dt>
            <dd>19 h 30 – 22 h 00</dd>
            <dt className="text-ink/60">Bar</dt>
            <dd>16 h 00 – minuit</dd>
          </dl>
        </div>
      </section>

      {/* ------------------------------- LE SPA ------------------------------- */}
      <section ref={spa} id="spa" data-header="ink" aria-labelledby="spa-title" className="relative isolate bg-snow py-[var(--section-y)] text-snow">
        <div data-tone-field aria-hidden className="absolute inset-0 -z-10 bg-ink" />
        <div className="grid grid-cols-4 items-center gap-y-14 px-[var(--gutter)] md:grid-cols-6">
          <StripReveal strips={2} className="col-span-4 aspect-[3/4] md:col-span-2 md:col-start-1">
            <LoopVideo
              src="/video/spa-piscine.mp4"
              poster="/video/spa-piscine-poster.webp"
              label="La piscine intérieure entre deux murs de pierre sombre, éclairée d'un trait ambré, face aux sommets"
            />
          </StripReveal>
          <div className="col-span-4 md:col-span-3 md:col-start-4">
            <ScrollWords
              as="h2"
              id="spa-title"
              dark
              className="title text-[clamp(1.9rem,3.4vw,3.4rem)]"
              text="Un couloir de pierre, une lumière posée au plafond, puis le bassin, aligné sur la vallée. On y vient après le ski, on en repart à la nuit."
            />
            <ul className="caps mt-12 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-snow/20 pt-8 text-snow/85">
              <li>Piscine intérieure</li>
              <li>Sauna d&rsquo;arolle</li>
              <li>Hammam</li>
              <li>Cabines de soin</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

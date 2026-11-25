"use client";
/**
 * Chapitre 4 — La table et l'espace détente.
 * La table : la salle filmée, révélée par bandes verticales alignées sur les filets.
 * L'espace détente : le fond passe de la pierre au vert sapin (le bassin est sombre), le champ
 * sombre monte depuis le bas avec le scroll ; la piscine est révélée de même.
 *
 * CONTENU DE DÉMONSTRATION : horaires, cuisine et équipements à confirmer.
 */
import { useEffect, useRef } from "react";
import LoopVideo from "@/components/ui/LoopVideo";
import StripReveal from "@/components/ui/StripReveal";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";

/** CONTENU DE DÉMONSTRATION : la carte est un exemple, à remplacer par celle du chef (aucun prix affiché). */
const CARTE = [
  {
    name: "Entrées",
    dishes: [
      { name: "Truite du lac, raifort et betterave", note: "Fumée au bois d’arolle, crème acidulée" },
      { name: "Velouté de potimarron", note: "Châtaigne, huile de noisette" },
      { name: "Tarte fine au beaufort", note: "Herbes des alpages, noix" },
    ],
  },
  {
    name: "Plats",
    dishes: [
      { name: "Gibier de saison", note: "Jus au genièvre, céleri rôti, airelles" },
      { name: "Féra du lac, beurre blanc", note: "Polenta crémeuse, légumes racines" },
      { name: "Risotto d’épeautre aux cèpes", note: "Vieux comté, pain cuit au feu de bois" },
    ],
  },
  {
    name: "Desserts",
    dishes: [
      { name: "Tarte aux myrtilles des alpages", note: "Crème de Tarentaise" },
      { name: "Chocolat noir, noisette", note: "Glace au lait de montagne" },
      { name: "Fromages de Tarentaise", note: "Plateau affiné, confiture de sapin" },
    ],
  },
];

const DETENTE = ["Piscine intérieure", "Sauna d’arolle", "Cabines de soin", "Hammam"];

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
        <div className="grid grid-cols-1 items-stretch gap-y-10 px-[var(--gutter)] md:grid-cols-2 md:gap-x-[var(--gutter)]">
          <StripReveal strips={4} className="aspect-[4/5] md:aspect-auto md:min-h-[82svh]">
            <LoopVideo
              src="/video/table-salle.mp4"
              poster="/video/table-salle-poster.webp"
              label="La salle du restaurant, ses tables dressées et ses baies sur les sommets à l'heure bleue"
            />
          </StripReveal>
          <div className="flex flex-col justify-center md:pl-[3vw]">
            <h2 id="table-title" className="title text-[1.35rem] md:!whitespace-nowrap md:text-[clamp(1rem,1.6vw,1.6rem)]">
              Notre restaurant vous attend
            </h2>
            <div aria-hidden className="mt-8 h-px w-20 bg-amber" />
            <p className="mt-10 max-w-[44ch] text-[1.1875rem] font-light leading-[1.8] text-ink/85">
              Une longue table d&rsquo;arolle et des baies sur toute la largeur. Fromages de Tarentaise, truites du lac, gibier
              en saison, pain cuit au feu de bois : le menu change avec ce que la montagne donne.
            </p>
            <dl className="caps mt-12 grid max-w-md grid-cols-[auto_1fr] gap-x-10 gap-y-4 border-t border-rule pt-8">
              <dt className="text-ink/60">Dîner</dt>
              <dd>19 h 30 – 22 h 00</dd>
              <dt className="text-ink/60">Bar</dt>
              <dd>16 h 00 – minuit</dd>
            </dl>
          </div>
        </div>

        {/* La carte */}
        <div className="mx-[var(--gutter)] mt-[calc(var(--section-y)*0.8)] border-t border-rule pt-12">
          <h3 className="title text-[clamp(1.6rem,2.6vw,2.6rem)]">La carte</h3>
          <div className="mt-12 grid grid-cols-1 gap-x-[var(--gutter)] gap-y-14 md:grid-cols-3">
            {CARTE.map((g) => (
              <section key={g.name} aria-label={g.name}>
                <h4 className="caps border-b border-rule pb-4 text-ink/60">{g.name}</h4>
                <ul className="mt-2 divide-y divide-[rgb(28_25_21/0.12)]">
                  {g.dishes.map((d) => (
                    <li key={d.name} className="py-5">
                      <p className="dish text-[1.375rem]">{d.name}</p>
                      <p className="mt-1.5 text-[0.9375rem] font-light leading-relaxed text-ink/65">{d.note}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- LE SPA ------------------------------- */}
      <section ref={spa} id="detente" data-header="ink" aria-labelledby="detente-title" className="relative isolate bg-snow py-[var(--section-y)] text-snow">
        <div data-tone-field aria-hidden className="absolute inset-0 -z-10 bg-pine" />
        <div className="grid grid-cols-4 items-center gap-y-14 px-[var(--gutter)] md:grid-cols-6">
          <StripReveal strips={2} start="top 65%" className="col-span-4 aspect-[3/4] md:col-span-2 md:col-start-1">
            <LoopVideo
              src="/video/spa-piscine.mp4"
              poster="/video/spa-piscine-poster.webp"
              label="La piscine intérieure entre deux murs de pierre sombre, éclairée d'un trait ambré, face aux sommets"
            />
          </StripReveal>
          <div className="col-span-4 md:col-span-3 md:col-start-4">
            <h2 id="detente-title" className="title text-[1.8rem] md:!whitespace-nowrap md:text-[clamp(1.6rem,3vw,3rem)]">
              L’espace détente
            </h2>
            <ul className="mt-12 border-t border-snow/20">
              {DETENTE.map((x) => (
                <li key={x} className="dish border-b border-snow/20 py-6 text-[clamp(1.5rem,2.4vw,2.2rem)] tracking-[0.04em]">
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";
/**
 * Chapitre 4 — La table et le spa.
 * Le fond change de matière d'une section à l'autre : neige → bleu d'altitude
 * (la salle à l'heure bleue) → pierre sombre (le spa) → neige.
 * Les deux vidéos sont cadrées comme dans les plans d'origine : en perspective
 * centrale, dans une « baie » qui s'ouvre à mesure qu'on s'en approche.
 *
 * CONTENU DE DÉMONSTRATION : horaires, cuisine et équipements à confirmer.
 */
import { useEffect, useRef } from "react";
import LoopVideo from "@/components/ui/LoopVideo";
import RevealLines from "@/components/ui/RevealLines";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { slopeRise, slopeShut } from "@/lib/slope";

export default function TableSpa() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      // 1. Changement de matière : le champ de la section (bleu, puis pierre)
      //    monte en biseau à 12° par-dessus le précédent, lié au scroll.
      el.querySelectorAll<HTMLElement>("[data-tone-field]").forEach((f) => {
        const sec = f.parentElement!;
        if (reduced) return gsap.set(f, { clipPath: "none" });
        gsap.fromTo(
          f,
          { clipPath: () => slopeShut(slopeRise(f, 400)) },
          {
            clipPath: () => `polygon(0% 0%, 100% ${(-slopeRise(f, 400)).toFixed(2)}%, 100% 100%, 0% 100%)`,
            ease: "none",
            scrollTrigger: { trigger: sec, start: "top bottom", end: "top 35%", scrub: true, invalidateOnRefresh: true },
          },
        );
      });

      if (reduced) return;

      // 2. La baie s'ouvre : on « avance » vers la fenêtre du restaurant
      gsap.fromTo(
        "[data-baie]",
        { clipPath: "inset(14% 22% 14% 22%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: "[data-baie]", start: "top 90%", end: "top 10%", scrub: true },
        },
      );
      gsap.fromTo(
        "[data-baie] video, [data-baie] img",
        { scale: 1.18 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-baie]", start: "top 90%", end: "bottom top", scrub: true } },
      );

      // 3. Spa : le cadre vertical monte plus lentement que le texte (parallaxe)
      gsap.fromTo(
        "[data-spa-frame]",
        { yPercent: 8 },
        { yPercent: -8, ease: "none", scrollTrigger: { trigger: "[data-spa]", start: "top bottom", end: "bottom top", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="bg-snow">
      {/* ------------------------------ LA TABLE ------------------------------ */}
      <section id="table" data-header="light" aria-labelledby="table-title" className="relative isolate pb-[var(--section-y)] pt-[var(--section-y)] text-snow">
        <div data-tone-field aria-hidden className="absolute inset-0 -z-10 bg-altitude" />
        <div className="mx-auto max-w-[1600px] px-[var(--gutter)] text-center">
          <RevealLines
            as="h2"
            id="table-title"
            lines={["La table regarde", "la vallée."]}
            lineClass={(i) => (i === 1 ? "italic" : "")}
            className="display mx-auto text-[clamp(2.75rem,8vw,7.5rem)]"
          />
          <p className="mx-auto mt-8 max-w-[44ch] text-[1.125rem] leading-relaxed opacity-85">
            Une seule salle, une longue table d&rsquo;arolle et des baies sur toute la largeur. Le soir, la vallée s&rsquo;allume
            pendant qu&rsquo;on dîne.
          </p>
        </div>

        {/* La baie : perspective centrale, comme le plan d'origine */}
        <div className="mx-auto mt-[clamp(56px,9vh,120px)] max-w-[1600px] px-[var(--gutter)]">
          <div data-baie className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
            <LoopVideo
              src="/video/table-salle.mp4"
              poster="/video/table-salle-poster.webp"
              label="La salle du restaurant, ses tables dressées et ses baies sur les sommets à l'heure bleue"
            />
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-[1600px] gap-10 px-[var(--gutter)] md:grid-cols-12">
          <div className="md:col-span-5 md:col-start-2">
            <RevealLines
              as="h3"
              lines={["Cuisine de montagne,", "produits des alpages."]}
              className="display text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.05]"
            />
          </div>
          <div className="md:col-span-4 md:col-start-8">
            <p className="max-w-[38ch] leading-relaxed opacity-85">
              Fromages de Tarentaise, truites du lac, gibier en saison et pain cuit au feu de bois. Le menu change avec ce que
              la montagne donne.
            </p>
            <dl className="caps mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
              <dt className="opacity-60">Dîner</dt>
              <dd>19 h 30 – 22 h 00</dd>
              <dt className="opacity-60">Bar</dt>
              <dd>16 h 00 – minuit</dd>
            </dl>
            <a href="#reserver" className="caps link-line mt-10 inline-block">
              Réserver une table
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------- LE SPA ------------------------------- */}
      <section
        id="spa"
        data-spa
        data-header="light"
        aria-labelledby="spa-title"
        className="relative isolate overflow-hidden bg-altitude pb-[var(--section-y)] pt-[calc(var(--section-y)*0.6)] text-[#efe9e2]"
      >
        <div data-tone-field aria-hidden className="absolute inset-0 -z-10 bg-[#24211f]" />
        <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-[var(--gutter)] md:grid-cols-12">
          {/* Cadre vertical : la piscine en perspective centrale, recadrée en hauteur */}
          <div data-spa-frame className="relative aspect-[3/4] w-full overflow-hidden md:col-span-5">
            <LoopVideo
              src="/video/spa-piscine.mp4"
              poster="/video/spa-piscine-poster.webp"
              label="La piscine intérieure entre deux murs de pierre sombre, éclairée d'un trait ambré, face aux sommets"
            />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <RevealLines
              as="h2"
              id="spa-title"
              lines={["L’eau, la pierre,", "et rien d’autre."]}
              lineClass={(i) => (i === 1 ? "italic" : "")}
              className="display text-[clamp(2.5rem,6vw,5.5rem)]"
            />
            <p className="mt-8 max-w-[46ch] text-[1.125rem] leading-relaxed opacity-85 md:hidden">
              Un couloir de pierre, une lumière posée au plafond, puis le bassin, aligné sur la vallée. On y vient après le
              ski, on en repart à la nuit.
            </p>
            <RevealLines
              lines={[
                "Un couloir de pierre, une lumière posée au plafond,",
                "puis le bassin, aligné sur la vallée.",
                "On y vient après le ski, on en repart à la nuit.",
              ]}
              delay={0.2}
              className="mt-8 hidden max-w-[46ch] text-[1.125rem] leading-relaxed opacity-85 md:block"
            />
            <ul className="caps mt-10 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-[#efe9e2]/20 pt-8">
              <li>Piscine intérieure</li>
              <li>Sauna d&rsquo;arolle</li>
              <li>Hammam</li>
              <li>Cabines de soin</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

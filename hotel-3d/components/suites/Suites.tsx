"use client";
/**
 * Chapitre 3 — Les suites.
 * La visite (séquence d'images) défile avec le scroll ; chaque tiers de la
 * vidéo correspond à une suite. Un panneau couleur neige, coupé à 12°, change
 * de suite au fil de la visite : nom, surface, ce qu'on y trouve, réservation.
 *
 * CONTENU DE DÉMONSTRATION : noms, surfaces et équipements sont à remplacer
 * par ceux de l'hôtel (aucun tarif n'est affiché).
 */
import ScrollSequence from "@/components/sequence/ScrollSequence";
import { SEQUENCES } from "@/lib/sequences";
import type { gsap } from "@/lib/motion";

const SUITES = [
  {
    name: "Suite Arête",
    size: "48 m²",
    lines: ["Vue sur la Saulire", "Lit de 200, cheminée", "Douche à l’italienne"],
  },
  {
    name: "Suite Combe",
    size: "62 m²",
    lines: ["Salon et poêle à bois", "Baignoire en pierre", "Balcon plein sud"],
  },
  {
    name: "Suite Cembro",
    size: "85 m²",
    lines: ["Deux niveaux sous la charpente", "Cheminée et bibliothèque", "Terrasse sur les pistes"],
  },
];

/** Chaque suite occupe un tiers ; les panneaux se relaient sans blanc. */
function suitesTimeline(tl: gsap.core.Timeline) {
  tl.fromTo("[data-suites-intro]", { opacity: 1, y: 0 }, { opacity: 0, y: -24, duration: 0.06 }, 0.03);
  tl.fromTo("[data-suites-panel]", { yPercent: 110 }, { yPercent: 0, duration: 0.1, ease: "power3.out" }, 0.08);
  SUITES.forEach((_, i) => {
    const sel = `[data-suite="${i}"] [data-rise]`;
    const start = i / SUITES.length;
    if (i > 0) tl.fromTo(sel, { yPercent: 110 }, { yPercent: 0, duration: 0.06, stagger: 0.012, ease: "power3.out" }, start + 0.01);
    if (i < SUITES.length - 1)
      tl.to(sel, { yPercent: -110, duration: 0.05, stagger: 0.01, ease: "power2.in" }, start + 1 / SUITES.length - 0.05);
    tl.to("[data-suite-index]", { yPercent: (-100 / SUITES.length) * i, duration: 0.05, ease: "power3.inOut" }, Math.max(start - 0.03, 0));
  });
}

export default function Suites() {
  return (
    <ScrollSequence
      id="suites"
      manifest={SEQUENCES.suites}
      length={5}
      stillFrame={0}
      timeline={suitesTimeline}
      label="Visite des suites : chambre sous la charpente, salon et poêle à bois, cheminée"
      header="light"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-granite/45 to-transparent" />

      <h2
        data-suites-intro
        className="display absolute left-[var(--gutter)] top-[18svh] max-w-[12ch] text-[clamp(2.75rem,7vw,6.5rem)] text-snow"
        style={{ textShadow: "0 2px 24px rgba(18,20,23,.35)" }}
      >
        Vingt-quatre suites, aucune pareille.
      </h2>

      {/* Panneau neige coupé à 12° */}
      <div
        data-suites-panel
        className="absolute bottom-0 left-0 w-full bg-snow px-[var(--gutter)] pb-8 pt-[clamp(72px,9vw,128px)] text-granite md:w-[min(46rem,56vw)] md:pb-12"
        style={{ clipPath: "polygon(0 calc(min(9vw,128px) * 0.6), 100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="flex items-baseline justify-between">
          <p className="caps text-granite/70">
            Suite{" "}
            <span className="relative inline-block h-[1.2em] overflow-hidden tabular-nums" style={{ verticalAlign: "-0.28em" }}>
              <span data-suite-index className="flex flex-col">
                {SUITES.map((_, i) => (
                  <span key={i} className="block h-[1.2em] leading-[1.2em]">
                    {i + 1}
                  </span>
                ))}
              </span>
            </span>{" "}
            sur {SUITES.length}
          </p>
          <a href="#reserver" className="caps link-line">
            Toutes les suites
          </a>
        </div>

        {/* Les trois suites, superposées ; la timeline fait passer de l'une à l'autre */}
        <div className="relative mt-6 h-[clamp(220px,30svh,300px)] motion-reduce:h-auto motion-reduce:space-y-8">
          {SUITES.map((s, i) => (
            <article key={s.name} data-suite={i} className="absolute inset-0 motion-reduce:static" aria-label={`${s.name}, ${s.size}`}>
              <div className="overflow-hidden">
                <h3 data-rise className="display text-[clamp(2.5rem,5.2vw,4.75rem)] text-altitude">
                  {s.name}
                </h3>
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr] items-start gap-x-8">
                <div className="overflow-hidden">
                  <p data-rise className="caps pt-1">
                    {s.size}
                  </p>
                </div>
                <ul className="space-y-1">
                  {s.lines.map((l) => (
                    <li key={l} className="overflow-hidden">
                      <span data-rise className="block">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <a href="#reserver" className="btn-slope caps mt-2">
          Réserver une suite
        </a>
      </div>
    </ScrollSequence>
  );
}

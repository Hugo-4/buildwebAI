"use client";
/**
 * Chapitre 3 — Les suites.
 * La visite (séquence d'images) défile avec le scroll ; chaque tiers de la
 * vidéo correspond à une suite. Un panneau couleur neige change
 * de suite au fil de la visite : nom, surface, ce qu'on y trouve, réservation.
 *
 * CONTENU DE DÉMONSTRATION : noms, surfaces et équipements sont à remplacer
 * par ceux de l'hôtel (aucun tarif n'est affiché).
 */
import Image from "next/image";
import ScrollSequence from "@/components/sequence/ScrollSequence";
import { useReducedMotion } from "@/lib/useMedia";
import { SEQUENCES } from "@/lib/sequences";
import type { gsap } from "@/lib/motion";

const SUITES = [
  {
    still: "/images/suite-fenetre-sommets.webp",
    alt: "Suite Arête : baie ouverte sur les sommets, baignoire en pierre",
    name: "Suite Arête",
    size: "40 m²",
    lines: ["Baie ouverte sur les sommets", "Baignoire en pierre, cheminée", "Lit de 200, bois d’arolle"],
  },
  {
    still: "/images/suite-cheminee-suspendue.webp",
    alt: "Suite Lauze : cheminée suspendue et lit face à la vallée",
    name: "Suite Lauze",
    size: "45 m²",
    lines: ["Cheminée suspendue", "Baignoire face à la vallée", "Plein sud, soleil du matin"],
  },
  {
    still: "/images/suite-baignoire-vue.webp",
    alt: "Suite Combe : baignoire en pierre devant la baie, sommets au soleil",
    name: "Suite Combe",
    size: "70 m²",
    lines: ["Salon et cheminée suspendue", "Baignoire en pierre face aux sommets", "Balcon filant plein sud"],
  },
  {
    still: "/images/lieu-terrasse-bain-nordique.webp",
    alt: "Suite Cembro : terrasse et bain nordique à l'heure bleue",
    name: "Suite Cembro",
    size: "120 m²",
    lines: ["Duplex sous la charpente", "Feu ouvert, chambre en mezzanine", "Terrasse et bain nordique"],
  },
];

/**
 * Chaque suite occupe une part égale. Le passage est net : la suite sortante a
 * fini de partir (lignes d'abord, titre en dernier) avant que l'entrante monte ;
 * le compteur tourne exactement à la frontière.
 */
function suitesTimeline(tl: gsap.core.Timeline) {
  const part = 1 / SUITES.length;
  tl.fromTo("[data-suites-intro]", { opacity: 1, y: 0 }, { opacity: 0, y: -24, duration: 0.05 }, 0.02);
  tl.fromTo("[data-suites-panel]", { yPercent: 110 }, { yPercent: 0, duration: 0.08, ease: "power3.out" }, 0.06);
  SUITES.forEach((_, i) => {
    const sel = `[data-suite="${i}"] [data-rise]`;
    const start = i * part;
    if (i > 0) tl.fromTo(sel, { yPercent: 110 }, { yPercent: 0, duration: 0.04, stagger: 0.006, ease: "power3.out" }, start - 0.02);
    if (i < SUITES.length - 1)
      tl.to(sel, { yPercent: -110, duration: 0.035, stagger: { each: 0.004, from: "end" }, ease: "power2.in" }, start + part - 0.06);
    if (i > 0) tl.to("[data-suite-index]", { yPercent: (-100 / SUITES.length) * i, duration: 0.02, ease: "power3.inOut" }, start - 0.02);
  });
}

/** Mouvement réduit : les quatre suites à plat, chacune avec son image. */
function StaticSuites() {
  return (
    <section id="suites" data-header="dark" aria-labelledby="suites-title" className="bg-snow py-[var(--section-y)] text-ink">
      <h2 id="suites-title" className="title px-[var(--gutter)] text-[clamp(2.5rem,5.6vw,5.5rem)]">
        Vingt-quatre suites, aucune pareille.
      </h2>
      <div className="mt-14 grid gap-x-[var(--gutter)] gap-y-16 px-[var(--gutter)] md:grid-cols-2">
        {SUITES.map((s) => (
          <article key={s.name}>
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src={s.still} alt={s.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <h3 className="label mt-6 text-[clamp(2rem,3.4vw,3.25rem)]">
              <span className="swash">{s.name}</span>
            </h3>
            <p className="caps mt-3">{s.size}</p>
            <ul className="mt-3 space-y-1">
              {s.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-14 px-[var(--gutter)]">
        <a href="#reserver" className="btn caps">
          Réserver une suite
        </a>
      </div>
    </section>
  );
}

export default function Suites() {
  const reduced = useReducedMotion();
  if (reduced) return <StaticSuites />;
  return (
    <ScrollSequence
      id="suites"
      manifest={SEQUENCES.suites}
      length={7}
      portraitBox={0.5}
      bg="#f7f7f5"
      stillFrame={0}
      timeline={suitesTimeline}
      label="Visite de quatre suites, de la suite Arête à la suite Cembro et sa terrasse au bain nordique"
      header="light"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/40 to-transparent" />

      <h2
        data-suites-intro
        className="title absolute left-[var(--gutter)] top-[20svh] max-w-[14ch] text-[clamp(2.5rem,5.6vw,5.5rem)] text-snow"
        style={{ textShadow: "0 2px 30px rgba(21,25,29,.35)" }}
      >
        Vingt-quatre suites, aucune pareille.
      </h2>

      {/* Panneau neige, en pied d'écran */}
      <div
        data-suites-panel
        className="absolute bottom-0 left-0 w-full border-t border-rule bg-snow px-[var(--gutter)] pb-24 pt-10 text-ink md:bottom-[var(--gutter)] md:left-[var(--gutter)] md:w-[min(40rem,48vw)] md:border-0 md:px-10 md:pb-10"
      >
        {/* Les trois suites, superposées ; la timeline fait passer de l'une à l'autre */}
        <div className="relative h-[clamp(200px,28svh,280px)]">
          {SUITES.map((s, i) => (
            <article key={s.name} data-suite={i} className="absolute inset-0" aria-label={`${s.name}, ${s.size}`}>
              <div className="overflow-hidden">
                <h3 data-rise className="label text-[clamp(2.4rem,4.4vw,4rem)] leading-[1.05]">
                  <span className="swash">{s.name}</span>
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

        <div className="mt-2 flex flex-wrap items-center justify-between gap-6">
          <a href="#reserver" className="btn caps">
            Réserver une suite
          </a>
          <p className="caps flex items-baseline gap-5 text-ink/70">
            <span>
              <span className="relative inline-block h-[1.2em] overflow-hidden tabular-nums" style={{ verticalAlign: "-0.28em" }}>
                <span data-suite-index className="flex flex-col">
                  {SUITES.map((_, i) => (
                    <span key={i} className="block h-[1.2em] leading-[1.2em]">
                      {i + 1}
                    </span>
                  ))}
                </span>
              </span>{" "}
              / {SUITES.length}
            </span>
            <a href="#reserver" className="link-line text-ink">
              Toutes les suites
            </a>
          </p>
        </div>
      </div>
    </ScrollSequence>
  );
}

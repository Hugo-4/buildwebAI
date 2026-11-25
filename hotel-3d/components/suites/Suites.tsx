"use client";
/**
 * Chapitre 3 — Les suites.
 * Un seul bloc de quatre cases (2 × 2) : chaque suite est une image que l'on
 * visite en la gardant sous le doigt. Aucun scroll n'est imposé : la page
 * défile normalement.
 *
 * - Souris : survoler lit la visite ; cliquer la verrouille (re-cliquer l'arrête).
 * - Tactile : maintenir appuyé lit la visite, relâcher l'arrête. Faire glisser le
 *   doigt pour défiler annule la lecture (la page garde la main).
 * - Clavier : Entrée ou Espace lit / arrête.
 * - Mouvement réduit : jamais de lecture au survol, seulement sur action explicite.
 *
 * CONTENU DE DÉMONSTRATION : noms, surfaces et équipements sont à remplacer
 * par ceux de l'hôtel (aucun tarif n'est affiché).
 */
import { useEffect, useRef, useState } from "react";
import RevealLines from "@/components/ui/RevealLines";
import { useReducedMotion } from "@/lib/useMedia";

const SUITES = [
  {
    id: "arete",
    name: "Suite Arête",
    size: "40 m²",
    lines: ["Baie ouverte sur les sommets", "Baignoire en pierre, cheminée", "Lit de 200, bois d’arolle"],
  },
  {
    id: "lauze",
    name: "Suite Lauze",
    size: "45 m²",
    lines: ["Cheminée suspendue", "Baignoire face à la vallée", "Plein sud, soleil du matin"],
  },
  {
    id: "combe",
    name: "Suite Combe",
    size: "70 m²",
    lines: ["Salon et cheminée suspendue", "Baignoire en pierre face aux sommets", "Balcon filant plein sud"],
  },
  {
    id: "cembro",
    name: "Suite Cembro",
    size: "120 m²",
    lines: ["Duplex sous la charpente", "Feu ouvert, chambre en mezzanine", "Terrasse et bain nordique"],
  },
];

type Suite = (typeof SUITES)[number];

function SuiteCard({ suite, reduced }: { suite: Suite; reduced: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const lastType = useRef<string>("mouse");
  const [armed, setArmed] = useState(false); // la vidéo ne se télécharge qu'à l'approche
  const [hover, setHover] = useState(false); // souris au-dessus
  const [held, setHeld] = useState(false); // doigt appuyé
  const [locked, setLocked] = useState(false); // clic ou clavier
  const [started, setStarted] = useState(false); // la vidéo remplace l'affiche au premier lancement
  const active = hover || held || locked;

  // On prépare la vidéo quand la carte approche de l'écran
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setArmed(true), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Lecture / pause selon l'état
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active) {
      setArmed(true);
      setStarted(true);
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, armed]);

  const progress = () => {
    const v = video.current;
    if (v && bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
  };

  return (
    <article aria-label={`${suite.name}, ${suite.size}`} className="min-w-0">
      <div ref={box} className="relative aspect-[3/4] overflow-hidden bg-ink sm:aspect-[4/3]">
        <button
          type="button"
          aria-pressed={locked}
          aria-label={`Visiter la ${suite.name.toLowerCase()} en vidéo`}
          className="absolute inset-0 z-10 block h-full w-full cursor-pointer select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]"
          onPointerEnter={(e) => {
            lastType.current = e.pointerType;
            if (e.pointerType === "mouse" && !reduced) setHover(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setHover(false);
          }}
          onPointerDown={(e) => {
            lastType.current = e.pointerType;
            if (e.pointerType !== "mouse") setHeld(true);
          }}
          // pointercancel : le navigateur a repris le geste pour faire défiler la page
          onPointerUp={(e) => e.pointerType !== "mouse" && setHeld(false)}
          onPointerCancel={() => setHeld(false)}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => {
            // un appui tactile court ne verrouille rien : seul le maintien lit la visite
            if (e.detail !== 0 && lastType.current !== "mouse") return;
            setLocked((l) => !l);
          }}
        >
          <span className="sr-only">Maintenir ou cliquer pour lancer la visite, de nouveau pour l’arrêter.</span>
        </button>

        {/* Affiche : chargée à la demande (lazy), pour ne pas concurrencer l'image du hero */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/video/suite-${suite.id}-poster.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={video}
          src={armed ? `/video/suite-${suite.id}.mp4` : undefined}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onTimeUpdate={progress}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${started ? "opacity-100" : "opacity-0"}`}
        />

        {/* Invitation : disparaît pendant la visite */}
        <span
          aria-hidden
          className={`caps pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 bg-snow/90 px-3 py-2 text-ink transition-opacity duration-300 ${
            active ? "opacity-0" : "opacity-100"
          }`}
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="currentColor">
            <path d="M2 1l7 4-7 4z" />
          </svg>
          <span className="hidden sm:inline [@media(hover:none)]:hidden">Survoler pour visiter</span>
          <span className="hidden [@media(hover:none)]:inline">
            Maintenir<span className="hidden sm:inline"> pour visiter</span>
          </span>
          <span className="sm:hidden [@media(hover:none)]:hidden">Visiter</span>
        </span>

        {/* Avancement de la visite */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-snow/25">
          <span ref={bar} className="block h-full origin-left scale-x-0 bg-snow" />
        </span>
      </div>

      <div className="pt-5">
        <h3 className="label text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[1.05]">
          <span className="swash">{suite.name}</span>
        </h3>
        <p className="caps mt-4 text-ink/70">{suite.size}</p>
        <ul className="mt-3 hidden space-y-1 text-[0.9375rem] text-ink/85 sm:block">
          {suite.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Suites() {
  const reduced = useReducedMotion();
  return (
    <section id="suites" data-header="dark" aria-labelledby="suites-title" className="bg-snow pb-[var(--section-y)] pt-36 text-ink">
      <div className="flex flex-col gap-3 px-[var(--gutter)] md:flex-row md:items-baseline md:justify-between md:gap-10">
        <RevealLines
          as="h2"
          id="suites-title"
          lines={["Vingt-quatre suites, aucune pareille"]}
          className="title text-[clamp(1.05rem,1.9vw,1.9rem)] md:!whitespace-nowrap"
        />
        <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink/70 md:text-right">
          Survolez une image, ou gardez le doigt dessus, pour visiter la suite.
        </p>
      </div>

      <div className="mx-[var(--gutter)] mt-8 grid grid-cols-2 gap-x-1 gap-y-12 sm:gap-x-3">
        {SUITES.map((s) => (
          <SuiteCard key={s.id} suite={s} reduced={reduced} />
        ))}
      </div>

      <div className="mx-[var(--gutter)] mt-16">
        <a href="#reserver" className="btn caps">
          Réserver une suite
        </a>
      </div>
    </section>
  );
}

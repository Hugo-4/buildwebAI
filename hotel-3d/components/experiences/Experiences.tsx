"use client";
/**
 * Chapitre 5 — Les expériences.
 * Un accordéon de bandes verticales, SANS épinglage : la page défile librement par-dessus.
 * La bande survolée (ou cliquée, ou atteinte au clavier) s'ouvre ; les autres se resserrent
 * sous un voile de neige. Téléphone ou mouvement réduit : une rangée d'images à faire
 * glisser au doigt.
 */
import Image from "next/image";
import { useRef, useState } from "react";
import { EXPERIENCES } from "./data";
import { useLiteMode, useReducedMotion } from "@/lib/useMedia";
import { setCursorLabel } from "@/components/ui/Cursor";

export default function Experiences() {
  const lite = useLiteMode();
  const reduced = useReducedMotion();
  return (
    <section id="experiences" data-header="dark" aria-labelledby="exp-title" className="relative bg-snow text-ink">
      {lite || reduced ? <FlatGallery /> : <Accordion />}
    </section>
  );
}

function Heading() {
  return (
    <div className="grid grid-cols-4 px-[var(--gutter)] md:grid-cols-6">
      <h2 id="exp-title" className="title col-span-4 text-[clamp(2.2rem,4.4vw,4.4rem)] md:col-span-4 md:col-start-2">
        Ce qu&rsquo;on fait ici
      </h2>
    </div>
  );
}

function Accordion() {
  const [active, setActive] = useState(0);
  const lastSwitch = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  /** Survol volontaire seulement : un vrai mouvement du pointeur, hors transition en cours
   *  (les bandes qui s'élargissent ne doivent pas se rouvrir toutes seules). */
  const tryHover = (i: number, e: React.PointerEvent) => {
    const moved = Math.abs(e.clientX - lastPos.current.x) + Math.abs(e.clientY - lastPos.current.y) > 4;
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (!moved || i === active || performance.now() - lastSwitch.current < 700) return;
    lastSwitch.current = performance.now();
    setActive(i);
  };

  return (
    <div className="flex flex-col gap-12 py-[var(--section-y)]">
      <Heading />
      <ul className="mx-[var(--gutter)] flex h-[62svh] gap-1" aria-label="Expériences" onPointerLeave={() => setCursorLabel(null)}>
        {EXPERIENCES.map((x, i) => {
          const open = i === active;
          return (
            <li
              key={x.title}
              className="relative overflow-hidden transition-[flex-grow] duration-[900ms] ease-out-expo"
              style={{ flexGrow: open ? 7 : 1, flexBasis: 0 }}
              onPointerMove={(e) => {
                tryHover(i, e);
                setCursorLabel(open ? null : "Ouvrir");
              }}
            >
              <button
                type="button"
                className="absolute inset-0 z-10 text-left"
                aria-expanded={open}
                aria-label={`${x.title} : ${x.text}`}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              />
              <Image src={x.image} alt={x.alt} fill sizes="(max-width: 1200px) 70vw, 60vw" className="object-cover" />
              {/* bandes fermées : un voile de neige (opacité seule, rien à recalculer) */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 bg-snow transition-opacity duration-700 ${open ? "opacity-0" : "opacity-45"}`}
              />
              <div
                className={`pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/75 via-ink/5 to-ink/25 p-6 text-snow transition-opacity duration-500 md:p-8 ${
                  open ? "opacity-100 delay-300" : "opacity-0"
                }`}
                aria-hidden
              >
                <p className="label text-[clamp(1.8rem,2.6vw,2.6rem)] leading-[1.05]">{x.title}</p>
                <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed">{x.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FlatGallery() {
  return (
    <div className="py-[var(--section-y)]">
      <Heading />
      <ul className="mt-12 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none]" aria-label="Expériences">
        {EXPERIENCES.map((x) => (
          <li key={x.title} className="w-[78vw] max-w-[22rem] shrink-0 snap-start">
            <figure>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src={x.image} alt={x.alt} fill sizes="78vw" className="object-cover" />
              </div>
              <figcaption className="mt-4">
                <span className="label block text-[1.75rem]">{x.title}</span>
                <span className="mt-2 block text-ink/80">{x.text}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

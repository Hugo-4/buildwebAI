"use client";
/**
 * Chapitre 5 — Les expériences.
 * Un accordéon de bandes verticales : la section reste épinglée, et l'expérience
 * en cours s'ouvre sur toute la largeur tandis que les autres restent étroites et
 * floues. Le scroll fait passer de l'une à l'autre ; le survol ou le clavier
 * ouvrent une bande directement. Téléphone ou mouvement réduit : une rangée
 * d'images à faire défiler au doigt.
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EXPERIENCES } from "./data";
import { registerGsap, ScrollTrigger } from "@/lib/motion";
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
      <p className="label col-span-4 text-[1.0625rem] md:col-span-1 md:col-start-2 md:pt-2">
        <span className="swash">Expériences</span>
      </p>
      <h2 id="exp-title" className="title col-span-4 mt-6 text-[clamp(2.2rem,4.4vw,4.4rem)] md:col-span-3 md:col-start-3 md:mt-0">
        Ce qu&rsquo;on fait ici
      </h2>
    </div>
  );
}

function Accordion() {
  const root = useRef<HTMLDivElement>(null);
  const [scrollActive, setScrollActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? scrollActive;

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setScrollActive(Math.min(EXPERIENCES.length - 1, Math.floor(self.progress * EXPERIENCES.length))),
    });
    return () => st.kill();
  }, []);

  return (
    <div ref={root} style={{ height: `${EXPERIENCES.length * 70 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-10 pt-24">
        <Heading />
        <ul
          className="mx-[var(--gutter)] flex h-[62svh] gap-1"
          aria-label="Expériences"
          onPointerLeave={() => {
            setHover(null);
            setCursorLabel(null);
          }}
        >
          {EXPERIENCES.map((x, i) => {
            const open = i === active;
            return (
              <li
                key={x.title}
                className="relative overflow-hidden transition-[flex-grow] duration-[900ms] ease-out-expo"
                style={{ flexGrow: open ? 7 : 1, flexBasis: 0 }}
                onPointerEnter={() => {
                  setHover(i);
                  setCursorLabel(open ? null : "Ouvrir");
                }}
              >
                <button
                  type="button"
                  className="absolute inset-0 z-10 text-left"
                  aria-expanded={open}
                  aria-label={`${x.title} : ${x.text}`}
                  onFocus={() => setHover(i)}
                  onClick={() => setHover(i)}
                />
                <Image
                  src={x.image}
                  alt={x.alt}
                  fill
                  sizes="(max-width: 1200px) 70vw, 60vw"
                  className={`object-cover transition-[filter,transform] duration-[900ms] ease-out-expo ${open ? "scale-100 blur-0" : "scale-110 blur-[6px]"}`}
                />
                <div
                  className={`pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/55 via-transparent to-ink/25 p-6 text-snow transition-opacity duration-500 md:p-8 ${
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

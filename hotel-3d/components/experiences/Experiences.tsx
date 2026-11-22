"use client";
/**
 * Chapitre 5 — Les expériences.
 * Ordinateur : section épinglée, la galerie 3D tourne avec le scroll ; la liste
 * à gauche suit la carte de face. Mobile, tactile ou mouvement réduit : une
 * rangée horizontale à faire défiler au doigt, sans WebGL.
 */
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EXPERIENCES } from "./data";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/motion";
import { useLiteMode, useReducedMotion } from "@/lib/useMedia";
import { setCursorLabel } from "@/components/ui/Cursor";

const ExperienceRing = dynamic(() => import("./ExperienceRing"), { ssr: false });

export default function Experiences() {
  const lite = useLiteMode();
  const reduced = useReducedMotion();

  return (
    <section
      id="experiences"
      data-header="dark"
      aria-labelledby="exp-title"
      className="relative bg-snow text-granite"
    >
      {lite ? <FlatGallery /> : reduced ? <StaticGallery /> : <RingGallery />}
    </section>
  );
}

function Heading() {
  return (
    <h2 id="exp-title" className="display text-[clamp(2.5rem,5.6vw,5.25rem)]">
      Ce qu&rsquo;on fait
      <br />
      <span className="italic text-altitude">ici.</span>
    </h2>
  );
}

function RingGallery() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const velocity = useRef(0);
  const [active, setActive] = useState(0);
  const [mount, setMount] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    // la scène n'est chargée qu'à l'approche de la section
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "200% 0px" });
    io.observe(el);
    const vis = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    vis.observe(el);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress.current = self.progress;
        velocity.current = self.getVelocity();
        setActive(Math.round(self.progress * (EXPERIENCES.length - 1)));
      },
    });
    // la vitesse retombe quand on s'arrête (rien à faire une fois retombée)
    const decay = () => {
      if (Math.abs(velocity.current) > 1) velocity.current *= 0.9;
    };
    gsap.ticker.add(decay);
    return () => {
      io.disconnect();
      vis.disconnect();
      st.kill();
      gsap.ticker.remove(decay);
    };
  }, []);

  const e = EXPERIENCES[active];

  return (
    <div ref={root} style={{ height: `${EXPERIENCES.length * 75}vh` }}>
      <div className="sticky top-0 grid h-[100svh] grid-cols-12 items-center gap-x-[var(--gutter)] overflow-hidden px-[var(--gutter)]">
        <div className="relative z-10 col-span-4">
          <Heading />
          <ol className="mt-12 space-y-3" aria-label="Expériences">
            {EXPERIENCES.map((x, i) => (
              <li key={x.title} className="flex items-baseline gap-4">
                <span
                  aria-hidden
                  className="block h-px bg-amber transition-[width] duration-500 ease-out-expo"
                  style={{ width: i === active ? 40 : 0 }}
                />
                <span
                  className={`text-[1.125rem] transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-60"}`}
                  aria-current={i === active ? "true" : undefined}
                >
                  {x.title}
                </span>
              </li>
            ))}
          </ol>
          <p key={active} className="mt-10 max-w-[30ch] animate-[fadeUp_.6s_cubic-bezier(.16,1,.3,1)] leading-relaxed text-granite/80" aria-live="polite">
            {e.text}
          </p>
        </div>
        <div
          className="absolute inset-0 left-[24%]"
          onPointerLeave={() => setCursorLabel(null)}
        >
          {/* affiche de la carte de face, sous le canvas, jusqu'à la 1re image rendue */}
          <div
            aria-hidden
            className={`pointer-events-none absolute left-1/2 top-1/2 aspect-[3/4] w-[min(26vw,22rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
          >
            <Image src={e.image} alt="" fill sizes="26vw" className="object-cover" />
          </div>
          {mount && (
            <ExperienceRing
              active={onScreen}
              progress={progress}
              velocity={velocity}
              onReady={() => setReady(true)}
              onHover={(i) => setCursorLabel(i === null ? null : "Découvrir")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FlatGallery() {
  return (
    <div className="py-[var(--section-y)]">
      <div className="px-[var(--gutter)]">
        <Heading />
      </div>
      <ul className="mt-10 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none]" aria-label="Expériences">
        {EXPERIENCES.map((x) => (
          <li key={x.title} className="w-[76vw] max-w-[22rem] shrink-0 snap-start">
            <figure>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src={x.image} alt={x.alt} fill sizes="76vw" className="object-cover" />
              </div>
              <figcaption className="mt-4">
                <span className="display block text-[1.75rem]">{x.title}</span>
                <span className="mt-2 block text-granite/80">{x.text}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mouvement réduit sur grand écran : la liste, et une seule image (celle choisie). */
function StaticGallery() {
  const [i, setI] = useState(0);
  const x = EXPERIENCES[i];
  return (
    <div className="grid min-h-[100svh] grid-cols-12 items-center gap-x-[var(--gutter)] px-[var(--gutter)] py-[var(--section-y)]">
      <div className="col-span-5">
        <Heading />
        <ul className="mt-12 space-y-3" aria-label="Expériences">
          {EXPERIENCES.map((e, k) => (
            <li key={e.title}>
              <button
                type="button"
                aria-pressed={k === i}
                onClick={() => setI(k)}
                onFocus={() => setI(k)}
                onPointerEnter={() => setI(k)}
                className={`text-left text-[1.125rem] ${k === i ? "opacity-100" : "opacity-60"}`}
              >
                {e.title}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-[30ch] leading-relaxed text-granite/80">{x.text}</p>
      </div>
      <figure className="relative col-span-5 col-start-7 aspect-[3/4] overflow-hidden">
        <Image src={x.image} alt={x.alt} fill sizes="40vw" className="object-cover" />
      </figure>
    </div>
  );
}

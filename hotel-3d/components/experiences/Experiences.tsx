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
  const flat = lite || reduced;

  return (
    <section
      id="experiences"
      data-header="dark"
      aria-labelledby="exp-title"
      className="relative bg-snow text-granite"
    >
      {flat ? <FlatGallery /> : <RingGallery />}
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

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    // la scène n'est chargée qu'à l'approche de la section
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "100% 0px" });
    io.observe(el);
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
    // la vitesse retombe quand on s'arrête
    const decay = () => {
      velocity.current *= 0.9;
    };
    gsap.ticker.add(decay);
    return () => {
      io.disconnect();
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
                  className={`text-[1.125rem] transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-45"}`}
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
          {mount && (
            <ExperienceRing progress={progress} velocity={velocity} onHover={(i) => setCursorLabel(i === null ? null : "Découvrir")} />
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
      <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none]" aria-label="Expériences">
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

"use client";
/**
 * Chapitre 1 — L'arrivée.
 * Section haute de 230vh dont l'intérieur reste épinglé (sticky) :
 * le scroll fait avancer la caméra 3D vers le chalet pendant que le titre,
 * posé sur la pente à 12°, glisse puis s'efface.
 *
 * - La scène est chargée à la demande (next/dynamic, ssr: false) et ne tourne
 *   que lorsque le hero est visible.
 * - prefers-reduced-motion : image fixe, titre affiché d'emblée.
 * - Sans WebGL : la photo d'ambiance du sommet prend le relais.
 */
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { registerGsap, gsap, DUR, EASE } from "@/lib/motion";
import { useLiteMode, useReducedMotion } from "@/lib/useMedia";

const SlopeScene = dynamic(() => import("./SlopeScene"), { ssr: false });

const TITLE = "L’Arolle";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progress = useRef(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();
  const lite = useLiteMode();

  useEffect(() => setWebgl(hasWebGL()), []);

  // On ne fait tourner la scène que si le hero est à l'écran
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Titre lettre par lettre, puis timeline liée au scroll
  useEffect(() => {
    registerGsap();
    const letters = titleRef.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (!letters || !section.current) return;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(letters, { yPercent: 0, opacity: 1 });
        gsap.set("[data-hero-fade]", { opacity: 1, y: 0 });
        return;
      }

      // 1. Entrée : chaque lettre monte depuis la pente, l'une après l'autre
      const intro = gsap.timeline({ delay: 0.25 });
      intro
        .fromTo(letters, { yPercent: 110 }, { yPercent: 0, duration: DUR.title, stagger: DUR.letter, ease: EASE.outExpo })
        .fromTo("[data-hero-fade]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, "-=0.9");

      // 2. Scroll : la caméra avance (progress) et le titre descend la pente
      gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => (progress.current = self.progress),
        },
      })
        .to("[data-hero-title]", { xPercent: -18, yPercent: 38, ease: "none", duration: 1 }, 0)
        .to("[data-hero-title]", { opacity: 0, ease: "none", duration: 0.25 }, 0.45)
        .to("[data-hero-fade]", { opacity: 0, ease: "none", duration: 0.2 }, 0.15);
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  const showScene = webgl === true;

  return (
    <section
      ref={section}
      id="top"
      data-header="light"
      aria-labelledby="hero-title"
      className="relative h-[230vh] bg-altitude"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Repli sans WebGL : photo d'ambiance (placeholder à remplacer) */}
        {webgl === false && (
          <Image
            src="/images/placeholder-lieu-sommet-remontee.webp"
            alt="Sommets enneigés au-dessus de Courchevel sous un ciel bleu"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {showScene && (
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ease-out-expo ${ready ? "opacity-100" : "opacity-0"}`}
          >
            <SlopeScene progress={progress} lite={lite} still={reduced || !visible} onReady={() => setReady(true)} />
          </div>
        )}

        {/* Titre posé sur la pente du premier plan (12°) */}
        <div
          data-hero-title
          className="pointer-events-none absolute left-[var(--gutter)] right-0 bottom-[11svh] origin-bottom-left md:bottom-[9svh]"
          style={{ transform: "rotate(var(--slope))" }}
        >
          <h1
            id="hero-title"
            ref={titleRef}
            aria-label="L’Arolle, hôtel à Courchevel 1850"
            className="display whitespace-nowrap text-[27vw] leading-[0.8] text-altitude md:text-[18vw]"
          >
            {Array.from(TITLE).map((ch, i) => (
              // le masque par lettre : la lettre « sort » de la neige
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <span data-letter className="inline-block will-change-transform">
                  {ch}
                </span>
              </span>
            ))}
          </h1>
        </div>

        {/* Repères fonctionnels, en petites capitales */}
        <div className="absolute inset-x-[var(--gutter)] top-[14svh] flex justify-start md:top-[15svh]">
          <p data-hero-fade className="max-w-[17rem] text-[1.0625rem] leading-snug text-snow">
            Vingt-quatre suites en bois d&rsquo;arolle, posées sur l&rsquo;arête au-dessus de Courchevel.
          </p>
        </div>
        <div className="absolute inset-x-[var(--gutter)] bottom-5 flex items-end justify-between text-granite">
          <p data-hero-fade className="caps">
            Courchevel 1850<span className="hidden sm:inline"> · Savoie</span>
          </p>
          <p data-hero-fade className="caps flex items-center gap-3" aria-hidden>
            Descendre
            <span className="relative block h-px w-12 overflow-hidden bg-granite/25">
              <span className="absolute inset-0 origin-left animate-[cue_2.4s_cubic-bezier(.65,0,.35,1)_infinite] bg-granite" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

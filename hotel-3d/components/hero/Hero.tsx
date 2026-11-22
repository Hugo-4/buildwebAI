"use client";
/**
 * Chapitre 1 — L'arrivée.
 * Le film d'arrivée (séquence d'images) avance avec le scroll. Par-dessus, le nom
 * « L'AROLLE » en capitales condensées géantes ; dès qu'on descend, une brume de
 * montagne (WebGL, ./Mist) monte depuis le bas et l'avale, puis se retire et
 * laisse le film continuer : la porte, l'entrée, le salon. Trois phrases s'y posent.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ScrollSequence from "@/components/sequence/ScrollSequence";
import { SEQUENCES } from "@/lib/sequences";
import { registerGsap, gsap, DUR, EASE, prefersReducedMotion } from "@/lib/motion";
import { READY_EVENT } from "@/components/ui/Preloader";
import { useLiteMode } from "@/lib/useMedia";

const Mist = dynamic(() => import("./Mist"), { ssr: false });

const NAME = "L’Arolle";

/** Phrases calées sur le film : [début, fin] en fraction du scroll. */
const CAPTIONS: { label: string; text: string; at: [number, number] }[] = [
  { label: "Le seuil", text: "Les portes sont en arolle, comme le reste.", at: [0.27, 0.42] },
  { label: "L’entrée", text: "La neige reste dehors.", at: [0.46, 0.6] },
  { label: "Le salon", text: "Le feu brûle depuis ce matin, les sommets restent aux fenêtres.", at: [0.7, 1] },
];

// la brume : monte (0 → 0,13) jusqu'à couvrir le nom, puis se retire (0,13 → 0,24)
const mistAt = (p: number) => (p < 0.13 ? p / 0.13 : Math.max(0, 1 - (p - 0.13) / 0.11));

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mist = useRef(0);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [wantMist, setWantMist] = useState(false);
  const lite = useLiteMode();

  useEffect(() => setReduced(prefersReducedMotion()), []);

  // La brume WebGL n'est chargée qu'au premier geste : au repos elle est invisible,
  // et three.js ne pèse pas sur le premier affichage. Téléphone : pas de WebGL,
  // le nom se brouille et s'efface seul (même timeline).
  useEffect(() => {
    const go = () => setWantMist(true);
    const evts = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"] as const;
    evts.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return () => evts.forEach((e) => window.removeEventListener(e, go));
  }, []);

  // brume active seulement quand le hero est à l'écran
  useEffect(() => {
    const el = document.getElementById("top");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Entrée du nom, lettre par lettre, quand le préchargeur se retire
  useEffect(() => {
    registerGsap();
    const letters = titleRef.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (!letters || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set(letters, { y: 0, yPercent: 105 });
      gsap.set("[data-hero-fade]", { opacity: 0 });
      document.documentElement.classList.remove("intro");
    });
    const start = () =>
      ctx.add(() => {
        gsap
          .timeline({ delay: 0.05 })
          .to(letters, { yPercent: 0, duration: DUR.title + 0.2, stagger: 0.06, ease: EASE.outExpo })
          .to("[data-hero-fade]", { opacity: 1, duration: 1, stagger: 0.08, ease: "power2.out" }, 0.5);
      });
    if ((window as unknown as { __larolleReady?: boolean }).__larolleReady) start();
    else window.addEventListener(READY_EVENT, start, { once: true });
    return () => {
      window.removeEventListener(READY_EVENT, start);
      ctx.revert();
    };
  }, []);

  return (
    <ScrollSequence
      id="top"
      manifest={SEQUENCES.hero}
      length={6}
      portraitBox={0.62}
      bg="#f7f7f5"
      timeline={heroTimeline(mist)}
      label="Approche du chalet L’Arolle dans la neige, ouverture des portes, puis le salon et ses baies face aux sommets"
      header="light"
    >
      {/* voiles fonctionnels : lisibilité de l'en-tête en haut, des phrases en bas (ordinateur) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[45%] bg-gradient-to-t from-ink/45 to-transparent md:block" />

      <p data-hero-fade data-hero-label className="label absolute left-[var(--gutter)] top-[18svh] max-w-[16rem] text-[1.0625rem] leading-snug text-snow md:top-[22svh]">
        Vingt-quatre suites au-dessus
        <br />
        de Courchevel 1850
      </p>

      {/* Le nom, que la brume va avaler */}
      <div data-hero-name className="absolute inset-x-[var(--gutter)] top-[30svh] md:top-auto md:bottom-[9svh]">
        <h1
          ref={titleRef}
          aria-label="L’Arolle, hôtel de vingt-quatre suites à Courchevel 1850"
          className="giant whitespace-nowrap text-[30vw] text-snow md:text-[21vw]"
        >
          {Array.from(NAME).map((ch, i) => (
            <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
              <span data-letter className="inline-block will-change-transform">
                {ch}
              </span>
            </span>
          ))}
        </h1>
      </div>

      {/* La brume (WebGL) au-dessus du nom */}
      {!reduced && !lite && wantMist && (
        <div className="pointer-events-none absolute inset-0">
          <Mist progress={mist} active={active} />
        </div>
      )}

      {/* Phrases posées sur le film (ordinateur) ou sur la neige sous le film (téléphone) */}
      {CAPTIONS.map((c, i) => (
        <div
          key={i}
          data-caption={i}
          className="absolute inset-x-[var(--gutter)] top-[66svh] text-ink opacity-0 md:bottom-[12svh] md:left-[var(--gutter)] md:right-auto md:top-auto md:max-w-[44rem] md:text-snow"
        >
          <p className="label text-[1.125rem]">
            <span className="swash">{c.label}</span>
          </p>
          <p className="title mt-5 text-[clamp(1.75rem,3.6vw,3.25rem)]">{c.text}</p>
        </div>
      ))}

      <p data-hero-fade data-hero-cue className="caps absolute bottom-7 right-[var(--gutter)] hidden items-center gap-3 text-snow md:flex" aria-hidden>
        Descendre
        <span className="relative block h-8 w-px overflow-hidden bg-snow/30">
          <span className="absolute inset-0 animate-[cue_2.4s_cubic-bezier(.65,0,.35,1)_infinite] bg-snow" />
        </span>
      </p>
    </ScrollSequence>
  );
}

/** Timeline scrubbée (identité stable par ref) : brume, nom qui se dissout, phrases. */
const timelines = new WeakMap<object, (tl: gsap.core.Timeline) => void>();
function heroTimeline(mist: { current: number }) {
  if (timelines.has(mist)) return timelines.get(mist)!;
  const fn = (tl: gsap.core.Timeline) => {
    const state = { p: 0 };
    tl.to(state, { p: 1, duration: 1, ease: "none", onUpdate: () => (mist.current = mistAt(state.p)) }, 0);
    // le nom se brouille et s'efface dans la brume
    tl.to("[data-hero-name]", { filter: "blur(18px)", opacity: 0, yPercent: -12, duration: 0.11, ease: "power1.in" }, 0.02);
    tl.to("[data-hero-cue]", { opacity: 0, duration: 0.04 }, 0.01);
    tl.to("[data-hero-label]", { opacity: 0, duration: 0.06 }, 0.03);
    CAPTIONS.forEach((c, i) => {
      const sel = `[data-caption="${i}"]`;
      const [a, b] = c.at;
      tl.fromTo(sel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" }, a);
      if (b < 1) tl.to(sel, { opacity: 0, y: -16, duration: 0.03, ease: "power2.in" }, b - 0.03);
    });
  };
  timelines.set(mist, fn);
  return fn;
}

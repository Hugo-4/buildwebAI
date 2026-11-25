"use client";
/**
 * Chapitre 1 — L'arrivée.
 * Le film d'arrivée (séquence d'images) avance avec le scroll, sans titre géant :
 * une ligne de présentation, puis dès qu'on descend une brume de montagne (WebGL,
 * ./Mist) monte depuis le bas et se retire. Une seule phrase s'y pose, sur la porte.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ScrollSequence from "@/components/sequence/ScrollSequence";
import { SEQUENCES } from "@/lib/sequences";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { READY_EVENT } from "@/components/ui/Preloader";
import { useLiteMode } from "@/lib/useMedia";

const Mist = dynamic(() => import("./Mist"), { ssr: false });

/** Phrases calées sur le film : [début, fin] en fraction du scroll. */
const CAPTIONS: { text: string; at: [number, number] }[] = [
  // film 1080p de 15,3 s : approche (0 → 0,2), la porte qui s'ouvre (0,22 → 0,36), la chambre au feu, puis le salon
  { text: "Nous vous ouvrons les portes de l’Arolle.", at: [0.23, 0.4] },
];

// la brume : monte (0 → 0,13) jusqu'à couvrir le nom, puis se retire (0,13 → 0,24)
const mistAt = (p: number) => (p < 0.13 ? p / 0.13 : Math.max(0, 1 - (p - 0.13) / 0.11));

export default function Hero() {
  const mist = useRef(0); // valeur amortie, lue par le shader
  const target = useRef({ m: 0, past: false }); // écrite par le scroll
  const [active, setActive] = useState(true);
  const [mistOn, setMistOn] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [wantMist, setWantMist] = useState(false);
  const lite = useLiteMode();

  useEffect(() => setReduced(prefersReducedMotion()), []);

  // La brume WebGL se charge au premier geste ou, au plus tard, au repos après
  // l'entrée : au premier scroll elle est déjà montée. Téléphone : pas de WebGL.
  useEffect(() => {
    const go = () => setWantMist(true);
    const evts = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"] as const;
    evts.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    const idle = () => setTimeout(go, 2500);
    window.addEventListener(READY_EVENT, idle, { once: true });
    if ((window as unknown as { __larolleReady?: boolean }).__larolleReady) idle();
    return () => {
      evts.forEach((e) => window.removeEventListener(e, go));
      window.removeEventListener(READY_EVENT, idle);
    };
  }, []);

  // Horloge de la brume : la valeur suit le scroll avec un amorti.
  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    let on = true;
    let scrolled = false;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    const hero = document.getElementById("top");
    if (hero) io.observe(hero);
    const tick = (_t: number, dt: number) => {
      if (!visible) return; // hero hors écran : rien à écrire
      const { m } = target.current;
      if (m > 0) scrolled = true;
      const k = 1 - Math.exp(-(dt / 1000) * 5);
      mist.current += (m - mist.current) * k;
      const v = mist.current;
      // la brume dessine son voile de repos jusqu'au 1er scroll, puis s'arrête une fois retirée
      const want = !scrolled || v > 0.002 || m > 0.002;
      if (want !== on) setMistOn((on = want));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  // brume active seulement quand le hero est à l'écran
  useEffect(() => {
    const el = document.getElementById("top");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Entrée douce de la ligne de présentation quand le préchargeur se retire
  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-fade]", { opacity: 0 });
      document.documentElement.classList.remove("intro");
    });
    const start = () =>
      ctx.add(() => {
        gsap.to("[data-hero-fade]", { opacity: 1, duration: 1.2, stagger: 0.1, ease: "power2.out", delay: 0.2 });
      });
    if ((window as unknown as { __larolleReady?: boolean }).__larolleReady) start();
    else window.addEventListener(READY_EVENT, start, { once: true });
    return () => {
      window.removeEventListener(READY_EVENT, start);
      ctx.revert();
    };
  }, []);

  return (
    <>
    <ScrollSequence
      id="top"
      manifest={SEQUENCES.hero}
      length={6}
      portraitBox={0.62}
      eager={!lite}
      bg="#ebe5d9"
      timeline={heroTimeline(target)}
      label="Approche du chalet L’Arolle dans la neige, ouverture des portes, puis le salon et ses baies face aux sommets"
      header="light"
    >
      {/* voiles fonctionnels : lisibilité de l'en-tête en haut, des phrases en bas (ordinateur) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[65%] bg-gradient-to-t from-ink/65 via-ink/25 to-transparent md:block" />

      <h1 className="sr-only">L’Arolle, hôtel de vingt-quatre suites à Courchevel 1850</h1>
      <p data-hero-fade data-hero-label className="label absolute left-[var(--gutter)] top-[65svh] max-w-[22rem] text-[clamp(1.4rem,2.3vw,2.4rem)] leading-[1.25] text-ink md:bottom-[12svh] md:top-auto md:max-w-none md:text-snow">
        Vingt-quatre suites au-dessus
        <br />
        de Courchevel 1850
      </p>

      {/* La brume (WebGL) */}
      {!reduced && !lite && wantMist && (
        <div className="pointer-events-none absolute inset-0">
          <Mist progress={mist} active={active && mistOn} />
        </div>
      )}

      {/* Phrases posées sur le film (ordinateur) ou sur la neige sous le film (téléphone) */}
      {CAPTIONS.map((c, i) => (
        <div
          key={i}
          data-caption={i}
          className="absolute inset-x-[var(--gutter)] top-[66svh] text-ink opacity-0 md:bottom-[12svh] md:left-[var(--gutter)] md:right-auto md:top-auto md:max-w-[44rem] md:text-snow"
        >
          <p className="title text-[clamp(1.75rem,3.6vw,3.25rem)]">{c.text}</p>
        </div>
      ))}

      <p data-hero-fade data-hero-cue className="caps absolute bottom-7 right-[var(--gutter)] hidden items-center gap-3 text-snow md:flex" aria-hidden>
        Descendre
        <span className="relative block h-8 w-px overflow-hidden bg-snow/30">
          <span className="absolute inset-0 animate-[cue_2.4s_cubic-bezier(.65,0,.35,1)_infinite] bg-snow" />
        </span>
      </p>
    </ScrollSequence>
    {reduced && (
      <section aria-label="L’arrivée en une phrase" className="bg-snow px-[var(--gutter)] py-[var(--section-y)] text-ink">
        <ol className="grid gap-10 md:grid-cols-6">
          {CAPTIONS.map((c, i) => (
            <li key={i} className="title text-[clamp(1.6rem,2.6vw,2.4rem)] md:col-span-2">
              {c.text}
            </li>
          ))}
        </ol>
      </section>
    )}
    </>
  );
}

/** Timeline scrubbée (identité stable par ref) : brume, phrase. */
const timelines = new WeakMap<object, (tl: gsap.core.Timeline) => void>();
function heroTimeline(target: { current: { m: number; past: boolean } }) {
  if (timelines.has(target)) return timelines.get(target)!;
  const fn = (tl: gsap.core.Timeline) => {
    const state = { p: 0 };
    // le scroll écrit la cible ; la brume la suit (ticker du composant)
    tl.to(state, { p: 1, duration: 1, ease: "none", onUpdate: () => (target.current = { m: mistAt(state.p), past: state.p > 0.13 }) }, 0);
    tl.to("[data-hero-cue]", { opacity: 0, duration: 0.04 }, 0.01);
    tl.to("[data-hero-label]", { opacity: 0, duration: 0.06 }, 0.03);
    CAPTIONS.forEach((c, i) => {
      const sel = `[data-caption="${i}"]`;
      const [a, b] = c.at;
      tl.fromTo(sel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" }, a);
      if (b < 1) tl.to(sel, { opacity: 0, y: -16, duration: 0.03, ease: "power2.in" }, b - 0.03);
    });
  };
  timelines.set(target, fn);
  return fn;
}

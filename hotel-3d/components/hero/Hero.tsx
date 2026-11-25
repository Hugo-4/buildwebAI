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
const CAPTIONS: { text: string; at: [number, number] }[] = [
  // film 1080p de 15,3 s : approche (0 → 0,2), la porte (0,22 → 0,34), la chambre au feu (0,38 → 0,50), puis le salon
  { text: "Les portes sont en arolle, comme le reste.", at: [0.23, 0.36] },
  { text: "La neige reste dehors.", at: [0.39, 0.5] },
  { text: "Le feu brûle depuis ce matin, les sommets restent aux fenêtres.", at: [0.62, 1] },
];

// la brume : monte (0 → 0,13) jusqu'à couvrir le nom, puis se retire (0,13 → 0,24)
const mistAt = (p: number) => (p < 0.13 ? p / 0.13 : Math.max(0, 1 - (p - 0.13) / 0.11));

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const mist = useRef(0); // valeur amortie, lue par le shader ET par le nom
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

  // Une seule horloge pour la brume et le nom : la valeur suit le scroll avec un
  // amorti, et le nom se brouille exactement quand la brume l'atteint.
  useEffect(() => {
    registerGsap();
    const name = document.querySelector<HTMLElement>("[data-hero-name]");
    if (!name || prefersReducedMotion()) return;
    let on = true;
    let scrolled = false;
    let visible = true;
    let last = -1;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    const hero = document.getElementById("top");
    if (hero) io.observe(hero);
    const tick = (_t: number, dt: number) => {
      if (!visible) return; // hero hors écran : rien à écrire
      const { m, past } = target.current;
      if (m > 0) scrolled = true;
      const k = 1 - Math.exp(-(dt / 1000) * 5);
      mist.current += (m - mist.current) * k;
      const v = mist.current;
      // montée : le nom disparaît entre 35 % et 85 % de couverture ; après le pic, il reste caché
      const fade = past ? 1 : gsap.utils.clamp(0, 1, (v - 0.35) / 0.5);
      if (Math.abs(fade - last) > 0.001) {
        last = fade;
        name.style.opacity = String(1 - fade);
        name.style.filter = fade > 0.01 ? `blur(${(fade * 8).toFixed(2)}px)` : "";
        name.style.transform = `translateY(${(-fade * 8).toFixed(2)}%)`;
      }
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
    <>
    <ScrollSequence
      id="top"
      manifest={SEQUENCES.hero}
      length={6}
      portraitBox={0.62}
      eager={!lite}
      bg="#f7f7f5"
      timeline={heroTimeline(target)}
      label="Approche du chalet L’Arolle dans la neige, ouverture des portes, puis le salon et ses baies face aux sommets"
      header="light"
    >
      {/* voiles fonctionnels : lisibilité de l'en-tête en haut, des phrases en bas (ordinateur) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[45%] bg-gradient-to-t from-ink/45 to-transparent md:block" />

      <p data-hero-fade data-hero-label className="label absolute left-[var(--gutter)] top-[65svh] max-w-[16rem] text-[1.0625rem] leading-snug text-ink md:top-[22svh] md:text-snow">
        Vingt-quatre suites au-dessus
        <br />
        de Courchevel 1850
      </p>

      {/* Le nom, que la brume va avaler */}
      <div data-hero-name className="absolute inset-x-[var(--gutter)] top-[72svh] md:top-auto md:bottom-[9svh]">
        <h1
          ref={titleRef}
          aria-label="L’Arolle, hôtel de vingt-quatre suites à Courchevel 1850"
          className="giant whitespace-nowrap text-[30vw] text-ink md:text-[21vw] md:text-snow"
        >
          {Array.from(NAME).map((ch, i) => (
            <span key={i} aria-hidden className="-mt-[0.22em] inline-block overflow-hidden pt-[0.22em] align-bottom">
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
      <section aria-label="L’arrivée en trois phrases" className="bg-snow px-[var(--gutter)] py-[var(--section-y)] text-ink">
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

/** Timeline scrubbée (identité stable par ref) : brume, nom qui se dissout, phrases. */
const timelines = new WeakMap<object, (tl: gsap.core.Timeline) => void>();
function heroTimeline(target: { current: { m: number; past: boolean } }) {
  if (timelines.has(target)) return timelines.get(target)!;
  const fn = (tl: gsap.core.Timeline) => {
    const state = { p: 0 };
    // le scroll écrit la cible ; la brume et le nom la suivent ensemble (ticker du composant)
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

"use client";
/**
 * Préchargeur : le monogramme se trace (le délié, le plein, puis la traverse
 * qui file sur la pente du monogramme), un compteur suit le chargement réel
 * (polices + première image du hero), puis le rideau de neige se lève.
 * Joué une fois par session. Émet « larolle:ready » à la fin : le hero lance
 * alors l'entrée de son titre.
 */
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { firstFrame, SEQUENCES } from "@/lib/sequences";

export const READY_EVENT = "larolle:ready";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = root.current;
    let announced = false;
    const announce = () => {
      if (announced) return;
      announced = true;
      (window as unknown as { __larolleReady?: boolean }).__larolleReady = true;
      window.dispatchEvent(new Event(READY_EVENT));
    };
    const finish = () => {
      announce();
      setDone(true);
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem("larolle-intro") === "1";
      sessionStorage.setItem("larolle-intro", "1");
    } catch {}
    // Mobile (version allégée) : pas de préchargeur, le hero s'ouvre tout de suite
    const phone = window.matchMedia("(max-width: 767px)").matches;
    if (!el || seen || phone || prefersReducedMotion()) return finish();

    document.documentElement.style.overflow = "hidden";
    const counter = { v: 0 };
    // ce qui doit être prêt avant de lever le rideau
    const img = new Image();
    const imgReady = new Promise<void>((res) => {
      img.onload = img.onerror = () => res();
      img.src = firstFrame(SEQUENCES.hero, window.innerWidth > 1100 ? 1920 : 960);
    });
    const ready = Promise.all([document.fonts.ready, imgReady, new Promise((r) => setTimeout(r, 750))]);

    // le tracé du monogramme est en CSS (globals.css, .pl-*) : son état de départ
    // existe dès le HTML serveur, donc rien n'apparaît puis ne disparaît
    el.classList.add("pl-draw");
    const tl = gsap.timeline();
    tl.to(counter, { v: 86, duration: 0.75, ease: "power2.out", onUpdate: () => setCount(Math.round(counter.v)) }, 0);

    ready.then(() => {
      gsap
        .timeline({
          onComplete: () => {
            document.documentElement.style.overflow = "";
            finish();
          },
        })
        .to(counter, { v: 100, duration: 0.25, ease: "power2.out", onUpdate: () => setCount(Math.round(counter.v)) })
        .to("[data-pl-inner]", { yPercent: -30, opacity: 0, duration: 0.35, ease: "power2.in" }, "+=0.05")
        // le rideau bleu se retire en suivant la pente
        // le rideau de neige se lève
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, "-=0.3")
        // le hero commence pendant que le rideau se retire : aucun temps mort
        .call(announce, [], "<0.35");
    });
    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (done) return null;
  return (
    <div
      ref={root}
      role="status"
      aria-label="Chargement de L’Arolle"
      className="preloader fixed inset-0 z-[100] hidden items-center justify-center bg-snow text-ink md:flex"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div data-pl-inner className="flex flex-col items-center">
        <svg viewBox="44 28 198 196" className="h-28 w-auto" fill="currentColor" aria-hidden>
          <path className="pl-thin" d="M124 36 L132 36 L66.5 216 L58.5 216 Z" />
          <path className="pl-thick" d="M124 36 L136 36 L201.5 216 L172.2 216 Z" />
          <path className="pl-feet" d="M50 210 L76 210 L76 216 L50 216 Z M160 210 L212 210 L212 216 L160 216 Z" />
          <path className="pl-bar" d="M78 168 L236 134.42 L236 140.42 L78 174 Z" />
        </svg>
        <p className="caps mt-8 tabular-nums text-ink/60">{String(count).padStart(3, "0")}</p>
      </div>
    </div>
  );
}

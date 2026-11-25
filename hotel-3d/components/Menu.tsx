"use client";
/**
 * Menu plein écran (Framer Motion).
 * Un aplat bleu monte en suivant la pente, les chapitres arrivent l'un après
 * l'autre, la sortie est plus courte que l'entrée. Échap ferme, le focus reste
 * piégé dans le menu et revient sur le bouton à la fermeture ; le scroll de la
 * page est suspendu pendant l'ouverture.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useMedia";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/SmoothScroll";
import { BEZIER } from "@/lib/motion";

export const CHAPTERS = [
  { href: "#top", label: "L’arrivée" },
  { href: "#contenu", label: "Le lieu" },
  { href: "#suites", label: "Les suites" },
  { href: "#table", label: "La table" },
  { href: "#detente", label: "L’espace détente" },
  { href: "#experiences", label: "Expériences" },
  { href: "#reserver", label: "Réserver" },
];

type Props = { open: boolean; onClose: () => void };

export default function Menu({ open, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>("a, button");
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // piège du focus
      if (e.key === "Tab" && el) {
        const f = Array.from(el.querySelectorAll<HTMLElement>("a, button"));
        const [a, b] = [f[0], f[f.length - 1]];
        if (e.shiftKey && document.activeElement === a) (e.preventDefault(), b.focus());
        else if (!e.shiftKey && document.activeElement === b) (e.preventDefault(), a.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, onClose, lenis]);

  const go = (href: string) => {
    onClose();
    // on laisse le rideau se retirer avant de glisser vers le chapitre
    setTimeout(() => {
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }, 350);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-snow px-[var(--gutter)] pb-10 pt-36 text-ink"
          // la neige descend sur la page comme un rideau, et remonte à la fermeture
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: reduce ? 0 : 0.9, ease: BEZIER.inOut } }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: reduce ? 0 : 0.55, ease: BEZIER.in } }}
        >
          <div className="grid flex-1 grid-cols-1 gap-x-[var(--gutter)] gap-y-12 md:grid-cols-6">
            {/* Les chapitres : une ligne fine entre chaque, le nom en Tenor Sans, une flèche au survol */}
            <nav aria-label="Chapitres" className="md:col-span-4">
              <ol className="border-t border-rule">
                {CHAPTERS.map((c, i) => (
                  <li key={c.href} className="overflow-hidden border-b border-rule">
                    <motion.a
                      href={c.href}
                      onClick={(e) => (e.preventDefault(), go(c.href))}
                      className="group flex items-center justify-between py-[clamp(0.55rem,1.6vh,1.1rem)] text-ink/75 transition-colors hover:text-ink focus-visible:text-ink"
                      initial={{ y: "105%" }}
                      animate={{ y: 0, transition: { delay: reduce ? 0 : 0.25 + i * 0.05, duration: reduce ? 0 : 0.9, ease: BEZIER.outExpo } }}
                      exit={{ y: "-105%", transition: { duration: reduce ? 0 : 0.3, ease: BEZIER.in } }}
                    >
                      <span className="title text-[clamp(1.6rem,4.6vh,3.4rem)] transition-[letter-spacing] duration-500 ease-out-expo group-hover:tracking-[0.09em]">
                        {c.label}
                      </span>
                      <svg viewBox="0 0 24 12" className="h-3 w-6 shrink-0 -translate-x-2 opacity-0 transition-[opacity,transform] duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" aria-hidden>
                        <path d="M0 6h22M17 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </motion.a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Coordonnées et action */}
            <motion.div
              className="flex flex-col justify-between gap-10 md:col-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <div className="space-y-6">
                <p className="caps text-ink/60">Courchevel 1850</p>
                <address className="not-italic text-[1.125rem] font-light leading-relaxed">
                  Jardin Alpin
                  <br />
                  73120 Courchevel, Savoie
                </address>
                <a href="mailto:sejour@larolle.example" className="link-line inline-block text-[1.0625rem] font-light">
                  sejour@larolle.example
                </a>
              </div>
              <a href="#reserver" onClick={(e) => (e.preventDefault(), go("#reserver"))} className="btn caps self-start">
                Réserver un séjour
              </a>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

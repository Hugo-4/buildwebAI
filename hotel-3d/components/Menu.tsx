"use client";
/**
 * Menu plein écran (Framer Motion).
 * Un aplat bleu monte en suivant la pente, les chapitres arrivent l'un après
 * l'autre, la sortie est plus courte que l'entrée. Échap ferme, le focus reste
 * piégé dans le menu et revient sur le bouton à la fermeture ; le scroll de la
 * page est suspendu pendant l'ouverture.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/SmoothScroll";
import { BEZIER } from "@/lib/motion";

export const CHAPTERS = [
  { href: "#top", label: "L’arrivée" },
  { href: "#contenu", label: "Le lieu" },
  { href: "#suites", label: "Les suites" },
  { href: "#table", label: "La table" },
  { href: "#spa", label: "Le spa" },
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
    first?.focus();
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
          className="fixed inset-0 z-[70] flex flex-col bg-altitude px-[var(--gutter)] pb-10 pt-28 text-snow"
          initial={{ clipPath: "polygon(0% 100%, 100% 121%, 100% 121%, 0% 100%)" }}
          animate={{ clipPath: "polygon(0% 0%, 100% -21%, 100% 100%, 0% 100%)", transition: { duration: reduce ? 0 : 0.8, ease: BEZIER.outExpo } }}
          exit={{ clipPath: "polygon(0% 0%, 100% -21%, 100% -21%, 0% 0%)", transition: { duration: reduce ? 0 : 0.5, ease: BEZIER.in } }}
        >
          <div className="grain absolute inset-0" aria-hidden />
          <nav aria-label="Chapitres" className="relative flex-1">
            <ol className="space-y-1">
              {CHAPTERS.map((c, i) => (
                <li key={c.href} className="overflow-hidden">
                  <motion.a
                    href={c.href}
                    onClick={(e) => (e.preventDefault(), go(c.href))}
                    className="display inline-block text-[clamp(2.4rem,7vh,5rem)] leading-[1.08] text-snow/90 transition-colors hover:text-amber focus-visible:text-amber"
                    initial={{ y: "105%" }}
                    animate={{ y: 0, transition: { delay: reduce ? 0 : 0.25 + i * 0.05, duration: reduce ? 0 : 0.9, ease: BEZIER.outExpo } }}
                    exit={{ y: "-105%", transition: { duration: reduce ? 0 : 0.3, ease: BEZIER.in } }}
                  >
                    {c.label}
                  </motion.a>
                </li>
              ))}
            </ol>
          </nav>
          <motion.div
            className="caps relative flex flex-wrap justify-between gap-6 text-snow/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <span>Rue du Jardin Alpin · Courchevel 1850</span>
            <a href="tel:+33479000000" className="link-line">
              +33 4 79 00 00 00
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

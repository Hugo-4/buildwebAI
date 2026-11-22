"use client";
/**
 * En-tête fixe : monogramme à gauche, « Menu » et « Réserver » à droite.
 * - Sa couleur suit la section sous lui (data-header="light" | "dark").
 * - Le monogramme se retire quand on descend ; « Menu » et « Réserver » restent
 *   toujours à portée (la réservation est à un geste, partout).
 * - « Menu » ouvre le menu plein écran ; le bouton devient « Fermer ».
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Monogram from "@/components/brand/Monogram";
import Menu from "@/components/Menu";
import Magnetic from "@/components/ui/Magnetic";
import { registerGsap, ScrollTrigger } from "@/lib/motion";

export default function Header() {
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 120);
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    registerGsap();
    // attend que toutes les sections soient montées
    let triggers: ScrollTrigger[] = [];
    const id = requestAnimationFrame(() => {
      triggers = Array.from(document.querySelectorAll<HTMLElement>("[data-header]")).map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 40px",
          end: "bottom 40px",
          onToggle: (self) => self.isActive && setTone(el.dataset.header as "light" | "dark"),
        }),
      );
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggle.current?.focus();
  }, []);

  const light = open || tone === "light";

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-[var(--gutter)] py-5 transition-colors duration-500 ease-out-expo ${
          light ? "text-snow" : "text-granite"
        }`}
      >
        <a
          href="#top"
          className={`pointer-events-auto flex items-center gap-3 transition-[transform,opacity] duration-500 ease-out-expo focus-visible:translate-y-0 focus-visible:opacity-100 ${
            hidden && !open ? "-translate-y-[150%] opacity-0" : ""
          }`}
          aria-label="L’Arolle, retour en haut de page"
        >
          <Monogram className="h-9 w-auto" title="" />
          <span className="caps hidden sm:inline">L&rsquo;Arolle</span>
        </a>
        <nav aria-label="Principale" className="pointer-events-auto flex items-center gap-3 sm:gap-6">
          <button
            ref={toggle}
            type="button"
            // sur le contenu, « Menu » prend son propre fond (lisible partout)
            className={`caps transition-colors duration-300 ${
              scrolled && !open ? "btn-slope !bg-snow !text-granite" : "link-line px-2"
            }`}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? "Fermer" : "Menu"}
          </button>
          <Magnetic>
            <a href="#reserver" className="btn-slope caps" onClick={() => open && setOpen(false)}>
              Réserver
            </a>
          </Magnetic>
        </nav>
      </header>
      <Menu open={open} onClose={close} />
    </>
  );
}

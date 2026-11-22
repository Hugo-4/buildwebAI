"use client";
/**
 * En-tête : chapitres à gauche, monogramme et nom au centre, « Menu » à droite.
 * Transparent sur le film (texte neige), il prend un fond neige et l'encre dès
 * qu'on a quitté le hero. L'action « Réserver » vit dans l'onglet ambre fixé au
 * bord droit (BookTab) : toujours là, jamais en concurrence avec la navigation.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Monogram from "@/components/brand/Monogram";
import Menu from "@/components/Menu";
import { useLenis } from "@/components/SmoothScroll";

const LINKS = [
  { href: "#suites", label: "Suites" },
  { href: "#table", label: "Table" },
  { href: "#spa", label: "Spa" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const hero = document.getElementById("top");
    const onScroll = () => setSolid(!!hero && hero.getBoundingClientRect().bottom < 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggle.current?.focus();
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const t = document.querySelector<HTMLElement>(href);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.6 });
    else t.scrollIntoView();
  };

  const onFilm = !solid && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] grid grid-cols-3 items-center px-[var(--gutter)] py-5 transition-[background-color,color,border-color] duration-500 ease-out-expo ${
          onFilm ? "border-b border-transparent text-snow" : "border-b border-rule bg-snow/95 text-ink"
        } ${open ? "!bg-transparent !border-transparent" : ""}`}
      >
        <nav aria-label="Chapitres" className="caps hidden gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="link-line [background-size:0%_1px] hover:[background-size:100%_1px]" onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="col-start-2 flex flex-col items-center gap-1 justify-self-center" aria-label="L’Arolle, retour en haut de page" onClick={(e) => go(e, "#top")}>
          <Monogram className="h-8 w-auto" title="" />
          <span className="caps text-[0.6875rem]">L&rsquo;Arolle</span>
        </a>
        <button
          ref={toggle}
          type="button"
          className="caps col-start-3 justify-self-end link-line"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => (open ? close() : setOpen(true))}
        >
          {open ? "Fermer" : "Menu"}
        </button>
      </header>
      <Menu open={open} onClose={close} />
    </>
  );
}

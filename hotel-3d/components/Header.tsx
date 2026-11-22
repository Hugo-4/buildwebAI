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
  // ton de la section sous l'en-tête : film (light), neige (dark) ou encre (ink)
  const [tone, setTone] = useState<"light" | "dark" | "ink">("light");
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      // la section dont la bande couvre y = 40 px (sous la barre)
      const secs = document.querySelectorAll<HTMLElement>("[data-header]");
      for (const el of secs) {
        const r = el.getBoundingClientRect();
        if (r.top <= 40 && r.bottom > 40) {
          setTone((el.dataset.header as "light" | "dark" | "ink") || "dark");
          return;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
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

  const skin = open
    ? "border-transparent text-ink"
    : tone === "light"
      ? "border-transparent text-snow"
      : tone === "ink"
        ? "border-snow/10 bg-ink text-snow"
        : "border-rule bg-snow text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] grid grid-cols-3 items-center border-b px-[var(--gutter)] py-5 transition-[background-color,color,border-color] duration-500 ease-out-expo ${skin}`}
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

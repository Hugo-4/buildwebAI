"use client";
/**
 * En-tête fixe : monogramme à gauche, « Menu » et « Réserver » à droite.
 * Sa couleur suit la section sous lui : chaque section déclare
 * data-header="light" (texte neige) ou "dark" (texte granite).
 */
import { useEffect, useState } from "react";
import Monogram from "@/components/brand/Monogram";
import { registerGsap, ScrollTrigger } from "@/lib/motion";

export default function Header() {
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [hidden, setHidden] = useState(false);

  // Se retire quand on descend, revient dès qu'on remonte : le contenu ne passe jamais dessous
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    registerGsap();
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-header]"));
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        // la ligne de bascule passe à hauteur de l'en-tête
        start: "top 40px",
        end: "bottom 40px",
        onToggle: (self) => self.isActive && setTone(el.dataset.header as "light" | "dark"),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[var(--gutter)] py-5 transition-[color,transform] duration-500 ease-out-expo focus-within:translate-y-0 ${
        tone === "light" ? "text-snow" : "text-granite"
      } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <a href="#top" className="flex items-center gap-3" aria-label="L'Arolle, retour en haut de page">
        <Monogram className="h-9 w-auto" title="" />
        <span className="caps hidden sm:inline">L&rsquo;Arolle</span>
      </a>
      <nav aria-label="Principale" className="flex items-center gap-6 sm:gap-10">
        <button type="button" className="caps link-line" aria-haspopup="dialog">
          Menu
        </button>
        <a href="#reserver" className="btn-slope caps">
          Réserver
        </a>
      </nav>
    </header>
  );
}

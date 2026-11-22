"use client";
/**
 * L'onglet ambre fixé au bord droit de l'écran : « Réserver », partout,
 * à un geste. C'est la seule surface colorée de la page.
 */
import { useLenis } from "@/components/SmoothScroll";

export default function BookTab() {
  const lenis = useLenis();
  return (
    <a
      href="#reserver"
      onClick={(e) => {
        const t = document.getElementById("reserver");
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { duration: 1.8 });
        else t.scrollIntoView();
      }}
      className="group fixed right-0 top-1/2 z-[75] flex -translate-y-1/2 flex-col items-center gap-3 bg-amber px-3 py-6 text-ink transition-[padding,background-color] duration-300 ease-out-expo hover:bg-[#d4964d] hover:pr-4 max-md:bottom-0 max-md:top-auto max-md:w-full max-md:translate-y-0 max-md:flex-row max-md:justify-center max-md:py-4"
    >
      <span className="caps [writing-mode:vertical-rl] rotate-180 max-md:rotate-0 max-md:[writing-mode:horizontal-tb]">Réserver</span>
      <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-300 ease-out-expo group-hover:rotate-90" aria-hidden>
        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </a>
  );
}

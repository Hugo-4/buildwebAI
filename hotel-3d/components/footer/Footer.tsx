"use client";
/**
 * Chapitre 7 — Le départ (footer).
 * Boucle narrative : la vidéo d'arrivée rejoue à rebours, de nuit. On ressort
 * du salon, on repasse les portes, et le chalet s'éloigne dans le noir bleu.
 */
import ScrollSequence from "@/components/sequence/ScrollSequence";
import Monogram from "@/components/brand/Monogram";
import { SEQUENCES } from "@/lib/sequences";
import type { gsap } from "@/lib/motion";

function footerTimeline(tl: gsap.core.Timeline) {
  tl.fromTo("[data-footer-title] [data-l]", { yPercent: 105 }, { yPercent: 0, duration: 0.12, stagger: 0.03, ease: "power3.out" }, 0.55);
  tl.fromTo("[data-footer-meta]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.1 }, 0.7);
}

export default function Footer() {
  return (
    <footer aria-labelledby="footer-title" className="relative">
      <ScrollSequence
        id="au-revoir"
        manifest={SEQUENCES.hero}
        length={2.6}
        night
        reverse
        portraitBox={0.5}
        stillFrame={0}
        bg="#0b1233"
        timeline={footerTimeline}
        label="Départ de nuit : on ressort du salon, les portes se referment, le chalet s’éloigne dans la neige"
        header="light"
      >
        <div className="absolute inset-0 flex flex-col justify-end px-[var(--gutter)] pb-8 text-snow">
          <h2 id="footer-title" data-footer-title className="display text-[clamp(3.5rem,13vw,13rem)] leading-[0.85]">
            {["À bientôt", "là-haut."].map((l, i) => (
              <span key={l} className="-mt-[0.14em] block overflow-hidden pb-[0.06em] pt-[0.14em]">
                <span data-l className={`block ${i ? "italic" : ""}`}>
                  {l}
                </span>
              </span>
            ))}
          </h2>

          <div data-footer-meta className="mt-12 grid gap-8 border-t border-snow/25 pt-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-start gap-4">
              <Monogram className="h-10 w-auto" title="" />
              <p className="caps leading-relaxed">
                L&rsquo;Arolle
                <br />
                Courchevel 1850
              </p>
            </div>
            <address className="not-italic leading-relaxed text-snow/85">
              Rue du Jardin Alpin
              <br />
              73120 Courchevel, France
            </address>
            <p className="leading-relaxed text-snow/85">
              <a href="tel:+33479000000" className="link-line">
                +33 4 79 00 00 00
              </a>
              <br />
              <a href="mailto:sejour@larolle.example" className="link-line">
                sejour@larolle.example
              </a>
            </p>
            <nav aria-label="Informations" className="caps flex flex-col items-start gap-3 md:items-end">
              <a href="/mentions-legales" className="link-line">
                Mentions légales
              </a>
              <a href="#top" className="link-line">
                Remonter
              </a>
            </nav>
          </div>
          <p className="caps mt-8 text-snow/55">Démonstration BuildWebAI · contenus et visuels à valider</p>
        </div>
      </ScrollSequence>
    </footer>
  );
}

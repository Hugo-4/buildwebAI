"use client";
/**
 * Chapitre 2 — Le lieu.
 * Un photomontage : trois photos et un aplat bleu à des profondeurs différentes
 * (parallaxe), chacun révélé par un masque coupé à 12° qui reste ouvert,
 * comme des papiers collés les uns sur les autres. Les chiffres clés roulent
 * dans la phrase même, au lieu d'une rangée de statistiques.
 *
 * Photos : placeholders d'ambiance dans /public/images, à remplacer par les vraies.
 */
import Image from "next/image";
import { useEffect, useRef } from "react";
import Counter from "@/components/ui/Counter";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/motion";

// Masque à 12° : l'arête monte de gauche à droite, du bas vers le haut du cadre
const CLIP_CLOSED = "polygon(0% 130%, 100% 100%, 100% 100%, 0% 100%)";
const CLIP_OPEN = "polygon(0% 0%, 100% -30%, 100% 100%, 0% 100%)";

export default function Lieu() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((n) => gsap.set(n, { clipPath: n.dataset.cut ?? CLIP_OPEN }));
      return;
    }

    const ctx = gsap.context(() => {
      // Révélations : une fois ouvertes, elles restent (le collage s'accumule)
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((node) => {
        gsap.fromTo(
          node,
          { clipPath: CLIP_CLOSED },
          {
            clipPath: node.dataset.cut ?? CLIP_OPEN,
            duration: 1.4,
            ease: "expo.out",
            delay: Number(node.dataset.delay ?? 0),
            scrollTrigger: { trigger: node, start: "top 82%", once: true },
          },
        );
      });

      // Parallaxe : chaque couche a sa vitesse (data-speed, négatif = plus lent)
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((node) => {
        const speed = Number(node.dataset.speed);
        gsap.fromTo(
          node,
          { yPercent: -speed * 10 },
          {
            yPercent: speed * 10,
            ease: "none",
            scrollTrigger: { trigger: node.closest("[data-montage]"), start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // Le titre se lève ligne par ligne
      gsap.fromTo(
        "[data-line]",
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-lieu-title]", start: "top 80%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="contenu"
      data-header="dark"
      aria-labelledby="lieu-title"
      className="relative overflow-hidden bg-snow pb-[var(--section-y)] pt-[calc(var(--section-y)*0.9)]"
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-x-[var(--gutter)] px-[var(--gutter)]">
        {/* Titre éditorial */}
        <h2
          id="lieu-title"
          data-lieu-title
          className="display col-span-12 text-[clamp(2.75rem,7.4vw,6.5rem)] text-granite md:col-span-9"
        >
          {["Là où la route", "s’arrête, la maison", "commence."].map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <span data-line className={`block ${i === 2 ? "italic text-altitude" : ""}`}>
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className="col-span-12 mt-10 md:col-span-5 md:col-start-8 md:mt-14">
          <p className="max-w-[36ch] text-[1.125rem] leading-relaxed text-granite/85">
            Vingt-quatre suites taillées dans le bois d&rsquo;arolle, à flanc de piste au-dessus de Courchevel 1850.
            Le matin, on chausse les skis sur la terrasse ; le soir, la vallée s&rsquo;éteint sous les fenêtres.
          </p>
        </div>
      </div>

      {/* Photomontage en couches */}
      <div data-montage className="relative mx-auto mt-[clamp(64px,10vh,140px)] h-[clamp(560px,118vh,1180px)] max-w-[1600px] px-[var(--gutter)]">
        {/* Couche 1 — aplat bleu d'altitude, coupé sur la pente */}
        <div
          data-speed="-0.6"
          aria-hidden
          className="grain absolute left-[38%] top-[50%] h-[42%] w-[58%] bg-altitude md:top-[6%] md:h-[64%]"
          style={{ clipPath: "polygon(0 21%, 100% 0, 100% 100%, 0 100%)" }}
        />

        {/* Couche 2 — grande photo : le massif */}
        <figure data-speed="-0.3" className="absolute left-[var(--gutter)] top-0 h-[44%] w-[78%] md:h-[58%] md:w-[64%]">
          {/* l'arête coupée à 12° reste : c'est la signature du photomontage */}
          <div data-reveal data-cut="polygon(0% 13%, 100% 0%, 100% 100%, 0% 100%)" className="relative h-full w-full overflow-hidden">
            <Image
              src="/images/placeholder-lieu-sommet-remontee.webp"
              alt="Placeholder : sommets enneigés et remontée mécanique au-dessus de Courchevel, ciel bleu"
              fill
              sizes="(max-width: 768px) 80vw, 64vw"
              className="object-cover"
            />
          </div>
          <figcaption className="caps mt-3 text-granite/70">Les Trois Vallées, depuis la terrasse</figcaption>
        </figure>

        {/* Couche 3 — petite photo : la glisse, plus rapide */}
        <figure data-speed="0.9" className="absolute bottom-[4%] right-[var(--gutter)] h-[38%] w-[54%] md:h-[46%] md:w-[30%]">
          <div data-reveal data-delay="0.15" className="relative h-full w-full overflow-hidden">
            <Image
              src="/images/placeholder-lieu-skieurs-courchevel.webp"
              alt="Placeholder : skieurs sur une piste damée de Courchevel"
              fill
              sizes="(max-width: 768px) 44vw, 30vw"
              className="object-cover"
            />
          </div>
        </figure>

        {/* Couche 4 — vignette : le chalet entre les sapins */}
        <figure data-speed="0.4" className="absolute bottom-[10%] left-[var(--gutter)] h-[20%] w-[36%] md:left-[22%] md:h-[24%] md:w-[18%]">
          <div data-reveal data-delay="0.3" className="relative h-full w-full overflow-hidden">
            <Image
              src="/images/placeholder-lieu-chalet-sapins.webp"
              alt="Placeholder : chalet de bois dans la neige, entre les sapins"
              fill
              sizes="(max-width: 768px) 30vw, 18vw"
              className="object-cover"
            />
          </div>
        </figure>
      </div>

      {/* Chiffres clés, dans la phrase */}
      <div className="mx-auto mt-[clamp(72px,12vh,160px)] max-w-[1600px] px-[var(--gutter)]">
        <p className="display max-w-[18ch] text-[clamp(2.25rem,5.6vw,5.25rem)] leading-[1.02] text-granite md:ml-[16.6%]">
          À <Counter value="1850" className="text-altitude" /> mètres, <Counter value="24" className="text-altitude" />{" "}
          suites, et <Counter value="0" className="text-altitude" /> mètre entre la porte et la piste.
        </p>
      </div>
    </section>
  );
}

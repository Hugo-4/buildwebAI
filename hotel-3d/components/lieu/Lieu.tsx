"use client";
/**
 * Chapitre 2 — Le lieu.
 * Notre histoire : une photo et quelques lignes, posées sans animation ; puis la
 * saison, composée comme une page d'éditorial (aucune animation ajoutée) ; puis trois
 * chiffres qui roulent à chaque apparition à l'écran (altitude, suites, pistes).
 *
 * CONTENU DE DÉMONSTRATION : l'histoire et la photo (stand-in Unsplash) sont à remplacer
 * par celles de la maison et de l'équipe.
 */
import Image from "next/image";
import Counter from "@/components/ui/Counter";

const FACTS = [
  { label: "Altitude", value: "1850", unit: "m" },
  { label: "Suites", value: "24", unit: "" },
  { label: "Jusqu’aux pistes", value: "0", unit: "m" },
];

export default function Lieu() {
  return (
    <section id="contenu" data-header="dark" aria-labelledby="lieu-title" className="relative bg-snow text-ink">
      {/* ------------------------------ NOTRE HISTOIRE ------------------------------ */}
      <div className="grid grid-cols-4 items-center gap-y-12 px-[var(--gutter)] py-[var(--section-y)] md:grid-cols-6 md:gap-x-[var(--gutter)]">
        <div className="relative col-span-4 aspect-[4/5] overflow-hidden md:col-span-3">
          <Image
            src="/images/histoire-trinquer.webp"
            alt="Deux verres de vin rouge qui trinquent devant le feu d'une cheminée"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[45%_50%]"
          />
        </div>
        <div className="col-span-4 md:col-span-3 md:col-start-4 md:pl-[4vw]">
          <h2 id="lieu-title" className="title text-[clamp(2.2rem,4.4vw,4.6rem)]">
            Notre histoire
          </h2>
          <div className="mt-10 max-w-[42ch] space-y-6 text-[1.1875rem] font-light leading-[1.75] text-ink/85">
            <p>
              L&rsquo;Arolle est née d&rsquo;une envie simple : recevoir comme on reçoit chez soi, à deux pas des pistes. Du bois
              d&rsquo;arolle sur les murs, un feu dans chaque salon, une table où l&rsquo;on prend le temps.
            </p>
            <p>
              Vingt-quatre suites, une équipe qui accueille chaque hôte par son prénom, et la montagne pour seul décor. Ici,
              on vient pour skier, et on reste pour le reste.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------- LA SAISON ---------------------------------- */}
      <div className="border-t border-rule px-[var(--gutter)] pb-[var(--section-y)] pt-[calc(var(--section-y)*0.7)]">
        <p className="caps text-ink/60">La saison</p>
        <p className="giant mt-6 text-[clamp(4.5rem,15vw,15rem)]">
          Décembre<span className="mx-[0.12em] text-ink/30">–</span>Avril
        </p>
        <div className="mt-14 grid grid-cols-4 gap-y-12 md:grid-cols-6 md:gap-x-[var(--gutter)]">
          <p className="col-span-4 max-w-[44ch] text-[1.25rem] font-light leading-[1.75] text-ink/85 md:col-span-3 md:col-start-4">
            De décembre à avril, la maison ouvre ses vingt-quatre suites aux skieurs et à ceux qui ne skient pas. On chausse
            sur la terrasse, on rentre par le spa, on dîne face à la vallée qui s&rsquo;allume.
          </p>
          <dl className="col-span-4 grid grid-cols-3 gap-x-6 border-t border-rule pt-10 md:col-span-6">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="caps text-ink/60">{f.label}</dt>
                <dd className="giant mt-4 text-[clamp(3.6rem,10vw,10rem)]">
                  <Counter value={f.value} />
                  {f.unit && <span className="ml-2 text-[0.35em] tracking-normal">{f.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

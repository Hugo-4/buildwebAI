"use client";
/**
 * Chapitre 2 — Le lieu.
 * Notre histoire : une photo (un marcheur sur la crête) et quelques lignes, posées sans animation ; puis la
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
            src="/images/histoire-montagne.webp"
            alt="Un randonneur sur une crête, face aux montagnes au crépuscule"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[47%_50%]"
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
      <div className="relative isolate overflow-hidden bg-night text-snow">
        <Image
          src="/images/lieu-terrasse-bain-nordique.webp"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-60"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-night/70 via-night/35 to-night/85" />
        <div className="px-[var(--gutter)] py-[calc(var(--section-y)*1.1)] text-center">
          <p className="label text-[clamp(1.1rem,1.6vw,1.5rem)] text-amber">La saison</p>
          <p className="display mt-8 text-[clamp(3rem,9vw,9rem)] italic">Décembre — Avril</p>
          <div aria-hidden className="mx-auto mt-12 h-px w-24 bg-amber/70" />
          <p className="mx-auto mt-12 max-w-[46ch] text-[1.1875rem] font-light leading-[1.8] text-snow/90">
            De décembre à avril, la maison ouvre ses vingt-quatre suites aux skieurs et à ceux qui ne skient pas. On chausse
            sur la terrasse, on rentre par l&rsquo;espace détente, on dîne face à la vallée qui s&rsquo;allume.
          </p>
        </div>
        <dl className="mx-[var(--gutter)] grid grid-cols-3 gap-x-6 border-t border-amber/40 py-12 text-center">
          {FACTS.map((f) => (
            <div key={f.label} className="flex flex-col-reverse">
              <dd className="display text-[clamp(2.6rem,7vw,7rem)]">
                <Counter value={f.value} />
                {f.unit && <span className="ml-2 text-[0.35em] tracking-normal">{f.unit}</span>}
              </dd>
              <dt className="caps mt-4 text-snow/70">{f.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

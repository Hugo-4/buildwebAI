"use client";
/**
 * Chapitre 2 — Le lieu.
 * La maison en une image pleine largeur, révélée par bandes ; puis la saison et
 * trois chiffres qui roulent à chaque fois qu'ils réapparaissent à l'écran
 * (altitude, suites, distance aux pistes).
 */
import Image from "next/image";
import Counter from "@/components/ui/Counter";
import StripReveal from "@/components/ui/StripReveal";

const FACTS = [
  { label: "Altitude", value: "1850", unit: "m" },
  { label: "Suites", value: "24", unit: "" },
  { label: "Jusqu’aux pistes", value: "0", unit: "m" },
];

export default function Lieu() {
  return (
    <section id="contenu" data-header="dark" aria-labelledby="lieu-title" className="relative bg-snow pt-[calc(var(--section-y)*0.5)] text-ink">
      <h2 id="lieu-title" className="sr-only">
        Le lieu
      </h2>

      {/* La maison, pleine largeur, révélée par bandes alignées sur les filets */}
      <StripReveal strips={6} className="mx-[var(--gutter)] h-[70svh] md:h-[88svh]">
        <Image
          src="/images/lieu-salon-vue.webp"
          alt="Le salon double hauteur, ses canapés clairs et ses baies ouvertes sur les sommets enneigés"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </StripReveal>

      {/* La saison, et la maison en trois chiffres */}
      <div className="grid grid-cols-4 gap-y-12 px-[var(--gutter)] py-[var(--section-y)] md:grid-cols-6">
        <h3 className="caps col-span-4 md:col-span-1 md:col-start-2">La saison</h3>
        <p className="col-span-4 max-w-[46ch] text-[1.125rem] leading-relaxed text-ink/85 md:col-span-2 md:col-start-3">
          De décembre à avril, la maison ouvre ses vingt-quatre suites aux skieurs et à ceux qui ne skient pas. On chausse
          sur la terrasse, on rentre par le spa, on dîne face à la vallée qui s&rsquo;allume.
        </p>
        <dl className="col-span-4 grid grid-cols-3 border-t border-rule pt-10 md:col-span-4 md:col-start-2">
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="caps text-ink/60">{f.label}</dt>
              <dd className="giant mt-4 text-[clamp(4.5rem,11vw,11rem)]">
                <Counter value={f.value} />
                {f.unit && <span className="ml-2 text-[0.35em] tracking-normal">{f.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

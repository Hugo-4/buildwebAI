import type { Metadata } from "next";
import Link from "next/link";
import Monogram from "@/components/brand/Monogram";

export const metadata: Metadata = { title: "Mentions légales · L'Arolle" };

/** Page secondaire : sert aussi à démontrer la transition entre pages. */
export default function MentionsLegales() {
  return (
    <main className="min-h-[100svh] bg-snow px-[var(--gutter)] py-10 text-granite">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Retour à l’accueil de L’Arolle">
          <Monogram className="h-9 w-auto" title="" />
          <span className="caps">L&rsquo;Arolle</span>
        </Link>
        <Link href="/" className="caps link-line">
          Retour au séjour
        </Link>
      </header>
      <article className="mx-auto mt-[14vh] max-w-[68ch]">
        <h1 className="display text-[clamp(2.5rem,6vw,5rem)]">Mentions légales</h1>
        <p className="mt-10 leading-relaxed">
          L&rsquo;Arolle est un hôtel fictif créé par BuildWebAI pour démontrer un site d&rsquo;hôtel haut de gamme. Les noms,
          adresses, numéros et contenus sont des exemples à remplacer par ceux de l&rsquo;établissement.
        </p>
        <h2 className="display mt-14 text-[1.75rem]">Visuels</h2>
        <p className="mt-4 leading-relaxed">
          Vidéos et images de l&rsquo;hôtel : générées pour la démonstration. Photos d&rsquo;expériences : Unsplash (licence
          Unsplash), voir public/images/CREDITS.md.
        </p>
        <h2 className="display mt-14 text-[1.75rem]">Données personnelles</h2>
        <p className="mt-4 leading-relaxed">
          Le formulaire de réservation de cette démonstration n&rsquo;envoie aucune donnée.
        </p>
      </article>
    </main>
  );
}

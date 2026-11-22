import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import Lieu from "@/components/lieu/Lieu";

/**
 * Page d'accueil : le scroll raconte un séjour, de l'arrivée au départ.
 * Phase 2 (maquette) : chapitres 1 (arrivée) et 2 (le lieu).
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Lieu />
        {/* Chapitres 3 à 7 : phase 3 */}
        <div id="reserver" data-header="light" className="h-[60vh] bg-altitude" />
      </main>
    </>
  );
}

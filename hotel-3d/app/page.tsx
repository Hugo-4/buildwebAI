import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import Lieu from "@/components/lieu/Lieu";
import Suites from "@/components/suites/Suites";

/**
 * Page d'accueil : le scroll raconte un séjour, de l'arrivée au départ.
 * Maquette (phase 2) : arrivée en vidéo, le lieu, la visite des suites en vidéo.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Lieu />
        <Suites />
        {/* Chapitres 4 à 7 : phase 3 */}
        <div id="reserver" data-header="light" className="h-[60vh] bg-altitude" />
      </main>
    </>
  );
}

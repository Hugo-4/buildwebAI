import Header from "@/components/Header";
import Hero from "@/components/hero/Hero";
import Lieu from "@/components/lieu/Lieu";
import Suites from "@/components/suites/Suites";
import TableSpa from "@/components/table/TableSpa";
import Experiences from "@/components/experiences/Experiences";
import Reservation from "@/components/reservation/Reservation";
import Footer from "@/components/footer/Footer";
import Preloader from "@/components/ui/Preloader";
import Cursor from "@/components/ui/Cursor";
import ProgressBar from "@/components/ui/ProgressBar";
import BookTab from "@/components/ui/BookTab";

/**
 * Page d'accueil : le scroll raconte un séjour, de l'arrivée au départ.
 * 1 Arrivée (vidéo au scroll) · 2 Le lieu · 3 Les suites (4 cases, maintenir pour visiter)
 * 4 La table & le spa · 5 Expériences (accordéon de bandes, sans épinglage) · 6 Réserver · 7 Départ (arrivée rejouée de nuit)
 */
export default function Home() {
  return (
    <>
      <Preloader />
      <ProgressBar />
      <Cursor />
      <Header />
      <BookTab />
      <main>
        <Hero />
        <Lieu />
        <Suites />
        <TableSpa />
        <Experiences />
        <Reservation />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Bodoni_Moda, Jost, Marcellus } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

// Polices auto-hébergées par next/font (aucune requête vers Google au runtime)
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: ["300"], variable: "--font-condensed", display: "swap" });
const caps = Marcellus({ subsets: ["latin"], weight: ["400"], variable: "--font-caps", display: "swap" });
const italic = Bodoni_Moda({ subsets: ["latin"], style: ["italic"], weight: ["400"], variable: "--font-italic", display: "swap" });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "L'Arolle · Hôtel de vingt-quatre suites à Courchevel 1850",
  description:
    "L'Arolle, maison de vingt-quatre suites à Courchevel 1850 : spa et piscine, table de montagne, baies face aux Trois Vallées. Démonstration BuildWebAI.",
  icons: { icon: "/monogram.svg" },
};

export const viewport: Viewport = { themeColor: "#f7f7f5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${condensed.variable} ${caps.variable} ${italic.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Avant le 1er rendu : ?animations=on force les animations complètes (.force-motion) ;
            état de départ du hero (.intro) ; seconde visite, mobile ou mouvement réduit →
            pas de préchargeur peint (.pl-skip) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,q=new URLSearchParams(location.search).get('animations');if(q==='on')localStorage.setItem('larolle-motion','full');if(q==='off')localStorage.removeItem('larolle-motion');var f=localStorage.getItem('larolle-motion')==='full';if(f)d.classList.add('force-motion');var r=!f&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)d.classList.add('intro');if(r||sessionStorage.getItem('larolle-intro')==='1'||(!f&&matchMedia('(max-width: 767px)').matches))d.classList.add('pl-skip')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a href="#contenu" className="skip-link caps">
          Aller au contenu
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

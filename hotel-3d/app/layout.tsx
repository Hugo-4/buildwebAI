import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

// Polices auto-hébergées par next/font (aucune requête vers Google au runtime)
const display = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "L'Arolle · Hôtel de vingt-quatre suites à Courchevel 1850",
  description:
    "L'Arolle, maison de vingt-quatre suites à Courchevel 1850 : spa, table gastronomique, rooftop face aux Trois Vallées. Démonstration BuildWebAI.",
  icons: { icon: "/monogram.svg" },
};

export const viewport: Viewport = { themeColor: "#16245a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#contenu" className="skip-link caps">
          Aller au contenu
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

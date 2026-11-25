# L'Arolle — site vitrine (démonstration BuildWebAI)

Hôtel fictif de vingt-quatre suites à Courchevel 1850. Le scroll raconte un séjour, de l'arrivée au départ, dans l'esprit éditorial de white-desert.com (référence choisie par le client) : fond pierre chaude sans quadrillage, brume WebGL sur le film d'arrivée, phrases qui s'allument mot à mot, images révélées par bandes.

Stack : Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · GSAP + ScrollTrigger · Lenis · Framer Motion · React Three Fiber (brume du hero).

## Lancer le projet en local

Prérequis : Node.js 18.18 ou plus (20 conseillé) : `node -v` pour vérifier.

```bash
cd hotel-3d
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

Si le site ne ressemble pas à la dernière version (ancien affichage, quadrillage encore visible, suites qui défilent au scroll) : mettre le code à jour (`git pull`, ou retélécharger le dossier), arrêter le serveur (Ctrl+C), puis :

```bash
npm install
npm run fresh
```

`npm run fresh` vide le cache de Next (`.next`) avant de relancer. Dans le navigateur, recharger sans cache (Ctrl+Maj+R, ou Cmd+Maj+R sur Mac).

Version de production :

```bash
npm run build
npm start
```

## Les chapitres

| # | Chapitre | Fichier | Ce qui se passe |
|---|---|---|---|
| 1 | L'arrivée | `components/hero/Hero.tsx`, `Mist.tsx` | Film d'arrivée piloté par le scroll ; brume (shader WebGL) ; une phrase sur le film |
| 2 | Le lieu | `components/lieu/Lieu.tsx` | Notre histoire (photo et texte), la saison en bandeau plein écran, trois chiffres qui roulent à chaque apparition |
| 3 | Les suites | `components/suites/Suites.tsx` | Bloc de 4 cases : survoler (souris) ou maintenir appuyé (tactile) lance la visite filmée ; aucun scroll imposé |
| 4 | La table, l'espace détente | `components/table/TableSpa.tsx` | Restaurant (vidéo et carte d'exemple) ; l'espace détente : piscine et quatre éléments, sur fond vert sapin |
| 5 | Expériences | `components/experiences/Experiences.tsx` | Accordéon de bandes verticales, non épinglé (survol ou clic) |
| 6 | Réserver | `components/reservation/Reservation.tsx` | Dates, voyageurs, suite, e-mail ; validation et états d'envoi |
| 7 | Le départ | `components/footer/Footer.tsx` | Le film d'arrivée rejoué à rebours, de nuit |

Transverses : `BookTab` (onglet « Réserver »), `Preloader`, `Cursor`, `Menu`, `ProgressBar`, `app/template.tsx` (transition entre pages, voir `/mentions-legales`).

## Remplacer les vidéos

Seul le hero (et le départ de nuit, qui le rejoue) est piloté par le scroll : c'est une séquence d'images, plus fluide qu'une `<video>` au scroll. Une commande la fabrique à partir d'un MP4 ; ffmpeg est fourni par le paquet `ffmpeg-static` :

```bash
npm run frames -- chemin/vers/arrivee.mp4 hero --frames 200
```

Le script écrit `public/sequences/<nom>/1920/`, `960/` et `manifest.json` ; le site lit le manifest, rien d'autre à changer.

- `hero` : l'approche, les portes, la chambre au feu, le salon (film actuel : entrée + salon en 1080p natif, assemblés en 1920×796 avec un fondu de 0,5 s ; 280 images). Les phrases sont calées dans `Hero.tsx` (tableau `CAPTIONS`, en fraction du scroll).
- Suites : quatre vidéos lues directement, `public/video/suite-arete.mp4`, `suite-lauze.mp4`, `suite-combe.mp4`, `suite-cembro.mp4`, avec leur affiche `*-poster.webp` (noms et surfaces dans `Suites.tsx`, tableau `SUITES`). Pour une qualité maximale, fournir des vidéos en 1080p ou plus : la qualité d'origine est la limite.
- Vidéos d'ambiance (restaurant, piscine) : `public/video/*.mp4`, en aller-retour pour boucler sans saut, avec leur affiche `*-poster.webp`.

Le brief de génération des vidéos (prompts, consignes de caméra) : `brand/brief-video-visite.md`.

## Contenus à valider avec l'hôtel

Noms, surfaces et équipements des suites, horaires, adresse, e-mail : contenu de démonstration. Aucun prix, avis, distinction ni presse n'est affiché. Deux photos d'expériences sont des photos Unsplash (`public/images/CREDITS.md`) ; les autres images sont tirées des vidéos du client. Le formulaire de réservation n'envoie rien : brancher l'envoi dans `submit()`.

## Voir toutes les animations

Le site respecte le réglage système « réduire les animations » (Windows : Paramètres → Accessibilité → Effets visuels → « Effets d'animation » ; Mac : Accessibilité → Affichage → « Réduire les animations »). Dans ce cas il affiche une version fixe : pas de préchargeur, de brume, de défilement fluide ni de films au scroll.

Pour voir **toutes les animations** malgré ce réglage, ouvrir :

```
http://localhost:3000/?animations=on
```

Le choix est mémorisé par le navigateur. Pour l'annuler : `http://localhost:3000/?animations=off`.

## Accessibilité et performance

- `prefers-reduced-motion` : pas de préchargeur, ni de brume, ni de Lenis ; images fixes à la place des films ; suites et expériences à plat.
- Téléphone : pas de préchargeur ni de WebGL ; films cadrés en haut de l'écran.
- Sur ordinateur, les 280 images du hero (24 Mo) se chargent au repos dès l'entrée terminée, pour un défilement fluide d'emblée (sauf connexion lente ou économie de données : alors au premier geste). Ailleurs, les séquences se chargent à l'approche de leur section ; les images proches de la position courante passent devant.
- Mesures locales (Lighthouse, simulation) : ordinateur 98 / 100 / 100 / 100, mobile 87–89 / 100 / 100 / 100.

Le système visuel (couleurs, typographies, durées, courbes) est décrit dans `DESIGN.md`.

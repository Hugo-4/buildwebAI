---
name: L'Arolle
description: Pierre et laiton. Une feuille de pierre chaude réglée comme un plan d'architecte, l'encre chaude, un vert sapin pour la détente et une seule note de laiton pour réserver.
colors:
  snow: "#ebe5d9"
  white: "#ffffff"
  ink: "#1c1915"
  mist: "#8a9096"
  rule: "rgb(21 25 29 / 0.09)"
  amber: "#b8955a"
  amber-hover: "#d4964d"
  night: "#0c1424"
  error: "#9b2c1f"
typography:
  display:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "21vw"
    fontWeight: 300
    lineHeight: 0.82
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Tenor Sans, serif"
    fontSize: "clamp(2.4rem, 5vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0.01em"
  title:
    fontFamily: "Tenor Sans, serif"
    fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "0.01em"
  label:
    fontFamily: "Bodoni Moda, serif"
    fontSize: "clamp(2.4rem, 4.4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Jost, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 300
    lineHeight: 1.65
  caps:
    fontFamily: "Jost, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.2em"
    fontFeature: "tnum"
rounded:
  none: "0px"
  full: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 64px)"
  section-y: "clamp(112px, 18vh, 220px)"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    typography: "{typography.caps}"
    rounded: "{rounded.none}"
    padding: "1.05em 1.7em"
  button-primary-hover:
    backgroundColor: "{colors.amber-hover}"
    textColor: "{colors.ink}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.caps}"
    rounded: "{rounded.none}"
    padding: "0.95em 1.5em"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.snow}"
  book-tab:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    typography: "{typography.caps}"
    rounded: "{rounded.none}"
    padding: "24px 12px"
  book-tab-hover:
    backgroundColor: "{colors.amber-hover}"
  field-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0 0.75rem"
  suite-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.7em 1.3em"
  suite-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.snow}"
  step-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "2.5rem"
---

# Design System: L'Arolle

## Overview

**Creative North Star: "Neige et brume"**

Le site est une feuille de neige (`snow`) réglée comme un plan d'architecte sur six colonnes (quatre sur téléphone), sans quadrillage visible : la grille ne se lit que dans l'alignement des blocs et des bandes. Tout ce qui n'est pas le film de la maison est blanc, calme et exact : l'encre pour le texte, un gris de brume pour la part encore « non lue » des phrases, et une seule note chaude, l'ambre d'arolle, pour l'action de réserver et les instruments qui l'accompagnent (focus, curseur, barre de lecture).

Le geste signature est une brume de montagne WebGL qui monte du bas de l'écran au premier scroll, au-dessus du film d'arrivée, sous une seule ligne italique. Ensuite le récit avance par énoncés qui s'allument mot à mot, images qui s'ouvrent par bandes verticales calées sur les colonnes, et un onglet ambré toujours fixé au bord droit. Le mouvement est lent et doux : entrées en expo-out d'environ 1,1 à 1,6 s, tout ce qui est lié au scroll est scrubé, rien ne rebondit, rien n'est incliné.

Densité basse, beaucoup d'air (`section-y` jusqu'à 220px), coins carrés, filets d'un pixel, aucun aplat de couleur. Historique : ce monde a remplacé, à la demande de l'utilisateur, un premier monde « Photomontage alpin » (champs bleus coupés à 12°, Bodoni en display) ; seuls le monogramme A-pente, l'ambre d'action, les films et la mécanique de scroll ont été conservés.

**Key Characteristics:**
- Fond neige, six colonnes invisibles (quatre sur téléphone) entre gouttières.
- Quatre voix typographiques à rôles stricts : condensée géante, capitales serif, italique didone, sans légère.
- Une seule couleur chaude, réservée à l'action ; aucun aplat, aucun dégradé décoratif.
- Coins carrés partout ; le cercle n'existe que pour les instruments (curseur, spinner).
- Mouvement scrubé par le scroll, expo-out pour les entrées, in-out pour les trajets.

## Colors

Une palette de neige et d'encre, sans aplat : la couleur vient des films ; l'interface reste blanche.

### Primary
- **Ambre d'arolle** (`amber`) : l'onglet « Réserver » fixé au bord droit, le bouton principal du formulaire, l'anneau de focus (1.5px, décalage 4px), le caret, le point et l'anneau du curseur, la barre de lecture d'un pixel en haut. Au survol d'une surface ambrée : **Ambre éclairé** (`amber-hover`).

### Neutral
- **Pierre** (`snow`, #ebe5d9) : fond de toute la page, du menu plein écran, du panneau des suites ; aussi la couleur du texte posé sur film ou sur encre. `themeColor` du navigateur.
- **Encre** (`ink`) : texte, sélection (fond encre, texte neige), boutons au survol, puce de suite choisie, champ de ton du chapitre espace détente (`data-header="ink"`). Opacités d'usage : 85 % pour les paragraphes, 70 % pour les libellés de formulaire, 60 % pour les légendes de chiffres.
- **Gris de brume** (`mist`) : uniquement la part non encore lue d'un énoncé qui s'allume, et la barre de défilement. Sur fond sombre, la part non lue est la neige à 45 %.
- **Filet** (`rule`) : bordures de l'en-tête sur neige, séparateurs de sections (`border-t`), lignes de listes.
- **Nuit** (`night`) : fond de la séquence de départ (pied de page), voile à 35 % sur le film rejoué de nuit.
- **Blanc** (`white`) : réserve, presque jamais visible ; la neige le remplace.

### Signal
- **Rouge brique** (`error`) : bord inférieur d'un champ invalide et message d'erreur (0.875rem). Rien d'autre.

### Named Rules
**La règle de la seule note chaude.** L'ambre ne sert qu'à l'action de réserver et aux instruments du pointeur et du focus. Les seules surfaces ambrées sont l'onglet et le bouton principal ; aucun titre, fond ou illustration n'est ambré.

**La règle sans aplat.** Aucun champ de couleur. Les seuls dégradés autorisés sont la brume WebGL et les voiles d'encre fonctionnels (encre 25 à 55 % vers transparent) qui rendent le texte lisible sur un film.

## Typography

**Display Font:** Bodoni Moda 400, droit et italique (repli serif), variable `--font-italic`
**Headline Font:** Tenor Sans 400 (repli serif), variable `--font-caps`
**Label Font:** Bodoni Moda italique 400 (repli serif), variable `--font-italic`
**Body Font:** Jost 300 et 400 (repli sans-serif), variable `--font-sans`

Toutes chargées et auto-hébergées par `next/font` avec `display: swap`.

**Character:** une condensée très fine et géante pour le seul nom, des capitales lapidaires pour parler, une italique didone pour nommer, une sans légère pour tout le reste. Le contraste vient de l'échelle, jamais de la graisse.

### Hierarchy
- **Display** (`.display` : Bodoni Moda 400, casse normale, interlignage 0.95, approche -0.02em, chiffres alignés) : « Décembre — Avril » en italique, les chiffres de la maison, « Votre séjour commence ici », l'adieu du pied de page. Le nom géant du hero a été retiré : le hero ne porte plus qu'une ligne italique et une phrase.
- **Headline** (`.title` : Tenor Sans 400, capitales, interlignage 1.16, approche 0.045em, `text-wrap: balance`) : titres de chapitre de clamp(1.9rem, 3.4vw, 3.4rem) à clamp(2.5rem, 5.6vw, 5.5rem) ; les liens du menu clamp(2.2rem, 6.4vh, 4.5rem).
- **Title** (`.title`, plus petit) : phrases posées sur le film, clamp(1.75rem, 3.6vw, 3.25rem) ; version à plat en mouvement réduit clamp(1.6rem, 2.6vw, 2.4rem).
- **Label** (`.label` : Bodoni Moda italique 400) : noms des suites (clamp(1.5rem, 2.6vw, 2.6rem), interlignage 1.05, soulignés du trait `.swash`), titres d'expériences (clamp(1.8rem, 2.6vw, 2.6rem)), l'étiquette de deux lignes du hero (1.0625rem).
- **Body** (Jost 300, 1.0625rem / 1.65) : paragraphes, largeur 34 à 46ch, interlignage `relaxed` ; paragraphe d'introduction à 1.125rem.
- **Caps** (`.caps` : Jost 400, 0.75rem, capitales, approche 0.2em, chiffres tabulaires) : navigation, libellés de formulaire, onglet, bouton, listes de prestations, mentions. Nom sous le monogramme à 0.6875rem ; bouton d'envoi à 0.8125rem.

### Named Rules
**La règle d'un nom géant.** La condensée géante est réservée au nom de la maison, aux chiffres et à l'adieu final. Un titre de section parle en Tenor Sans, jamais en condensée.

**La règle de l'italique qui nomme.** La Bodoni italique nomme (une suite, une expérience, un lieu) ; elle ne sert jamais de surtitre au-dessus d'un titre.

## Layout

**Grille.** Six colonnes égales (quatre sous 768px) entre deux gouttières `gutter`, non matérialisées (le quadrillage fixe a été retiré à la demande du client). Les contenus s'alignent sur ces colonnes : titres en colonnes 2 à 5, paragraphe en 3 et 4, formulaire en 4 à 6, chiffres en 2 à 5. Les images en pleine largeur restent entre les gouttières (`mx-[var(--gutter)]`), sauf les films en plein cadre.

**Rythme.** Chaque chapitre respire de `section-y` en haut et en bas ; à l'intérieur, les écarts vont de 4px (bandes d'expériences) à 64px (`gap-y-16`) entre blocs. Les sections plein écran utilisent `svh`.

**Empilement.** barre de lecture 60 · menu 70 · onglet Réserver 75 · en-tête 80 · curseur 90 · préchargeur et lien d'évitement 100.

**En-tête.** Grille à trois colonnes, `py-5` : chapitres à gauche (cachés sur téléphone), monogramme 32px et nom au centre, « Menu » à droite. Son ton suit la section sous la barre (y = 40px) via `data-header` : `light` (transparent, texte neige sur film), `dark` (fond neige, filet, encre), `ink` (fond encre, texte neige) ; transition 500ms expo-out.

**Téléphone et mode allégé.** Le mode allégé s'active sous 768px ou sur pointeur grossier : pas de brume WebGL, accordéon d'expériences remplacé par une rangée à défilement horizontal aimanté (cartes 78vw, max 22rem, ratio 3/4), bandes limitées à quatre, préchargeur sauté. Le film du hero est cadré dans une boîte portrait (62 % de la hauteur) et la ligne de présentation et la phrase passent à l'encre sur la neige sous le film. L'onglet Réserver devient une barre horizontale pleine largeur en pied d'écran.

## Elevation & Depth

Le système est plat. La profondeur vient de la superposition : film, puis brume, puis texte, et de deux voiles fonctionnels. Aucune ombre portée sur un élément d'interface.

### Shadow Vocabulary
- **Halo de lisibilité** (`text-shadow: 0 2px 30px rgba(21,25,29,.35)`) : seulement sur un titre neige posé sur un film clair (intro des suites).
- **Voiles d'encre** (dégradés encre 40 % en haut sur 144 à 160px, 45 % en bas sur 45 % de la hauteur, 55 % / 25 % sur une bande d'expérience ouverte) : sous l'en-tête et sous les phrases posées sur film.
- **Voile de neige** (neige à 45 % d'opacité) : éteint les bandes d'expériences fermées.

### Named Rules
**La règle de la brume.** La seule matière atmosphérique est la brume : bruit fbm à cinq octaves, couleur pierre chaude (0.90, 0.875, 0.83), densité réduite de 20 %, rendue à 75 % de densité de pixels. Elle ne recouvre que le hero.

## Shapes

Coins carrés partout (`rounded.none`) : boutons, onglet, champs, puces, images, panneaux. Les bords sont des filets d'un pixel en encre à 25 à 30 % (champs, puces, boutons de pas) ou en `rule`. Le cercle (`rounded.full`) n'existe que pour les instruments : point et anneau du curseur, spinner d'envoi.

Deux formes de marque : le **monogramme A-pente** (A didone construit, délié à gauche, plein à droite, traverse qui suit la pente à 12° et sort de la lettre comme une trace de ski ; une seule couleur, `currentColor`), seule oblique admise du système ; et le **trait tracé à la main** (`.swash`) sous un nom de suite, masque SVG de deux courbes, `currentColor` à 55 %, 0.32em de haut. Les images se découpent en **bandes verticales** alignées sur les colonnes, jamais en diagonale.

## Components

### Buttons
- **Shape :** carré (0px), contenu en ligne avec un écart de 0.9em.
- **Primaire** (`.btn`) : fond ambre, texte encre en `caps`, 1.05em × 1.7em. Survol : ambre éclairé en 320ms expo-out. Appui : `scale(0.98)` en 160ms. Envoi : spinner 0.9em (rotation 0.7s linéaire), opacité 0.85, curseur `progress`. Enveloppé dans `Magnetic` (force 0.3, suivi 0.6s expo-out).
- **Filet** (`.btn-line`) : bord 1px `currentColor`, 0.95em × 1.5em ; survol : se remplit d'encre, texte neige, 320ms.
- **Lien souligné** (`.link-line`) : trait de 1px sous le texte au repos ; au survol, il se retire vers la droite (taille de fond 100 % à 0 %, 320ms expo-out).
- **Focus :** anneau ambre 1.5px, décalage 4px, sur tout élément.

### Onglet Réserver (signature)
Fixé au bord droit, centré verticalement, ambre, texte `caps` vertical (`vertical-rl` tourné à 180°) et une croix de 12px ; c'est la seule surface colorée de la page. Survol : ambre éclairé, marge droite +4px, la croix tourne de 90° (300ms expo-out). Clic : défilement Lenis de 1.8s vers `#reserver`. Sur téléphone : barre horizontale pleine largeur en bas.

### Inputs / Fields
- **Style :** sans fond ni cadre, seulement un trait inférieur encre à 25 %, texte 1.25rem, placeholder encre à 50 %, libellé `caps` encre à 70 % au-dessus.
- **Focus :** un trait d'encre de 1.5px se déroule de gauche à droite (`scaleX` 0 → 1, 320ms expo-out) ; pas d'anneau sur le champ lui-même.
- **Erreur :** trait inférieur et message en rouge brique.
- **Pas (+/−) :** carré de 40px, bord encre à 30 %, icône 14px ; survol plein encre, appui `scale(0.94)`, désactivé à 30 % d'opacité.
- **Puces de suite :** radio masqué, étiquette 0.7em × 1.3em bordée d'encre à 25 % ; survol bord encre ; choisie : pleine encre, texte neige.

### Navigation
En-tête décrit dans Layout ; liens de chapitres en `caps` avec `.link-line`. Le **menu** plein écran est un rideau de neige qui descend (`clip-path` inset 100 % → 0, 0.9s in-out) et remonte à la fermeture (0.55s in) ; ses liens en Tenor Sans montent de 105 % (0.9s expo-out, décalés de 0.05s à partir de 0.25s) et sortent vers le haut (0.3s in). Bas du menu : adresse et e-mail en `caps` sur un filet.

### Suites en bloc de quatre cases (`Suites`)
Un seul bloc 2 × 2 (`gap-x` 4px, 12px dès `sm`), sans épinglage ni scroll imposé. Chaque case : un film H.264 de 1600px (`/video/suite-*.mp4`, sans son, boucle, téléchargé à l'approche de l'écran) sous une affiche WebP ; en dessous, le nom en Bodoni italique souligné du trait `.swash`, la surface en `caps`, trois lignes d'équipements (masquées sous `sm`). Lecture : souris = survol (re-clic verrouille/déverrouille) ; tactile = maintenir appuyé (relâcher ou faire glisser pour défiler arrête) ; clavier = Entrée ou Espace. Une puce d'invitation (« Survoler pour visiter » / « Maintenir pour visiter ») disparaît pendant la lecture ; un trait de 3px en pied de case montre l'avancement.

### Chiffres du lieu (`Counter`)
Roulement `expo.inOut` de 1.3s à 1.3s + 0.18s par rang, décalé de 0.06s ; il rejoue à chaque apparition à l'écran (haut à 88 %), aller comme retour, et se remet à zéro dès que le bloc sort. Mouvement réduit : valeur finale.

### (retiré) Énoncé qui s'allume
Une phrase en Tenor Sans repose en gris de brume et passe à l'encre mot à mot quand elle traverse l'écran (du haut de la phrase à 85 % au bas à 45 %), dans les deux sens ; chaque mot change de couleur en 0.45s expo-out. Variante sur fond sombre : neige à 45 % puis neige. Un double `sr-only` porte la phrase entière.

### Révélation par bandes (`StripReveal`)
Une image ou un film découpé en six bandes (quatre sur téléphone) par un `clip-path` unique ; chaque bande s'ouvre depuis son axe en `power2.out`, la bande i démarrant à i/n × 0.55 du parcours et s'ouvrant sur 0.45. Scrubé de « haut à 85 % » à « haut à 15 % ».

### Accordéon de bandes (Expériences)
Section NON épinglée (le scroll n'est jamais imposé) ; une rangée de 62svh, bandes séparées de 4px. L'expérience courante s'ouvre (`flex-grow` 7 contre 1, 900ms expo-out), les autres restent étroites sous un voile de neige à 45 % (700ms). Le survol volontaire (mouvement de plus de 4px, au plus une bascule par 700ms), le clic, le toucher et le clavier l'ouvrent. Titre en Bodoni italique et texte apparaissent 300ms après l'ouverture.

### Séquences de scroll (`ScrollSequence`)
Les films de la maison (arrivée, départ) défilent image par image avec le scroll ; seul le hero est épinglé (le départ ne dure que 2,6 écrans). Hero : film natif 1080p (entrée + salon, 1920×796), 280 images WebP qualité 86 en 1920 et 960 px, lissage canvas « high » ; chargement au repos sur ordinateur (au premier geste sur connexion lente, tactile ou économie de données). Le départ rejoue l'arrivée à l'envers, de nuit : multiplication bleu nuit puis voile `night` à 35 %, sur fond `night`. Les phrases s'y posent en `title` (entrée 24px vers 0 en `power2.out`, sortie -16px en `power2.in`).

### Curseur et instruments
Curseur sur pointeur fin seulement : point ambre de 6px qui suit exactement, anneau ambre qui le rattrape (0.45s `power3.out`), s'élargit sur un lien et peut porter un mot. Barre de lecture : trait ambre d'un pixel, `scaleX` lié au scroll. Préchargeur : le monogramme se trace (pleins et déliés 0.7s, empattements 0.4s, barre 0.9s), compteur, puis rideau qui remonte (0.9s `expo.inOut`) ; une fois par session, ordinateur seulement.

### Mouvement : courbes et durées
Une seule famille de courbes, définie à la fois en CSS et dans `lib/motion.ts` :
- **expo-out** (`--ease-out-expo`, `cubic-bezier(0.16, 1, 0.3, 1)`, GSAP `expo.out`) : toutes les entrées et les états d'interface. Défaut GSAP du projet.
- **in-out** (`--ease-in-out`, `cubic-bezier(0.65, 0, 0.35, 1)`, GSAP `power3.inOut`) : trajets liés au scroll, rideau du menu, indice « Descendre » (2.4s en boucle).
- **in** (`--ease-in`, `cubic-bezier(0.55, 0, 1, 0.45)`, GSAP `power2.in`) : sorties, environ 75 % de la durée d'entrée.
- **Durées :** micro 160ms (appui) · interface 320ms (survols, focus) · révélation 1.1s (défaut GSAP) · lignes de titre 1.15s · titre 1.4s ; le nom du hero monte lettre par lettre en 1.6s, décalage 0.06s. Défilement doux Lenis 1.15s ; ancres 1.6s, réservation 1.8s.
- **Brume :** monte de 0 à 13 % du scroll du hero, se retire jusqu'à 24 % ; amorti exponentiel (constante 5/s) ; le nom s'efface entre 35 % et 85 % de couverture avec un flou jusqu'à 8px et une montée de 8 %.

### Mouvement réduit
`prefers-reduced-motion` ramène toute animation et transition CSS à 0.01ms. En plus : pas de classe `intro` ni de préchargeur, pas de brume, la phrase du hero présentée à plat sur la neige, énoncés directement à l'encre, images en entier sans bandes, suites : la visite ne se lance que sur action explicite (clic ou clavier), jamais au survol, expériences en rangée à faire défiler, menu sans animation, curseur sans retard.

## Do's and Don'ts

### Do:
- **Do** poser toute nouvelle surface sur la neige (`snow`) et aligner ses blocs sur les six colonnes (quatre sous 768px), entre gouttières `gutter`.
- **Do** espacer les chapitres de `section-y` (clamp(112px, 18vh, 220px)).
- **Do** réserver l'ambre à l'action de réserver et aux instruments (focus, caret, curseur, barre de lecture).
- **Do** utiliser expo-out pour entrer, in-out pour les trajets scrubés, in pour sortir, avec les durées 160ms / 320ms / 1.1s du système.
- **Do** révéler les images par bandes verticales alignées sur les colonnes, et faire s'allumer les énoncés mot à mot plutôt que de les faire glisser.
- **Do** fournir pour chaque effet de scroll une version à plat en mouvement réduit et une version allégée sur téléphone.
- **Do** garder les coins carrés et les filets d'un pixel.

### Don't:
- **Don't** créer d'aplat de couleur ni de dégradé décoratif ; seuls la brume et les voiles d'encre de lisibilité sont admis.
- **Don't** utiliser la condensée géante pour un titre de section, ni la Bodoni italique comme surtitre.
- **Don't** incliner une mise en page, une image ou un bloc : la seule oblique du système est la traverse du monogramme.
- **Don't** arrondir un bouton, une carte, un champ ou une image ; le cercle est réservé au curseur et au spinner.
- **Don't** ajouter d'ombre portée à un élément d'interface ni de rebond au mouvement.


## Mise à jour (ronde Pierre et laiton)

- Palette : fond pierre `#ebe5d9` (jeton `snow`, aussi la couleur du texte sur film : plus de blanc franc), encre chaude `#1c1915`, laiton `#b8955a` (jeton `amber`), vert sapin `#1f2b26` (`pine`, champ de l'espace détente), nuit `#0e1218`.
- Typographie : Barlow Condensed supprimée ; Bodoni Moda (droit et italique) pour les chiffres, « Décembre — Avril », le titre de réservation et l'adieu ; Tenor Sans pour les titres ; Jost pour le texte.
- Hero : plus de nom géant ni de phrase du salon ; seule « Nous vous ouvrons les portes de l'Arolle. » reste.
- La saison : bandeau plein écran sur la terrasse de nuit, voile sombre, filets laiton, chiffres en Bodoni.
- Restaurant : vidéo sur la moitié gauche, texte et horaires à droite, titre sur une ligne. Spa renommé « L'espace détente » (`#detente`).
- Suites : titre d'une ligne, réduit, pour que les images apparaissent sur le premier écran.

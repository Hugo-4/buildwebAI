# Açai Lab Café — landing page (`@acailab.pe`)

One-page en espagnol, mobile-first, pour Açai Lab Café (Av. Los Conquistadores 701, San Isidro, Lima).
HTML + CSS + JS sans build. GSAP 3.12.5 + ScrollTrigger via cdnjs, Lenis 1.1.20 (MIT, embarqué dans `assets/vendor/`), polices Instrument Serif + DM Sans (Google Fonts).

## Lancer en local

```bash
cd acai-lab
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080 (ou `npx serve .`). Mieux vaut passer par un serveur local qu'ouvrir le fichier directement : c'est plus proche des conditions réelles (cache, préchargement).

Mise en ligne : copier le dossier `acai-lab/` tel quel sur n'importe quel hébergement statique (Hostinger, Netlify, Vercel, GitHub Pages).

## Structure

```
acai-lab/
├── index.html
├── assets/
│   ├── css/style.css          tokens couleur, layout mobile-first, transitions cubic-bezier(0.16,1,0.3,1)
│   ├── js/main.js             moteur FrameSeq + hero, carte, outro (RAPPI_URL en haut du fichier)
│   ├── vendor/                lenis-1.1.20.min.js
│   ├── img/                   logo, favicon, posters 1080 px (frame-hero-start.jpg, frame-carta-latte.jpg, …)
│   │   ├── social/            social-1.jpg … social-5.jpg (photos HD fournies par le client)
│   │   └── carta/             photos studio HD (voir « À compléter »)
│   └── seq/                   séquences d'images WebP (hd = 1080 px natif, md = 720 px)
│       ├── hero-blend/        145 frames — blender (hero, phase 1)
│       ├── hero-dispense/      92 frames — bec verseur + bol (hero, phase 2)
│       ├── hero-toppings/     120 frames — toppings + peanut butter (hero étape 3 et onglet Bowl, un seul téléchargement)
│       ├── carta-drink/       239 frames — Peanut Butter Latte → Mango Matcha
│       └── outro-box/         102 frames — unboxing
```

## Choix techniques

- **Séquences d'images sur `<canvas>` au lieu de `<video>`.** Les clips ont été livrés en frames ; c'est aussi la méthode la plus fiable pour le scrub au scroll (sur iOS, scrubber `video.currentTime` saccade). Chaque séquence se charge du grossier au fin (1 frame sur 16, puis 8, 4, 2, toutes) : le scrub est utilisable avant la fin du téléchargement. Chaque frame est décodée (`img.decode()`) avant de pouvoir être affichée : aucun décodage pendant le scroll. Entre deux frames, le canvas fond les deux images selon la position exacte (scrub sans à-coups), en `imageSmoothingQuality: high`. Les canvas affichés à plus de 760 px physiques reçoivent la version `hd` (1080 px, résolution native des rendus), les autres la version `md` (720 px). Le hero est chargé en priorité ; la carte et l'outro attendent qu'il soit prêt.
- **Scroll** : Lenis lisse la molette et le trackpad sur desktop ; sur tactile le scroll natif (inertie iOS/Android) est conservé. Lissage du hero indépendant de la fréquence d'écran (60/120 Hz).
- **Fond invisible.** Les frames d'origine avaient un fond crème plus foncé, avec vignettage. Elles ont été retraitées : fond modélisé puis recalé exactement sur `#F7F5F0`, objets intacts, bords fondus. Le canvas a `background: #F7F5F0` (écart mesuré ≤ 5/255 avec la page) : aucun cadre visible.
- **Hero** : section épinglée (`pin`, `end: +=240%`), progression lissée en `requestAnimationFrame`. Trois chapitres : 01 Pureza (blender), 02 Precisión (bol), 03 Carácter (toppings). Blender → bol : fondu + translateY de 0,3 s ; bol → toppings : fondu pur, les deux séquences étant recadrées à la même échelle. Hystérésis aux frontières, sans scintillement. `frame-hero-start.jpg` s'affiche avant la première frame.
- **La Carta** : desktop en 50/50 avec visuel sticky ; mobile avec visuel sticky en haut (36svh) + onglets, la liste défile librement. Matcha joue la séquence en avant à 1,5× (36 i/s), Cafés la rejoue à l'envers depuis la position courante. L'accent passe au vert sauge. L'onglet Bowl joue la chute des toppings ; `↻ Reproducir` ou un tap sur le bol la relance.
- **Outro** : l'unboxing se rejoue à chaque arrivée dans le viewport et se rembobine quand on le quitte (IntersectionObserver), sans bloquer le scroll.
- **Photos studio** : chaque animation se termine par un fondu de 0,3 s vers une photo HD (latte au repos, Mango Matcha en fin de morphing, bowl après les toppings, boîte ouverte après l'unboxing). Au clic sur un matcha, sa photo remplace la précédente en fondu. Si un fichier manque, l'animation reste affichée.
- `prefers-reduced-motion` : les animations automatiques sautent à la dernière frame, les apparitions sont désactivées.

## À compléter

1. **Lien Rappi** : `RAPPI_URL` en haut de `assets/js/main.js` (pour l'instant la page d'accueil de Rappi Pérou).
2. **Photos en pleine résolution** : les 6 photos de `assets/img/social/` sont recadrées depuis des captures d'écran Instagram (~350 px de large, agrandies ×2). Pour un rendu parfait, les remplacer par les originaux (≥ 1200 px de large) en gardant les mêmes noms : 1 azulejo violeta, 2 bagels sur bandeja, 3 açai bowl, 4 mesa monogramada, 5 Mugler, 6 The Charming Booth.
3. **Photos studio HD restantes** dans `assets/img/carta/` : `latte-peanut-butter.jpg`, `acai-bowl.jpg`, `box-open.jpg` (les 5 matchas sont en place, alignés sur la fin du morphing).
4. **Prix** : la carte n'affiche que les prix fournis (cold foam S/ 2, extras S/ 3.50).

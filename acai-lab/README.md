# Açai Lab Café — landing page (`@acailab.pe`)

One-page en espagnol, mobile-first, pour Açai Lab Café (Av. Los Conquistadores 701, San Isidro, Lima).
HTML + CSS + JS sans build. GSAP 3.12.5 + ScrollTrigger via cdnjs, polices Instrument Serif + DM Sans (Google Fonts).

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
│   ├── img/                   logo, favicon, posters (frame-hero-start.jpg, frame-carta-latte.jpg, …)
│   │   └── social/            ← déposer social-1.jpg … social-4.jpg ici
│   └── seq/                   séquences d'images WebP (lg = 900 px, sm = 540 px)
│       ├── hero-blend/        145 frames — blender (hero, phase 1)
│       ├── hero-dispense/      92 frames — bec verseur + bol (hero, phase 2)
│       ├── carta-drink/       239 frames — Peanut Butter Latte → Mango Matcha
│       ├── carta-bowl/        240 frames — toppings + peanut butter
│       └── outro-box/         102 frames — unboxing
```

## Choix techniques

- **Séquences d'images sur `<canvas>` au lieu de `<video>`.** Les clips ont été livrés en frames ; c'est aussi la méthode la plus fiable pour le scrub au scroll (sur iOS, scrubber `video.currentTime` saccade). Chaque séquence se charge du grossier au fin (1 frame sur 16, puis 8, 4, 2, toutes) : le scrub est utilisable avant la fin du téléchargement. Les écrans qui affichent le canvas à moins de 640 px physiques reçoivent la version `sm`.
- **Fond invisible.** Les frames d'origine avaient un fond crème plus foncé, avec vignettage. Elles ont été retraitées : fond modélisé puis recalé exactement sur `#F7F5F0`, objets intacts, bords fondus. Le canvas a `background: #F7F5F0` et un masque doux sur les bords : aucun cadre visible.
- **Hero** : section épinglée (`pin`, `end: +=180%` → 280vh au total), progression lissée en `requestAnimationFrame`. 0–50 % : blender, 50–100 % : bol. Fondu enchaîné + translateY de 0,3 s à 50 % (avec hystérésis, sans scintillement). `frame-hero-start.jpg` s'affiche avant la première frame.
- **La Carta** : desktop en 50/50 avec visuel sticky ; mobile avec visuel sticky en haut (36svh) + onglets, la liste défile librement. Matcha joue la séquence en avant à 1,5× (36 i/s), Cafés la rejoue à l'envers depuis la position courante. L'accent passe au vert sauge. L'onglet Bowl joue la chute des toppings ; `↻ Reproducir` ou un tap sur le bol la relance.
- **Outro** : l'unboxing se joue une seule fois à l'entrée dans le viewport (IntersectionObserver), sans bloquer le scroll.
- `prefers-reduced-motion` : les animations automatiques sautent à la dernière frame, les apparitions sont désactivées.

## À compléter

1. **Lien Rappi** : `RAPPI_URL` en haut de `assets/js/main.js` (pour l'instant la page d'accueil de Rappi Pérou).
2. **Photos réelles** : `assets/img/social/social-1.jpg` (piso violeta), `social-2.jpg` (bandejas de acero), `social-3.jpg` (Curva Studio Pilates), `social-4.jpg` (Mugler / The Charming Booth). Format portrait conseillé (4:5), ~1200 px. Tant qu'une photo manque, la tuile affiche un visuel de remplacement dessiné en CSS.
3. **Prix** : la carte n'affiche que les prix fournis (cold foam S/ 2, extras S/ 3.50).

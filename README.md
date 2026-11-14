# BuildWebAI — site vitrine

Homepage de BuildWebAI : site, réservation directe et automatisations IA pour restaurants, hôtels, caves à manger et bars à vins.

- `index.html` : page unique (Tailwind CSS compilé dans `assets/tailwind.css`, GSAP ScrollTrigger, Lenis, police Space Grotesk)
- `assets/site.css` : styles et règles de mouvement (seules `transform` et `opacity` sont animées)
- `assets/app.js` : preloader, simulation d'appel, vitrine 3D au scroll, simulateur ROI, slider avant/après, onglets tarifs, formulaire d'audit
- `assets/img/` : photos (Unsplash, licence Unsplash)
- `public/frames-bistrot/` : séquence du plat signature, `frame_0001.webp` à `frame_0120.webp` (1080×1920) et `540/` (540×960, servie aux écrans qui n'ont pas besoin de plus)
- `public/frames-bar/` : séquence du bar à vin, même structure (à déposer ; tant qu'elle manque, l'onglet Bar affiche `public/editorial/bar.webp`)
- `public/editorial/` : visuels verticaux des onglets Fast-Food, Épicerie et Bar (Unsplash, licence Unsplash)

## Build

Le CSS Tailwind est compilé (pas de CDN en production) :

```bash
npm install
npm run build   # génère assets/tailwind.css (minifié)
npm run dev     # recompile à chaque modification
```

Relancer `npm run build` après toute modification des classes dans `index.html` ou `assets/app.js`, puis committer `assets/tailwind.css`.

Aperçu local : `npx serve .` puis ouvrir l'adresse affichée.

Contact : contact@build-web-ai.com

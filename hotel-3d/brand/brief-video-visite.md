# Brief vidéo : « On entre dans L'Arolle »

But : une séquence continue, découpée ensuite en images (environ 150), que le scroll fait défiler.
On s'approche du chalet, on entre, on traverse le salon et on finit dans une suite, face à la fenêtre.

## Spécifications de rendu

| Paramètre | Valeur |
|---|---|
| Format | 16:9, 1920×1080 minimum (4K si possible). Bonus : une version 9:16 pour le mobile |
| Durée | 3 plans de 5 à 8 s, enchaînés (voir plus bas) |
| Cadence | 24 ou 30 i/s |
| Caméra | un seul travelling avant, lent, **vitesse constante**, sans coupe, sans zoom, sans secousse, à hauteur d'œil (1,6 m) |
| Exposition | fixe, sans variation de luminosité d'une image à l'autre |
| Interdits | texte, logo, filigrane, personnes face caméra, flou de mouvement marqué, effet « fish-eye », vue drone qui tourne |

La vitesse constante compte plus que tout : le scroll avance d'une image par cran. Une caméra qui accélère donne un scroll qui saute.

## Chaîner les plans

Les outils (Veo, Kling, Runway, Sora…) font 5 à 10 s par génération. On enchaîne trois plans : **la dernière image du plan N sert d'image de départ au plan N+1** (option « image to video », « start frame » ou « extend »). Sinon le raccord se voit.

1. **Extérieur → porte** : chalet savoyard dans la neige, la caméra avance vers la porte d'entrée, qui s'ouvre.
2. **Porte → salon** : on traverse l'entrée puis le salon (cheminée allumée) en direction d'un couloir ou d'un escalier.
3. **Suite → fenêtre** : on entre dans une suite et on avance jusqu'à la grande baie. Les sommets sous un ciel bleu profond remplissent le cadre.

## Prompts (en anglais : les outils répondent mieux)

**Style commun, à coller au début de chaque prompt :**

> Cinematic architectural photography, luxury boutique hotel in Courchevel 1850, French Alps. A Savoyard chalet built from pale knotty Swiss stone pine wood (arolla pine), lime plaster walls, grey slate, raw wool and linen textiles, very few objects. Palette: cold snow white, deep ultramarine winter sky (#16245A), pale blue shadows on snow, warm amber lamplight (#C8873A) only from lamps and fireplace. Clear winter afternoon, low sun, crisp. Restrained, quiet, uncluttered, editorial, like a 1930s Swiss ski poster turned into photography. Single continuous slow dolly-in at eye level, constant speed, no cuts, no zoom, no camera shake, locked exposure, sharp focus, 35mm lens.

**Plan 1 :**

> [style] The camera starts on a snow-covered slope facing the chalet perched on the ridge, deep blue sky above, and glides straight toward the heavy wooden front door; the door slowly opens inward revealing warm amber light inside.

**Plan 2 :**

> [style] Continuing from the open front door, the camera glides through a stone-floored entrance into a double-height living room panelled in pale arolla pine, a fire burning in a minimalist stone fireplace, low wool sofas, large windows showing snowy peaks; the camera keeps moving forward toward a wooden staircase.

**Plan 3 :**

> [style] The camera glides into a quiet suite: low bed dressed in white linen and a grey wool throw, pale pine walls and ceiling, a single amber reading lamp, a freestanding stone bathtub in the corner; the camera moves slowly toward a floor-to-ceiling window until the snowy mountain peaks under a deep blue sky fill the whole frame.

**À ajouter en négatif (si l'outil le permet) :**

> text, watermark, logo, people, faces, clutter, Christmas decorations, fur rugs, antlers, motion blur, fast camera, camera rotation, fisheye, flicker, exposure change, cartoon, CGI look, oversaturated colors

## Ce qu'il faut m'envoyer

Les fichiers vidéo bruts (MP4/MOV), dans la meilleure qualité disponible. Je m'occupe du reste : découpe en images, compression WebP en deux tailles (ordinateur et mobile), préchargement progressif et lien avec le scroll.

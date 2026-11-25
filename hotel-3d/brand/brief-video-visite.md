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

## Répartition sur le site (mise à jour)

Le site attend **deux vidéos**, chacune pilotée par le scroll :

| Vidéo | Contenu | Commande |
|---|---|---|
| `hero` | Plans 1 et 2 : approche du chalet, porte qui s'ouvre, entrée | `npm run frames -- arrivee.mp4 hero` |
| `suites` | Trois suites à la suite, **chacune occupant un tiers de la durée** (ex. 3 × 5 s) : le texte de chaque suite change à 1/3 et 2/3 | `npm run frames -- suites.mp4 suites --frames 180` |

Pour les suites, le plan 3 se décline trois fois (une chambre sous la charpente, un salon avec poêle, une suite avec cheminée), raccordées par un fondu ou un passage de porte.

Les trois phrases du hero sont calées sur 30 %, 56 % et 82 % de la vidéo d'arrivée. Si ta vidéo a un autre rythme, on ajuste ces repères dans `components/hero/Hero.tsx` (tableau `CAPTIONS`).

## Ce qu'il faut m'envoyer

Les fichiers vidéo bruts (MP4/MOV), dans la meilleure qualité disponible. Je m'occupe du reste : découpe en images, compression WebP en deux tailles (ordinateur et mobile), préchargement progressif et lien avec le scroll.

## Prompts des suites (montée en gamme)

Ta chambre de base devient la **Suite Arête** (45 m², lumière du matin). Les deux suivantes montent en gamme, et la lumière avance dans la journée : matin, puis après-midi, puis l'heure bleue. Le scroll raconte ainsi une journée entière.

Mêmes règles que plus haut : travelling avant lent à vitesse constante, sans coupe, exposition fixe, 16:9, 5 à 8 s par suite. Envoie les vidéos séparément : je les assemble avec un fondu, chacune sur un tiers de la séquence.

**Style commun (à coller au début de chaque prompt) :**

> Cinematic architectural interior photography of a luxury five-star chalet suite in Courchevel 1850, French Alps. Pale knotty Swiss stone pine (arolla) wood, warm lime plaster, honed grey stone, bronze details, cream wool bouclé, natural linen, sheepskin-free, very few objects, museum-like restraint. Deep ultramarine winter sky (#16245A) and snow-covered peaks through the windows, warm amber light (#C8873A) only from lamps and fire. Editorial, quiet, uncluttered, Aman / Six Senses level of refinement. Single continuous slow dolly-in at eye level, constant speed, no cuts, no zoom, no camera shake, locked exposure, sharp focus, 35mm lens, 16:9.

**Suite Combe (70 m², après-midi), la gamme au-dessus :**

> [style] Mid-afternoon low winter sun. The camera enters through a wide doorway into a spacious suite: a sunken living area with a low cream bouclé sofa around a suspended black steel fireplace with a real flame, wide-plank pale pine floor, a long slatted pine wall. The camera glides past the sofa toward the bedroom alcove where a king bed with white linen and a thick grey cashmere throw faces a panoramic window; next to the window, a monolithic freestanding grey stone bathtub stands alone, steam rising softly, sunlit snowy peaks filling the glass behind it. The camera ends close to the tub and the view.

**Suite Cembro (120 m², heure bleue), la plus haute gamme :**

> [style] Blue hour, the sky outside deep ultramarine, the snow glowing pale blue, interior lit only by warm amber lamps and a large open fire. The camera starts in a double-height living room under exposed pale pine roof trusses, a monumental floor-to-ceiling stone fireplace with a roaring fire, a long low sofa and a solid larch table, a floating oak staircase leading to a mezzanine bedroom. The camera glides forward across the room toward a full-height glass wall, through which a private terrace appears with a steaming wooden Nordic hot tub carved into the snow, lanterns glowing, and the illuminated village and peaks beyond. The camera stops at the glass, the terrace and the mountains filling the frame.

**Variante si tu veux une 4e suite (spa privé) :**

> [style] Soft evening light. The camera moves slowly down a short corridor of honed grey stone into a private spa: a small pale pine sauna with a glass front glowing amber, a stone hammam bench, and a narrow indoor plunge pool reflecting a wide window full of snowy peaks under a deep blue sky. Calm water surface, a few candles, no people. The camera ends at the edge of the pool, facing the view.

**Négatif (pour les trois) :**

> people, faces, hands, text, watermark, logo, clutter, Christmas decorations, fur rugs, antlers, animal skins, gold bling, chandeliers, red tones, motion blur, fast camera, camera rotation, fisheye, flicker, exposure change, CGI look, cartoon, oversaturated colors

**Astuces de génération**
- Si l'outil accepte une image de départ, prends une image de ta suite de base (même bois, même lumière) : la cohérence entre les suites sera bien meilleure.
- Fais 2 ou 3 essais par suite et garde celui où la caméra avance le plus régulièrement. C'est le critère numéro un pour le scroll.
- Les surfaces affichées sur le site (45, 70 et 120 m²) suivent ces prompts : dis-moi si tes vraies suites diffèrent.

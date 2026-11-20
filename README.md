# BuildWebAI — site vitrine

Homepage de BuildWebAI : site, réservation directe et automatisations IA pour restaurants, hôtels, caves à manger et bars à vins.

- `index.html` : page unique (Tailwind CSS compilé dans `assets/tailwind.css`, GSAP ScrollTrigger, Lenis, police Space Grotesk)
- `assets/site.css` : styles et règles de mouvement (seules `transform` et `opacity` sont animées)
- `assets/app.js` : preloader, simulation d'appel, vitrine 3D au scroll, simulateur ROI, slider avant/après, onglets tarifs, formulaire d'audit
- `assets/img/` : photos (Unsplash, licence Unsplash)
- `public/frames-bistrot/` : séquence du plat signature, `frame_0001.webp` à `frame_0120.webp` (1080×1920) et `540/` (540×960, servie aux écrans qui n'ont pas besoin de plus)
- `public/frames-bar/` : séquence du bar à vin, même structure (à déposer ; tant qu'elle manque, l'onglet Bar affiche `public/editorial/bar.webp`)
- `public/editorial/` : visuels verticaux des onglets Fast-Food, Épicerie et Bar (Unsplash, licence Unsplash)

## Demande de devis

- `devis.html` + `assets/devis.css` + `assets/devis.js` : questionnaire en 4 étapes (établissement, formule, projet sur mesure ou Starter, écosystème). Les boutons de la page Tarifs y mènent avec la formule déjà cochée (`devis.html?offre=starter` ou `?offre=sur_mesure`).
- À l'envoi, la page poste un JSON (`Content-Type: application/json`) vers `api/devis.php`, qui le transmet au webhook Airtable côté serveur. Le webhook Airtable ne répond pas aux requêtes CORS d'un navigateur : un envoi direct depuis la page serait bloqué.
- Le JSON contient toujours les 27 clés du mapping Airtable à plat, en chaînes (`""` pour la branche non choisie, listes au format Airtable `logo,photos`), plus un objet `colonnes_airtable` qui reprend les mêmes valeurs sous le nom exact de chaque colonne de la base « Demandes de Devis ».
- Valeurs envoyées, alignées sur la base : `type_offre` sur_mesure|starter · `deja_site` oui|non · `taille_site` onepage|petit|grand · `temps_perdu` <2|2-5|>5 · `delai` urgent|1-2mois|3-6mois|info · `budget` <1k|1k-2k|2k-5k|>5k · `outils` caisse,reservation,maison · `assets` logo,photos,textes,video · `reves` chatbot,voice_bot,anti_no_show,crm,fid · `objectif` reservation|click_and_collect|automatisation_ia|visibilite.
- `api/devis.php` demande PHP 7.4+ avec curl (Hostinger, OVH, o2switch…). L'URL du webhook est dans la constante `WEBHOOK_URL`.

## Démo restaurant

`demo/` : site de restaurant fictif (Maison Aurèle) pour démontrer le savoir-faire aux prospects, personnalisable en direct (nom, ville, couleur, fond, police) et par l'adresse de la page. Déployé sur demo.buildwebia.com (voir le guide de mise en ligne, section 9).

## Mise en ligne

`npm run package` génère `dist/buildwebai-hostinger.zip`, à extraire dans `public_html`. Étapes détaillées : [DEPLOIEMENT-HOSTINGER.md](DEPLOIEMENT-HOSTINGER.md).

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

# Mise en ligne sur Hostinger

## 1. Générer le paquet

```bash
npm install
npm run package
```

Résultat : `dist/buildwebai-hostinger.zip` (le contenu exact de `public_html`) et le même contenu décompressé dans `dist/public_html/`. Les fichiers de développement (`src/`, `node_modules/`, `package.json`, `tailwind.config.js`…) n'y sont pas.

## 2. Arborescence à obtenir dans `public_html`

```
public_html/
├── .htaccess               HTTPS forcé, www → sans www, /devis → devis.html, cache, compression, sécurité
├── index.html              accueil
├── devis.html              questionnaire de devis
├── mentions-legales.html
├── confidentialite.html
├── cgv.html
├── 404.html                page d'erreur
├── robots.txt
├── sitemap.xml
├── api/
│   └── devis.php           relais du formulaire vers le webhook Airtable (PHP 7.4+ avec curl)
├── assets/
│   ├── site.css  tailwind.css  devis.css  legal.css
│   ├── app.js  devis.js
│   └── img/                photos de la salle (avant / après)
└── public/
    ├── editorial/          visuels des onglets Fast-Food, Épicerie, Bar
    ├── frames-bistrot/     frame_0001.webp → frame_0120.webp (1080×1920)
    │   └── 540/            mêmes frames en 540×960
    └── frames-bar/         (à ajouter : même structure, frames + 540/)
```

## 3. Déposer les fichiers (hPanel)

1. hPanel → **Sites web** → **Gérer** sur buildwebia.com → **Gestionnaire de fichiers** → ouvrir `public_html`.
2. Supprimer les fichiers par défaut d'Hostinger s'il y en a (`default.php`, `index.php`).
3. **Importer** `buildwebai-hostinger.zip`, clic droit → **Extraire** dans `public_html` même (pas dans un sous-dossier : `index.html` doit être directement dans `public_html`).
4. Supprimer le `.zip` après extraction.
5. Vérifier que `.htaccess` est bien présent (Gestionnaire de fichiers → afficher les fichiers cachés).

## 4. Réglages hPanel

- **SSL** : Sécurité → SSL → installer le certificat gratuit sur buildwebia.com et www.buildwebia.com.
- **PHP** : Avancé → Configuration PHP → version 8.1 ou plus récente (l'extension curl est active par défaut).
- **Domaine** : buildwebia.com doit pointer vers cet hébergement (DNS Hostinger ou enregistrements A chez votre registrar).

## 5. Vérifications après mise en ligne

1. Ouvrir https://buildwebia.com : preloader, appel simulé, séquence du plat au scroll, simulateur, avant/après, tarifs.
2. http://www.buildwebia.com doit rediriger vers https://buildwebia.com.
3. https://buildwebia.com/devis doit afficher le questionnaire.
4. Envoyer une demande de devis de test → vérifier la ligne dans Airtable (« Demandes de Devis »), puis la supprimer.
5. Une adresse inexistante (https://buildwebia.com/xyz) doit afficher la page 404.

## 6. Mettre à jour le site plus tard

1. Modifier les fichiers, puis `npm run package`.
2. Réimporter le zip et l'extraire dans `public_html` en écrasant les fichiers.

Les CSS et JS reçoivent un numéro de version à chaque paquet (`?v=…`) : les visiteurs voient la nouvelle version tout de suite malgré le cache d'un an.

## 7. Ajouter la séquence du bar à vin

Déposer les 120 images dans `public/frames-bar/` (`frame_0001.webp` → `frame_0120.webp`, 1080×1920) et leurs versions 540×960 dans `public/frames-bar/540/`. Puis, dans `assets/app.js`, passer `const HAS_BAR_FRAMES = false;` à `true`, relancer `npm run package` et redéployer : l'onglet Bar utilise alors la séquence à la place de la photo fixe.

## 8. Google Search Console

Le site contient les deux preuves de propriété demandées par Google pour https://buildwebia.com/ :

- le fichier `googlea6526cbfeba881b7.html` à la racine de `public_html` (inclus dans le zip) ;
- la balise `<meta name="google-site-verification" …>` dans le `<head>` de `index.html`.

Ne supprimez jamais ni l'un ni l'autre, même après validation.

1. Mettre le site en ligne (étapes 1 à 4), puis vérifier que https://buildwebia.com/googlea6526cbfeba881b7.html affiche une ligne de texte.
2. Dans Search Console, propriété « Préfixe de l'URL » https://buildwebia.com/ → méthode **Fichier HTML** (ou **Balise HTML**) → **Valider**.
3. Une fois validé : menu **Sitemaps** → saisir `sitemap.xml` → **Envoyer**.
4. Menu **Inspection de l'URL** → https://buildwebia.com/ → **Demander l'indexation**.

## 9. Démo restaurant sur demo.buildwebia.com

`npm run package` génère aussi `dist/buildwebai-demo.zip` : un site de restaurant fictif (Maison Aurèle) à montrer aux prospects. Le `.htaccess` et le `robots.txt` fournis empêchent Google de l'indexer.

1. hPanel → **Domaines** → **Sous-domaines** → créer `demo` pour buildwebia.com. Hostinger propose le dossier `public_html/demo` (ou `domains/buildwebia.com/public_html/demo`) : le garder.
2. Gestionnaire de fichiers → ouvrir ce dossier → importer `buildwebai-demo.zip` → **Extraire** dans ce dossier.
3. Sécurité → SSL : installer le certificat sur `demo.buildwebia.com` (quelques minutes après la création du sous-domaine).
4. Ouvrir https://demo.buildwebia.com.

### Adapter la démo aux couleurs d'un restaurant

- Bouton **Personnaliser** en bas à droite : nom, ville, couleur principale, fond, police des titres. Le rendu change en direct.
- **Copier le lien de cette version** : le lien ouvre la démo personnalisée sans le panneau, prête à envoyer au restaurateur.
- Exemple de lien : `https://demo.buildwebia.com/?nom=Chez%20Paulette&ville=Annecy&accent=2F4A3A&fond=sable&police=playfair&presentation=1`
  - `accent` : couleur en hexadécimal sans le #
  - `fond` : `creme`, `ivoire`, `sable`, `blanc` ou `nuit`
  - `police` : `cormorant`, `playfair`, `dmserif` ou `fraunces`
  - `presentation=1` : masque le panneau

### Démo fast-food

Le même zip contient un dossier `fast-food/` : https://demo.buildwebia.com/fast-food/ (fast-food fictif Smash Club : panier et barre fixe, réservation, chatbot IA de démonstration, inscription au club).

- Personnalisation par l'adresse : `?nom=Burger%20Bros&c1=1B4332&c2=E9C46A&presentation=1`
  - `c1` : couleur principale (logo, footer), `c2` : couleur d'accent (boutons, écriture manuscrite), en hexadécimal sans le #

### Démo hôtel et démo caviste

Le même zip contient aussi :

- `hotel/` : https://demo.buildwebia.com/hotel/ (hôtel fictif Maison Sauvelune : réservation directe avec calcul du séjour, chambres, conciergerie IA de démonstration). Personnalisation : `?nom=…&lieu=…&accent=2E4A45&fond=pierre|blanc|sable|nuit&presentation=1`
- `cave/` : https://demo.buildwebia.com/cave/ (caviste fictif Cave Ondine en Click & Collect : filtres, panier, créneaux de retrait). Personnalisation : `?nom=…&accent=7A2235&presentation=1`

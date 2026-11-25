# L'Épicerie Jaune : site vitrine

Site vitrine d'une page (HTML, CSS, JS sans build), avec mise à jour du menu du jour par photo de l'ardoise.

## Contenu du dossier

```
index.html  style.css  app.js     page d'accueil
data/menu.json                    menu du jour et arrivages, lus par app.js
gerant/                           espace gérant : photo de l'ardoise → correction → publication
api/ardoise.php                   lecture de la photo par Claude + écriture de data/menu.json
api/config.example.php            modèle de configuration (clé API, mot de passe)
img/                              perso, logo, fruits détourés, motif, façade (maquette)
QUESTIONS-CLIENT.md               questions à envoyer pour écrire « Notre histoire »
```

## Mise à jour du menu par le gérant

1. Il ouvre `https://<domaine>/gerant/` sur son téléphone (à ajouter à l'écran d'accueil) et entre le mot de passe.
2. Il prend l'ardoise en photo. La photo est réduite à 1600 px puis lue par Claude (`claude-opus-5-5`, sortie JSON structurée).
3. Il corrige si besoin, puis appuie sur « Publier sur le site ». `data/menu.json` est réécrit et la page d'accueil l'affiche aussitôt.

Coût : une lecture d'ardoise est un seul appel avec une image, de l'ordre d'un centime.

## Mise en ligne (Hostinger)

1. Déposer le contenu du dossier dans `public_html` (sans `README.md`, `QUESTIONS-CLIENT.md`, `.gitignore`).
2. Copier `api/config.example.php` en `api/config.php` et le remplir :
   - `ANTHROPIC_API_KEY` : clé créée sur console.anthropic.com (compte du client ou de Build Web AI) ;
   - `ADMIN_PASSWORD_HASH` : `php -r "echo password_hash('mot-de-passe', PASSWORD_DEFAULT), PHP_EOL;"`.
3. Vérifier que PHP peut écrire dans `data/` (droits 755 sur le dossier, 644 sur `menu.json`).
4. PHP 8.0 ou plus récent, avec curl (activé par défaut chez Hostinger).

## Reste à faire

- Adresse exacte, téléphone et lien Google Maps (bloc « Infos pratiques », marqué « Adresse à compléter »).
- Remplacer la façade (maquette) par les vraies photos de la boutique et des produits.
- Texte « Notre histoire » à partir des réponses à `QUESTIONS-CLIENT.md`.
- Polices Wilden et Ink Free : si Léo & co fournit les fichiers avec une licence web, les mettre dans `fonts/` et ajouter les `@font-face` en tête de `style.css`. En attendant, Lilita One et Gochi Hand les remplacent.
- Le nouveau logo dit « Épicerie de quartier », la présentation disait « Primeur de quartier » : à confirmer avec le client.
- Prix des paniers, s'ils veulent les afficher.

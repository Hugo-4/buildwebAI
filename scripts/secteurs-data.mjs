// Source unique des secteurs et des démos : utilisée par scripts/build-secteurs.mjs
// pour générer les 6 pages secteurs et les sections « Secteurs » et « Démos » de l'accueil.

export const DEMO_BASE = 'https://demo.buildwebia.com/';

export const DEMOS = {
  restaurant: { name: 'Maison Aurèle', kind: 'Restaurant gastronomique', txt: 'Réservation, carte du déjeuner et du dîner, cave, histoire de la maison.', path: '' },
  'fast-food': { name: 'Smash Club', kind: 'Fast-food', txt: 'Carte en blocs, panier et barre fixe, chatbot, club de fidélité.', path: 'fast-food/' },
  bar: { name: 'Le Sémaphore', kind: 'Bar classique', txt: 'Ardoise du jour, happy hour, à emporter, agenda, privatisation.', path: 'bar/' },
  hotel: { name: 'Maison Sauvelune', kind: 'Hôtel', txt: 'Réservation directe avec calcul du séjour, chambres, table, spa, conciergerie IA.', path: 'hotel/' },
  cave: { name: 'Cave Ondine', kind: 'Caviste', txt: 'Filtres, panier, créneaux de retrait en cave.', path: 'cave/' },
  epicerie: { name: 'Odette', kind: 'Épicerie de quartier', txt: 'Paniers précomposés, abonnement, retrait au comptoir ou en casier.', path: 'epicerie/' },
  boulangerie: { name: 'Le Fournil de Jeanne', kind: 'Boulangerie', txt: 'Vitrine du jour, paniers du matin au soir, comptoir coupe-file.', path: 'boulangerie/' },
  sport: { name: 'Union Rugby des Berges', kind: 'Club de rugby', txt: 'Billetterie, licences en 3 fois, boutique, partenaires, dons.', path: 'sport/' },
  plombier: { name: 'Lefort Plomberie', kind: 'Plombier', txt: 'Appel d’urgence, estimateur de prix, contrat d’entretien.', path: 'plombier/' },
  electricien: { name: 'Delmas Électricité', kind: 'Électricien', txt: 'Dépannage guidé, simulateur de borne, check-up sécurité.', path: 'electricien/' },
  garage: { name: 'Garage Ferrand', kind: 'Garage', txt: 'Prix par modèle, pré-diagnostic, devis validé en ligne, rappels CT.', path: 'garage/' },
  velo: { name: 'Atelier Rayon', kind: 'Réparation de vélos', txt: 'Assistant IA, diagnostic en ligne, places en dépôt, pass entretien.', path: 'velo/' },
};

// Les deux rangées de l'accordéon de l'accueil
export const DEMO_ROWS = [
  ['restaurant', 'fast-food', 'bar', 'hotel', 'cave', 'epicerie'],
  ['boulangerie', 'sport', 'plombier', 'electricien', 'garage', 'velo'],
];

// Modules du Pack Performance (noms et prix identiques à la grille tarifaire de l'accueil)
export const MODULES = {
  vocal: ['Standardiste vocal IA', '890 €'],
  whatsapp: ['Maître d’hôtel virtuel WhatsApp / Instagram', '690 €'],
  dashboard: ['Dashboard interactif', '590 €'],
  fidelite: ['Fidélisation automatisée', '550 €'],
  chatbot: ['Chatbot web formé sur votre activité', '490 €'],
  fournisseurs: ['Gestion fournisseurs', '490 €'],
  caisse: ['Synchronisation caisse et fichier clients', '390 €'],
  sms: ['Rappel SMS de rendez-vous', '350 €'],
  avis: ['E-réputation (avis Google)', '290 €'],
};

export const SECTORS = [
  {
    slug: 'restaurants', short: 'Restaurants & bars', ex: 'Bistrot, gastronomique, fast-food, bar', activite: 'Bistrot',
    title: 'Site, Click & Collect et IA pour restaurants et bars',
    desc: 'Click & Collect sans commission, standardiste vocal IA pendant le coup de feu et rappels SMS anti-no-show pour restaurants, bistrots, fast-foods et bars.',
    h1: ['Remplissez la salle', 'encaissez en direct'],
    lead: 'Votre carte se commande en un clic, sans commission. Une IA décroche pendant le coup de feu et un SMS confirme chaque table : la salle se remplit, le téléphone se tait.',
    animation: true,
    demos: ['restaurant', 'fast-food', 'bar'],
    pains: [
      ['Le téléphone sonne pendant le coup de feu', 'Le standardiste vocal IA décroche, prend la réservation et répond aux questions d’allergènes et de parking.', 'Plus aucun serveur dérangé, plus aucune réservation perdue.'],
      ['Les tables vides des no-shows', 'Un SMS trois heures avant : le client confirme ou libère sa table d’un clic, la liste d’attente est prévenue.', 'Les no-shows passent de 18 % à moins de 3 %.'],
      ['30 % de commission sur les plateformes', 'Le Click & Collect sur votre site, payé chez vous, avec des suggestions automatiques au panier.', '0 % de commission et un panier moyen en hausse de 20 %.'],
      ['Les factures et le food cost à la main', 'Une photo du bon de livraison, et le prix de la viande ou de la marée arrive dans votre suivi.', 'Deux heures gagnées chaque lundi.'],
    ],
    modules: [
      ['vocal', 'Décroche pendant le service, prend la réservation, répond aux questions courantes.'],
      ['sms', 'Rappel trois heures avant, confirmation ou libération de la table d’un clic.'],
      ['fidelite', 'Clients réguliers, anniversaires, relance de ceux qu’on ne voit plus.'],
      ['fournisseurs', 'Lecture des factures sur photo et suivi du food cost.'],
    ],
  },
  {
    slug: 'hotels', short: 'Hôtels', ex: 'Hôtel, maison d’hôtes, résidence', activite: 'Hôtel',
    title: 'Site et réservation directe pour hôtels',
    desc: 'Réservation directe sans commission, conciergerie IA 24 h/24 et ventes additionnelles (table, spa) pour hôtels et maisons d’hôtes.',
    h1: ['Vos chambres', 'réservées en direct'],
    lead: 'Le prix du séjour s’affiche dès que les dates sont choisies, la table et le spa se réservent dans la foulée, et la conciergerie IA répond de nuit comme de jour.',
    demos: ['hotel'],
    pains: [
      ['15 à 18 % de commission sur chaque nuit vendue par les plateformes', 'La réservation directe sur votre site, avec le prix du séjour calculé en direct et le meilleur tarif garanti.', 'La marge revient à l’hôtel.'],
      ['Les mêmes questions à la réception, à toute heure', 'Une conciergerie IA répond aux horaires du spa, au parking, à l’arrivée tardive.', 'La réception se libère, le client a sa réponse en quelques secondes.'],
      ['Le restaurant et le spa invisibles pour les clients du séjour', 'Des pages table et spa réservables, proposées au moment de la réservation de la chambre.', 'Plus de ventes additionnelles par séjour.'],
      ['Aucun lien avec le client après son départ', 'Une offre de retour et un message à la date anniversaire du séjour.', 'Des clients qui reviennent en direct.'],
    ],
    modules: [
      ['whatsapp', 'Conciergerie sur WhatsApp et Instagram : questions, demandes, réservations.'],
      ['chatbot', 'Répond sur le site aux questions de séjour, dans plusieurs langues.'],
      ['fidelite', 'Offre de retour, anniversaire de séjour, avant-premières.'],
      ['dashboard', 'Taux d’occupation, ventes directes et additionnelles au même endroit.'],
    ],
  },
  {
    slug: 'commerces', short: 'Commerces de bouche', ex: 'Épicerie, boulangerie, caviste', activite: '',
    title: 'Site et Click & Collect pour épiceries, boulangeries et cavistes',
    desc: 'Vitrine en ligne, Click & Collect avec créneaux, paniers et abonnements pour épiceries, boulangeries et cavistes.',
    h1: ['Votre comptoir', 'ouvert en ligne'],
    lead: 'La vitrine du jour s’affiche en ligne, les clients réservent leur panier et passent au comptoir coupe-file. Les invendus du soir partent en paniers anti-gaspi.',
    demos: ['epicerie', 'boulangerie', 'cave'],
    pains: [
      ['Les clients ne savent pas ce qu’il reste en rayon', 'La vitrine du jour en ligne, avec les quantités restantes et les fournées.', 'Moins de questions au comptoir et au téléphone.'],
      ['La file d’attente du samedi matin', 'Le Click & Collect avec un créneau toutes les 15 minutes et un comptoir coupe-file.', 'Plus de ventes aux heures de pointe, sans personnel en plus.'],
      ['Les invendus du soir', 'Des paniers composés et des paniers anti-gaspi mis en avant à la bonne heure.', 'Moins de pertes et un panier moyen plus haut.'],
      ['Le client fidèle va voir ailleurs', 'Une carte de fidélité en ligne et des paniers par abonnement.', 'Un chiffre d’affaires qui revient chaque semaine.'],
    ],
    modules: [
      ['chatbot', 'Répond aux questions de stock, d’horaires et de commande.'],
      ['fidelite', 'Carte de fidélité en ligne et abonnements aux paniers.'],
      ['caisse', 'Ventes en ligne et en boutique dans le même fichier clients.'],
      ['avis', 'Demande d’avis après le retrait, réponse aux avis.'],
    ],
  },
  {
    slug: 'artisans', short: 'Artisans du bâtiment', ex: 'Plombier, électricien, chauffagiste', activite: '',
    title: 'Site, devis et rendez-vous en ligne pour artisans',
    desc: 'Estimateur de prix, prise de rendez-vous, devis signé en ligne et contrats d’entretien pour plombiers, électriciens et chauffagistes.',
    h1: ['Moins de téléphone', 'plus de chantiers'],
    lead: 'Le client décrit sa panne, voit une fourchette de prix et choisit son créneau. Vous arrivez avec la bonne pièce, et le contrat d’entretien vous ramène le client chaque année.',
    demos: ['plombier', 'electricien'],
    pains: [
      ['Le téléphone sonne en plein chantier', 'Un estimateur de prix en ligne et une IA qui trie les vraies urgences des simples questions.', 'Moins d’appels, et des demandes déjà qualifiées.'],
      ['Les devis qui ne reviennent jamais', 'Le devis se signe en ligne, avec une relance automatique trois jours après.', 'Plus de devis acceptés, sans relancer à la main.'],
      ['Les déplacements pour rien', 'Un pré-diagnostic avec photo et la vérification de la zone d’intervention.', 'La bonne pièce dès la première visite.'],
      ['Le client qu’on ne revoit jamais', 'Un contrat d’entretien annuel et un rappel par SMS au bon moment.', 'Un chiffre d’affaires récurrent et un planning plus régulier.'],
    ],
    modules: [
      ['vocal', 'Décroche quand vous êtes sur le chantier, trie les urgences, prend le rendez-vous.'],
      ['sms', 'Confirmation de la visite la veille, le client répond d’un mot.'],
      ['fidelite', 'Contrats d’entretien, rappels annuels, relance des devis.'],
      ['avis', 'Demande d’avis Google après l’intervention.'],
    ],
  },
  {
    slug: 'garages-ateliers', short: 'Garages & ateliers', ex: 'Garage, réparation de vélos', activite: '',
    title: 'Site, rendez-vous et devis en ligne pour garages et ateliers',
    desc: 'Pré-diagnostic en ligne, rendez-vous par type d’intervention, devis validé par SMS et rappels de contrôle technique pour garages et ateliers vélo.',
    h1: ['Un atelier plein', 'un téléphone calme'],
    lead: 'Le client choisit son véhicule, décrit le symptôme et réserve le bon créneau. Le devis se valide en ligne, la voiture ou le vélo ne dort pas à l’atelier.',
    demos: ['garage', 'velo'],
    pains: [
      ['Les appels incessants et les urgences', 'Un pré-diagnostic en ligne (véhicule, symptôme, photo) et un assistant IA pour les questions courantes.', 'Les curieux sont filtrés, les infos sont prêtes avant le premier appel.'],
      ['Les rendez-vous non honorés et le planning instable', 'Des créneaux par type d’intervention et un rappel SMS à confirmer d’un mot.', 'Zéro trou dans le planning, des créneaux d’urgence protégés.'],
      ['Les devis perdus et les clients qui ne reviennent pas', 'Relance automatique des devis à J+3 et SMS avant le contrôle technique ou la révision.', 'L’atelier se remplit en période creuse, sans effort commercial.'],
      ['Le manque de visibilité locale', 'Une demande d’avis Google automatique après la récupération du véhicule.', 'La clientèle locale trouve un garage de confiance.'],
    ],
    modules: [
      ['chatbot', 'Pré-diagnostic, suivi de réparation, questions du téléphone.'],
      ['sms', 'Rappel du rendez-vous la veille, avec confirmation ou annulation.'],
      ['fidelite', 'Relance des devis, rappels de contrôle technique et de révision.'],
      ['avis', 'Demande d’avis Google à la restitution.'],
    ],
  },
  {
    slug: 'clubs', short: 'Clubs & associations', ex: 'Rugby, handball, club amateur', activite: '',
    title: 'Site, billetterie et licences en ligne pour clubs sportifs',
    desc: 'Billetterie en ligne, licences payables en plusieurs fois, boutique, partenaires et dons pour clubs sportifs et associations.',
    h1: ['Votre club', 'financé en ligne'],
    lead: 'Les licences se prennent en ligne en une ou trois fois, les billets arrivent avec un QR code, la boutique et les dons financent l’école de sport.',
    demos: ['sport'],
    pains: [
      ['Les inscriptions sur papier et les chèques', 'Licences en ligne, paiement en une ou trois fois, Pass’Sport et remise famille appliqués.', 'La saison bouclée avant la rentrée.'],
      ['La billetterie à la caisse le jour du match', 'Billets en ligne avec QR code, repas d’avant-match et abonnement saison.', 'Plus de recettes et moins de file à l’entrée.'],
      ['Trop peu de partenaires', 'Des packs partenaires avec le coût après réduction d’impôt, et un formulaire de rappel.', 'Des sponsors plus faciles à convaincre.'],
      ['Des bénévoles noyés sous les messages', 'Un assistant qui répond aux parents : horaires, catégories, matériel.', 'Moins de messages le soir.'],
    ],
    modules: [
      ['chatbot', 'Répond aux parents et aux joueurs : horaires, catégories, inscriptions.'],
      ['whatsapp', 'Les mêmes réponses sur WhatsApp et Instagram.'],
      ['fidelite', 'Réinscriptions, supporters, abonnements saison.'],
      ['dashboard', 'Licences, billetterie, boutique et dons au même endroit.'],
    ],
  },
];

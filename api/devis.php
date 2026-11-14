<?php
/**
 * Relais du questionnaire de devis (devis.html) vers le webhook Airtable.
 *
 * Le webhook Airtable ne répond pas aux requêtes CORS d'un navigateur : la page envoie donc son JSON
 * ici (même domaine), et ce script le transmet tel quel, en POST application/json, côté serveur.
 * Il garantit aussi que les 27 clés du mapping Airtable sont toujours présentes (chaînes, "" si vide).
 * Prérequis : PHP 7.4+ avec l'extension curl (standard chez Hostinger, OVH, o2switch…).
 */
declare(strict_types=1);

const WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/apphIdIli1uuXueSI/wflqZ9CkYn99cloue/wtrNi89jEV01Rruey';
const ALLOWED_ORIGINS = ['https://buildwebia.com', 'https://www.buildwebia.com'];
const KEYS = [
    'nom_etablissement', 'role', 'activite', 'localisation', 'email', 'deja_site', 'url_site',
    'type_offre',
    'noms_logiciels', 'frustration', 'objectif', 'taille_site', 'temps_perdu', 'delai', 'budget', 'exemples', 'commentaires_sur_mesure',
    'starter_description', 'starter_domaine', 'starter_couleurs', 'starter_style', 'starter_drive', 'starter_structure', 'commentaires_starter',
    'outils', 'assets', 'reves',
];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, ['ok' => false, 'error' => 'method']);
}

// Refuse les envois venant d'un autre site (l'en-tête Origin est envoyé par les navigateurs)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
$parts = $origin !== '' ? parse_url($origin) : [];
$originHost = ($parts['host'] ?? '') . (isset($parts['port']) ? ':' . $parts['port'] : '');
if ($origin !== '' && !in_array($origin, ALLOWED_ORIGINS, true) && $originHost !== $host) {
    reply(403, ['ok' => false, 'error' => 'origin']);
}

$raw = file_get_contents('php://input', false, null, 0, 65536);
$in = json_decode($raw === false ? '' : $raw, true);
if (!is_array($in)) {
    reply(400, ['ok' => false, 'error' => 'json']);
}

$out = [];
foreach (KEYS as $key) {
    $value = $in[$key] ?? '';
    $value = is_scalar($value) ? trim((string) $value) : '';
    $out[$key] = function_exists('mb_substr') ? mb_substr($value, 0, 4000) : substr($value, 0, 4000);
}

if ($out['nom_etablissement'] === '' || !filter_var($out['email'], FILTER_VALIDATE_EMAIL)
    || !in_array($out['type_offre'], ['sur_mesure', 'starter'], true)) {
    reply(422, ['ok' => false, 'error' => 'fields']);
}

// La branche non choisie part vide, comme l'attend le mapping
$branches = [
    'sur_mesure' => ['noms_logiciels', 'frustration', 'objectif', 'taille_site', 'temps_perdu', 'delai', 'budget', 'exemples', 'commentaires_sur_mesure'],
    'starter' => ['starter_description', 'starter_domaine', 'starter_couleurs', 'starter_style', 'starter_drive', 'starter_structure', 'commentaires_starter'],
];
foreach ($branches[$out['type_offre'] === 'starter' ? 'sur_mesure' : 'starter'] as $key) {
    $out[$key] = '';
}
if ($out['deja_site'] !== 'oui') {
    $out['url_site'] = '';
}

$ch = curl_init(WEBHOOK_URL);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($out, JSON_UNESCAPED_UNICODE),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 12,
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
    reply(502, ['ok' => false, 'error' => 'webhook']);
}
reply(200, ['ok' => true]);

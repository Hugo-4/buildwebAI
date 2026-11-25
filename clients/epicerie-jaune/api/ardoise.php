<?php
/**
 * L'Épicerie Jaune : mise à jour du menu du jour à partir d'une photo de l'ardoise.
 *
 * POST action=analyser (multipart : mot_de_passe, photo) → Claude lit la photo et renvoie le menu en JSON (aperçu, rien n'est publié).
 * POST action=publier  (JSON : mot_de_passe, menu)        → écrit data/menu.json, que la page d'accueil affiche.
 * POST action=verifier (JSON : mot_de_passe)              → vérifie le mot de passe (connexion à la page gérant).
 *
 * Prérequis : PHP 8.0+ avec curl, et api/config.php (copie de config.example.php, jamais versionné).
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const MENU_FILE = __DIR__ . '/../data/menu.json';
const MAX_PHOTO = 8 * 1024 * 1024;

function reply(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['erreur' => 'Méthode non autorisée.']);
}
if (!is_file(__DIR__ . '/config.php')) {
    reply(500, ['erreur' => 'Configuration manquante : créez api/config.php à partir de config.example.php.']);
}
$config = require __DIR__ . '/config.php';

// Les requêtes JSON (publier, verifier) et multipart (analyser) partagent le même point d'entrée
$isJson = str_starts_with((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json');
$input = $isJson ? (json_decode((string)file_get_contents('php://input'), true) ?: []) : $_POST;
$action = (string)($input['action'] ?? '');

// ---- Mot de passe (avec un délai sur chaque échec pour freiner les essais en série)
$password = (string)($input['mot_de_passe'] ?? '');
if ($password === '' || !password_verify($password, (string)$config['ADMIN_PASSWORD_HASH'])) {
    sleep(2);
    reply(401, ['erreur' => 'Mot de passe incorrect.']);
}

if ($action === 'verifier') {
    reply(200, ['ok' => true]);
}

// ---- Schéma du menu, partagé entre la réponse de Claude et la publication
const SCHEMA = [
    'type' => 'object',
    'additionalProperties' => false,
    'required' => ['date', 'plats', 'arrivages', 'message'],
    'properties' => [
        'date' => ['type' => 'string', 'description' => 'Date du menu au format AAAA-MM-JJ, ou chaîne vide si absente de l\'ardoise.'],
        'plats' => [
            'type' => 'array',
            'items' => [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['nom', 'detail', 'prix'],
                'properties' => [
                    'nom' => ['type' => 'string'],
                    'detail' => ['type' => 'string'],
                    'prix' => ['type' => 'string'],
                ],
            ],
        ],
        'arrivages' => [
            'type' => 'array',
            'items' => [
                'type' => 'object',
                'additionalProperties' => false,
                'required' => ['nom', 'detail'],
                'properties' => [
                    'nom' => ['type' => 'string'],
                    'detail' => ['type' => 'string'],
                ],
            ],
        ],
        'message' => ['type' => 'string'],
    ],
];

function clean(string $s, int $max): string
{
    $s = trim(preg_replace('/\s+/u', ' ', strip_tags($s)) ?? '');
    return mb_substr($s, 0, $max);
}

/** Garde uniquement les champs attendus, avec des longueurs raisonnables. */
function normaliser(array $m): array
{
    $plats = [];
    foreach (array_slice(is_array($m['plats'] ?? null) ? $m['plats'] : [], 0, 12) as $p) {
        if (!is_array($p) || clean((string)($p['nom'] ?? ''), 80) === '') continue;
        $plats[] = ['nom' => clean((string)$p['nom'], 80), 'detail' => clean((string)($p['detail'] ?? ''), 160), 'prix' => clean((string)($p['prix'] ?? ''), 20)];
    }
    $arr = [];
    foreach (array_slice(is_array($m['arrivages'] ?? null) ? $m['arrivages'] : [], 0, 8) as $a) {
        if (!is_array($a) || clean((string)($a['nom'] ?? ''), 60) === '') continue;
        $arr[] = ['nom' => clean((string)$a['nom'], 60), 'detail' => clean((string)($a['detail'] ?? ''), 120)];
    }
    $date = (string)($m['date'] ?? '');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $date = (new DateTimeImmutable('now', new DateTimeZone('Europe/Paris')))->format('Y-m-d');
    }
    return ['date' => $date, 'plats' => $plats, 'arrivages' => $arr, 'message' => clean((string)($m['message'] ?? ''), 200)];
}

// ---- Publier
if ($action === 'publier') {
    $menu = normaliser(is_array($input['menu'] ?? null) ? $input['menu'] : []);
    if (!$menu['plats']) {
        reply(422, ['erreur' => 'Le menu ne contient aucun plat. Ajoutez au moins un plat avant de publier.']);
    }
    $menu = ['maj' => (new DateTimeImmutable('now', new DateTimeZone('Europe/Paris')))->format(DATE_ATOM)] + $menu;
    $tmp = MENU_FILE . '.tmp';
    $json = json_encode($menu, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, MENU_FILE)) {
        reply(500, ['erreur' => 'Impossible d\'écrire data/menu.json : vérifiez les droits d\'écriture du dossier data.']);
    }
    reply(200, ['ok' => true, 'menu' => $menu]);
}

// ---- Analyser la photo de l'ardoise
if ($action !== 'analyser') {
    reply(400, ['erreur' => 'Action inconnue.']);
}
$photo = $_FILES['photo'] ?? null;
if (!$photo || ($photo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    reply(400, ['erreur' => 'Aucune photo reçue. Reprenez la photo de l\'ardoise et réessayez.']);
}
if ($photo['size'] > MAX_PHOTO) {
    reply(413, ['erreur' => 'Photo trop lourde (8 Mo maximum).']);
}
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($photo['tmp_name']);
if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
    reply(415, ['erreur' => 'Format non pris en charge : envoyez une photo JPEG, PNG ou WebP.']);
}

$today = (new DateTimeImmutable('now', new DateTimeZone('Europe/Paris')));
$prompt = "Voici la photo de l'ardoise « Menu du jour » de L'Épicerie Jaune, une épicerie et primeur de quartier qui fait de la cuisine à emporter. "
    . "Nous sommes le " . $today->format('Y-m-d') . ". Recopie le menu tel qu'il est écrit, sans rien inventer :\n"
    . "- plats : un élément par ligne de plat ; « nom » = le plat (ex. « Soupe de saison »), « detail » = la précision écrite à côté (ex. « potiron, châtaigne »), « prix » = le prix tel qu'écrit (ex. « 6,50 € »). Laisse une chaîne vide quand l'information n'est pas sur l'ardoise.\n"
    . "- arrivages : seulement si l'ardoise mentionne des fruits, légumes ou produits arrivés ; sinon une liste vide.\n"
    . "- message : une phrase écrite sur l'ardoise qui n'est ni un plat ni un prix (ex. « Fermé lundi », « Pensez à réserver vos paniers ») ; sinon une chaîne vide.\n"
    . "- date : la date écrite sur l'ardoise au format AAAA-MM-JJ, sinon la date du jour.\n"
    . "Corrige l'orthographe évidente et mets une majuscule au début de chaque nom. Si un mot est illisible, écris ta meilleure lecture.";

$body = [
    'model' => $config['MODEL'] ?? 'claude-opus-5-5',
    'max_tokens' => 4000,
    'output_config' => [
        'effort' => 'low',
        'format' => ['type' => 'json_schema', 'schema' => SCHEMA],
    ],
    // Si le modèle refuse la requête, l'API la relance sur un modèle de secours dans le même appel
    'fallbacks' => 'default',
    'messages' => [[
        'role' => 'user',
        'content' => [
            ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => $mime, 'data' => base64_encode((string)file_get_contents($photo['tmp_name']))]],
            ['type' => 'text', 'text' => $prompt],
        ],
    ]],
];

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 90,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-api-key: ' . $config['ANTHROPIC_API_KEY'],
        'anthropic-version: 2026-10-21',
        'anthropic-beta: server-side-fallback-2026-07-01',
    ],
    CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
]);
$raw = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($raw === false) {
    reply(502, ['erreur' => 'Le service de lecture ne répond pas (' . $err . '). Réessayez dans un instant.']);
}
$res = json_decode((string)$raw, true);
if ($status === 429 || $status === 529 || $status >= 500) {
    reply(503, ['erreur' => 'Le service de lecture est surchargé. Réessayez dans une minute.']);
}
if ($status !== 200 || !is_array($res)) {
    error_log('ardoise.php: API ' . $status . ' ' . substr((string)$raw, 0, 500));
    reply(502, ['erreur' => 'La lecture de la photo a échoué (code ' . $status . ').']);
}
if (($res['stop_reason'] ?? '') === 'refusal') {
    reply(422, ['erreur' => 'La photo n\'a pas pu être lue. Reprenez-la bien en face de l\'ardoise.']);
}
$text = '';
foreach ($res['content'] ?? [] as $block) {
    if (($block['type'] ?? '') === 'text') $text .= $block['text'];
}
$menu = json_decode($text, true);
if (!is_array($menu)) {
    reply(502, ['erreur' => 'La réponse n\'a pas pu être lue. Réessayez avec une autre photo.']);
}
reply(200, ['ok' => true, 'menu' => normaliser($menu)]);

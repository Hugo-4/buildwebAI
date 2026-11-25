<?php
/**
 * Copiez ce fichier en api/config.php sur le serveur et remplissez-le. config.php n'est jamais versionné.
 *
 * Mot de passe du gérant : générez le hash avec
 *   php -r "echo password_hash('le-mot-de-passe', PASSWORD_DEFAULT), PHP_EOL;"
 * puis collez le résultat dans ADMIN_PASSWORD_HASH (jamais le mot de passe en clair).
 */
return [
    'ANTHROPIC_API_KEY' => 'sk-ant-...',
    'ADMIN_PASSWORD_HASH' => '$2y$10$...',
    'MODEL' => 'claude-opus-5-5',
];

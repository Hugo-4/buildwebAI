// Prépare le dossier à déposer dans public_html chez Hostinger : dist/public_html + dist/buildwebai-hostinger.zip
// Usage : npm run package
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const OUT = 'dist/public_html';
const PAGES = ['index.html', 'devis.html', 'mentions-legales.html', 'confidentialite.html', 'cgv.html', '404.html'];
const DIRS = ['assets', 'public', 'api'];
const ROOT_FILES = ['deploy/.htaccess', 'deploy/robots.txt', 'deploy/sitemap.xml', 'googlea6526cbfeba881b7.html']; // fichier de validation Google Search Console : ne jamais le supprimer

let version;
try { version = execSync('git rev-parse --short HEAD').toString().trim(); } catch { version = Date.now().toString(36); }

rmSync('dist', { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const d of DIRS) cpSync(d, join(OUT, d), { recursive: true });
for (const f of ROOT_FILES) cpSync(f, join(OUT, f.split('/').pop()));

// Pages : CSS et JS versionnés pour que le cache navigateur (1 an) se renouvelle à chaque livraison
for (const p of PAGES) {
  const html = readFileSync(p, 'utf8').replace(/((?:href|src)="\/?assets\/[\w.-]+\.(?:css|js))"/g, `$1?v=${version}"`);
  writeFileSync(join(OUT, p), html);
}

execSync('zip -q -r -9 ../buildwebai-hostinger.zip .', { cwd: OUT });

const size = (dir) => readdirSync(dir).reduce((n, f) => {
  const s = statSync(join(dir, f));
  return n + (s.isDirectory() ? size(join(dir, f)) : s.size);
}, 0);
const count = (dir) => readdirSync(dir).reduce((n, f) => n + (statSync(join(dir, f)).isDirectory() ? count(join(dir, f)) : 1), 0);
console.log(`dist/public_html : ${count(OUT)} fichiers, ${(size(OUT) / 1e6).toFixed(1)} Mo (version ${version})`);
console.log(`dist/buildwebai-hostinger.zip : ${(statSync('dist/buildwebai-hostinger.zip').size / 1e6).toFixed(1)} Mo`);

// Prépare le dossier à déposer dans public_html chez Hostinger : dist/public_html + dist/buildwebai-hostinger.zip
// Usage : npm run package
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { transformSync } from 'esbuild';

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

// JS et CSS minifiés pour la production (les sources restent lisibles dans le dépôt)
let saved = 0;
for (const f of readdirSync(join(OUT, 'assets'))) {
  const loader = f.endsWith('.js') ? 'js' : f.endsWith('.css') ? 'css' : null;
  if (!loader) continue;
  const file = join(OUT, 'assets', f);
  const src = readFileSync(file, 'utf8');
  const { code } = transformSync(src, { loader, minify: true, target: loader === 'js' ? 'es2019' : 'chrome90' });
  writeFileSync(file, code);
  saved += src.length - code.length;
}
console.log(`JS/CSS minifiés : ${(saved / 1024).toFixed(1)} Ko économisés`);

// Pages : CSS et JS versionnés pour que le cache navigateur (1 an) se renouvelle à chaque livraison
for (const p of PAGES) {
  const html = readFileSync(p, 'utf8').replace(/((?:href|src)="\/?assets\/[\w.-]+\.(?:css|js))"/g, `$1?v=${version}"`);
  writeFileSync(join(OUT, p), html);
}

execSync('zip -q -r -9 ../buildwebai-hostinger.zip .', { cwd: OUT });

// Démo restaurant pour le sous-domaine demo.buildwebia.com : dist/demo + dist/buildwebai-demo.zip
const DEMO = 'dist/demo';
mkdirSync(DEMO, { recursive: true });
cpSync('demo/img', join(DEMO, 'img'), { recursive: true });
cpSync('deploy/demo.htaccess', join(DEMO, '.htaccess'));
cpSync('deploy/demo-robots.txt', join(DEMO, 'robots.txt'));
for (const f of ['style.css', 'app.js']) {
  const { code } = transformSync(readFileSync(join('demo', f), 'utf8'), { loader: f.endsWith('.js') ? 'js' : 'css', minify: true, target: f.endsWith('.js') ? 'es2019' : 'chrome90' });
  writeFileSync(join(DEMO, f), code);
}
writeFileSync(join(DEMO, 'index.html'), readFileSync('demo/index.html', 'utf8').replace(/((?:href|src)="(?:style\.css|app\.js))"/g, `$1?v=${version}"`));
// Démo fast-food : demo.buildwebia.com/fast-food/
const FF = join(DEMO, 'fast-food');
mkdirSync(FF, { recursive: true });
cpSync('demo/fast-food/img', join(FF, 'img'), { recursive: true });
for (const f of ['style.css', 'app.js']) {
  const { code } = transformSync(readFileSync(join('demo/fast-food', f), 'utf8'), { loader: f.endsWith('.js') ? 'js' : 'css', minify: true, target: f.endsWith('.js') ? 'es2019' : 'chrome90' });
  writeFileSync(join(FF, f), code);
}
writeFileSync(join(FF, 'index.html'), readFileSync('demo/fast-food/index.html', 'utf8').replace(/((?:href|src)="(?:style\.css|app\.js))"/g, `$1?v=${version}"`));
execSync('zip -q -r -9 ../buildwebai-demo.zip .', { cwd: DEMO });

const size = (dir) => readdirSync(dir).reduce((n, f) => {
  const s = statSync(join(dir, f));
  return n + (s.isDirectory() ? size(join(dir, f)) : s.size);
}, 0);
const count = (dir) => readdirSync(dir).reduce((n, f) => n + (statSync(join(dir, f)).isDirectory() ? count(join(dir, f)) : 1), 0);
console.log(`dist/public_html : ${count(OUT)} fichiers, ${(size(OUT) / 1e6).toFixed(1)} Mo (version ${version})`);
console.log(`dist/buildwebai-demo.zip : ${(statSync('dist/buildwebai-demo.zip').size / 1e6).toFixed(1)} Mo (${count(DEMO)} fichiers)`);
console.log(`dist/buildwebai-hostinger.zip : ${(statSync('dist/buildwebai-hostinger.zip').size / 1e6).toFixed(1)} Mo`);

// Génère les 6 pages secteurs (restaurants.html, hotels.html, …) et remplit les sections
// « Secteurs » et « Démos » de index.html entre les marqueurs <!-- @secteurs --> et <!-- @demos -->.
// Usage : node scripts/build-secteurs.mjs (appelé par npm run build)
import { readFileSync, writeFileSync } from 'node:fs';
import { SECTORS, DEMOS, DEMO_ROWS, DEMO_BASE, MODULES } from './secteurs-data.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nb = (s) => esc(s).replace(/ ([:;?!»€%])/g, '&nbsp;$1');
const LOGO = '<path fill="#fff" fill-rule="evenodd" d="M8 6h8v36H8zM16 6h11a8.5 8.5 0 0 1 0 17H16zM16 12h10a2.5 2.5 0 0 1 0 5H16zM16 23h13a9.5 9.5 0 0 1 0 19H16zM16 29h12a3.25 3.25 0 0 1 0 6.5H16z"/><rect x="40" y="36" width="6" height="6" fill="#E62E2D"/>';
const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- Accordéon de démos (accueil et pages secteurs) ---------- */
function accordion(keys, label) {
  const items = keys.map((k, i) => {
    const d = DEMOS[k];
    return `        <a class="acc-item${i === 0 ? ' is-active' : ''}" href="${DEMO_BASE}${d.path}" target="_blank" rel="noopener">
          <img src="assets/img/demos/${k}-640.webp" alt="" width="640" height="800" loading="lazy" decoding="async">
          <span class="acc-veil" aria-hidden="true"></span>
          <span class="acc-tab" aria-hidden="true">${esc(d.name)}</span>
          <span class="acc-body">
            <span class="acc-kind">${esc(d.kind)}</span>
            <span class="acc-name">${esc(d.name)}</span>
            <span class="acc-txt">${nb(d.txt)}</span>
            <span class="acc-go">Ouvrir la démo ${ARROW}<span class="sr-only"> (nouvel onglet)</span></span>
          </span>
        </a>`;
  }).join('\n');
  return `      <div class="acc${keys.length === 1 ? ' acc--one' : ''}" data-acc role="list" aria-label="${esc(label)}">\n${items}\n      </div>`;
}

/* ---------- Sections de l'accueil ---------- */
function homeSecteurs() {
  const rows = SECTORS.map((s, i) => `        <li><a class="sx-row" href="${s.slug}.html">
          <span class="sx-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="sx-main"><span class="sx-name">${esc(s.short)}</span><span class="sx-ex">${esc(s.ex)}</span></span>
          <span class="sx-count">${s.demos.length} démo${s.demos.length > 1 ? 's' : ''}</span>
          <span class="sx-arrow" aria-hidden="true">${ARROW}</span>
          <img class="sx-img" src="assets/img/secteurs/${s.slug}-600.webp" alt="" width="600" height="750" loading="lazy" decoding="async">
        </a></li>`).join('\n');
  return `    <!-- @secteurs (généré par scripts/build-secteurs.mjs) -->
    <section id="secteurs" class="bg-mist text-ink" aria-labelledby="sx-title">
      <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div class="grid lg:grid-cols-12 gap-6 items-end">
          <h2 id="sx-title" class="lg:col-span-7 display text-4xl sm:text-5xl lg:text-[3.6rem] leading-[0.95]">Un site pensé pour votre métier<span class="text-ember">.</span></h2>
          <p class="lg:col-span-5 text-lg leading-relaxed text-ink/80 max-w-[34rem]">Un plombier ne vend pas comme un caviste. Choisissez votre métier&nbsp;: problèmes, solutions et démos, dans votre vocabulaire.</p>
        </div>
        <ol class="sx-list mt-12" role="list">
${rows}
        </ol>
      </div>
    </section>
    <!-- /@secteurs -->`;
}
function homeDemos() {
  return `    <!-- @demos (généré par scripts/build-secteurs.mjs) -->
    <section id="demos" class="bg-night relative overflow-hidden" aria-labelledby="dm-title">
      <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div class="grid lg:grid-cols-12 gap-6 items-end">
          <h2 id="dm-title" class="lg:col-span-7 display text-4xl sm:text-5xl lg:text-[3.6rem] leading-[0.95]">Douze démos, à parcourir comme un vrai site<span class="text-ember">.</span></h2>
          <p class="lg:col-span-5 text-lg leading-relaxed text-white/70 max-w-[34rem]">Survolez une démo pour l'agrandir, ou faites-les défiler sur mobile. Dans chacune, le bouton «&nbsp;Personnaliser&nbsp;» la met à votre nom et à vos couleurs.</p>
        </div>
        <div class="acc-rows mt-12">
${accordion(DEMO_ROWS[0], 'Démos : restauration, hôtellerie et commerces')}
${accordion(DEMO_ROWS[1], 'Démos : commerces, clubs et artisans')}
        </div>
      </div>
    </section>
    <!-- /@demos -->`;
}

/* ---------- En-tête et pied communs des pages secteurs ---------- */
const navLinks = [['index.html#secteurs', 'Secteurs'], ['index.html#demos', 'Démos'], ['index.html#tarifs', 'Tarifs'], ['devis.html', 'Devis']];
const header = (s) => `  <header id="nav" class="fixed inset-x-0 top-0 z-50">
    <div class="nav-bar mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-[72px]">
      <a href="index.html" class="flex items-center gap-2.5 min-h-[44px] brand" aria-label="BuildWebAI, accueil">
        <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">${LOGO}</svg>
        <span class="font-bold tracking-tight text-[17px]">BuildWebAI</span>
      </a>
      <nav aria-label="Navigation principale" class="hidden lg:block">
        <ul class="flex items-center gap-8 text-[15px] font-medium text-white/80">
${navLinks.map(([h, t]) => `          <li><a class="ulink" href="${h}">${t}</a></li>`).join('\n')}
        </ul>
      </nav>
      <div class="flex items-center gap-2">
        <a href="devis.html?offre=sur_mesure${s.activite ? `&amp;activite=${encodeURIComponent(s.activite)}` : ''}" class="btn btn-ghost hidden sm:inline-flex">Demander un devis</a>
        <button id="menuBtn" class="menu-btn lg:hidden" aria-expanded="false" aria-controls="mobileMenu" aria-label="Ouvrir le menu">
          <span></span><span></span>
        </button>
      </div>
    </div>
    <div id="mobileMenu" class="mobile-menu lg:hidden" hidden>
      <ul class="px-4 pt-24 flex flex-col gap-1">
${SECTORS.map((o) => `        <li><a href="${o.slug}.html"${o.slug === s.slug ? ' aria-current="page"' : ''}>${esc(o.short)}</a></li>`).join('\n')}
        <li><a href="index.html#demos">Toutes les démos</a></li>
        <li><a href="index.html#tarifs">Tarifs</a></li>
        <li><a href="devis.html">Demande de devis</a></li>
      </ul>
    </div>
  </header>`;

const footer = () => `  <footer class="bg-night border-t border-white/10">
    <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-12">
      <div class="md:col-span-4">
        <a href="index.html" class="inline-flex items-center gap-2.5 min-h-[44px]" aria-label="BuildWebAI, accueil">
          <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">${LOGO}</svg>
          <span class="font-bold tracking-tight">BuildWebAI</span>
        </a>
        <p class="mt-4 text-white/60 max-w-sm text-[15px]">Site, réservation directe et automatisations IA pour restaurants, hôtels, commerces, artisans, garages et clubs.</p>
      </div>
      <nav class="md:col-span-5" aria-label="Secteurs">
        <ul class="grid grid-cols-2 gap-x-6 text-[15px] text-white/75">
${SECTORS.map((o) => `          <li><a class="ulink foot-link" href="${o.slug}.html">${esc(o.short)}</a></li>`).join('\n')}
        </ul>
      </nav>
      <div class="md:col-span-3 text-[15px] text-white/75 flex flex-col">
        <a class="ulink foot-link" href="index.html#tarifs">Tarifs</a>
        <a class="ulink foot-link" href="devis.html">Demande de devis</a>
        <a class="ulink foot-link" id="mailLink" href="mailto:contact@build-web-ai.com">contact@build-web-ai.com</a>
      </div>
    </div>
    <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 pb-10 text-[12px] text-white/60 flex flex-col sm:flex-row gap-2 justify-between">
      <p>© 2026 BuildWebAI. Prix hors taxes.</p>
      <p class="flex flex-wrap gap-x-4 gap-y-1"><a class="ulink foot-link" href="mentions-legales.html">Mentions légales</a><a class="ulink foot-link" href="confidentialite.html">Confidentialité</a><a class="ulink foot-link" href="cgv.html">CGV</a></p>
      <p>Photographies&nbsp;: Unsplash, licence Unsplash.</p>
    </div>
  </footer>`;

/* ---------- Page secteur ---------- */
function page(s) {
  const url = `https://buildwebia.com/${s.slug}.html`;
  const devis = `devis.html?offre=sur_mesure${s.activite ? `&amp;activite=${encodeURIComponent(s.activite)}` : ''}`;
  const heroImg = s.animation ? '' : `
        <div class="lg:col-span-5 hero-in sp-photo">
          <img src="assets/img/secteurs/${s.slug}-1000.webp" srcset="assets/img/secteurs/${s.slug}-600.webp 600w, assets/img/secteurs/${s.slug}-1000.webp 1000w" sizes="(min-width: 1024px) 40vw, 100vw" alt="" width="1000" height="1250" fetchpriority="high">
        </div>`;
  const pains = s.pains.map(([p, sol, imp]) => `            <tr>
              <th scope="row">${nb(p)}</th>
              <td><span class="pains-k" aria-hidden="true">Le site</span>${nb(sol)}</td>
              <td><span class="pains-k" aria-hidden="true">Ce que ça change</span>${nb(imp)}</td>
            </tr>`).join('\n');
  const mods = s.modules.map(([k, t]) => `          <li class="smod">
            <p class="smod-name">${esc(MODULES[k][0])}</p>
            <p class="smod-price">${MODULES[k][1]}</p>
            <p class="smod-txt">${nb(t)}</p>
          </li>`).join('\n');
  const vitrine = s.animation ? '\n' + readFileSync('src/partials/vitrine.html', 'utf8') : '';
  return `<!doctype html>
<html lang="fr" data-type="service">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(s.title)} · BuildWebAI</title>
  <meta name="description" content="${esc(s.desc)}">
  <meta name="theme-color" content="#081426">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:title" content="${esc(s.title)} · BuildWebAI">
  <meta property="og:description" content="${esc(s.desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://buildwebia.com/assets/img/secteurs/${s.slug}-1000.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='10' fill='%23081426'/%3E%3Cpath fill='%23fff' d='M8 6h8v36H8zM16 6h11a8.5 8.5 0 0 1 0 17H16zM16 23h13a9.5 9.5 0 0 1 0 19H16z'/%3E%3Crect x='40' y='36' width='6' height='6' fill='%23E62E2D'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/site.css">
  <link rel="stylesheet" href="assets/tailwind.css">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body class="bg-night text-white font-sans antialiased">
  <!-- Page générée par scripts/build-secteurs.mjs : modifier scripts/secteurs-data.mjs, pas ce fichier -->
  <a href="#contenu" class="skip-link">Aller au contenu</a>

${header(s)}

  <main id="contenu">
    <section id="top" class="hero sp-hero relative overflow-hidden${s.animation ? ' sp-hero--text' : ''}">
      <div class="grid-bg" aria-hidden="true"></div>
      <div class="halo" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-16 lg:pb-20 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <div class="lg:col-span-7">
          <nav class="hero-in sp-crumb" aria-label="Fil d'Ariane"><a class="ulink" href="index.html#secteurs">Secteurs</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.short)}</span></nav>
          <h1 class="display mt-5 text-[2.5rem] leading-[0.92] sm:text-6xl lg:text-[4.4rem]">
            <span class="hero-line block"><span class="hero-in block">${esc(s.h1[0])},</span></span>
            <span class="hero-line block"><span class="hero-in block text-steel">${esc(s.h1[1])}<span class="text-ember">.</span></span></span>
          </h1>
          <p class="hero-in mt-6 max-w-[36rem] text-[17px] lg:text-lg leading-relaxed text-white/75">${nb(s.lead)}</p>
          <div class="hero-in mt-9 flex flex-col sm:flex-row gap-3">
            <a href="#demo" class="btn btn-primary">Voir ${s.demos.length > 1 ? 'les démos' : 'la démo'}</a>
            <a href="${devis}" class="btn btn-outline">Demander un devis</a>
          </div>
          <p class="hero-in mt-8 text-[15px] text-white/60">${esc(s.ex)}</p>
        </div>${heroImg}
      </div>
    </section>
${vitrine}
    <section id="problemes" class="bg-mist text-ink" aria-labelledby="pb-title">
      <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div class="grid lg:grid-cols-12 gap-6 items-end">
          <h2 id="pb-title" class="lg:col-span-7 display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[0.95]">Vos problèmes, nos réponses<span class="text-ember">.</span></h2>
          <p class="lg:col-span-5 text-lg leading-relaxed text-ink/80 max-w-[34rem]">Ce qui vous coûte du temps et de l'argent aujourd'hui, et ce que le site fait à votre place.</p>
        </div>
        <table class="pains mt-12">
          <thead><tr><th scope="col">Le problème</th><th scope="col">Ce que fait le site</th><th scope="col">Ce que ça change</th></tr></thead>
          <tbody>
${pains}
          </tbody>
        </table>
      </div>
    </section>

    <section id="demo" class="bg-night relative overflow-hidden" aria-labelledby="dm-title">
      <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div class="grid lg:grid-cols-12 gap-6 items-end">
          <h2 id="dm-title" class="lg:col-span-7 display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[0.95]">${s.demos.length > 1 ? 'Les démos' : 'La démo'} de votre métier<span class="text-ember">.</span></h2>
          <p class="lg:col-span-5 text-lg leading-relaxed text-white/70 max-w-[34rem]">Elle se parcourt comme un vrai site. Son bouton «&nbsp;Personnaliser&nbsp;» la met à votre nom et à vos couleurs en quelques secondes.</p>
        </div>
        <div class="acc-rows mt-12">
${accordion(s.demos, `Démos : ${s.short}`)}
        </div>
      </div>
    </section>

    <section id="modules" class="bg-mist text-ink" aria-labelledby="md-title">
      <div class="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div class="grid lg:grid-cols-12 gap-6 items-end">
          <h2 id="md-title" class="lg:col-span-7 display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[0.95]">Les modules utiles chez vous<span class="text-ember">.</span></h2>
          <p class="lg:col-span-5 text-lg leading-relaxed text-ink/80 max-w-[34rem]">À ajouter au site, un par un ou dans le Pack Performance. Prix hors taxes, mise en place comprise.</p>
        </div>
        <ul class="smods mt-12" role="list">
${mods}
        </ul>
        <div class="sp-offer mt-10">
          <p><b>Starter Express</b> 499&nbsp;€ · <b>Pack Performance</b> de 1&nbsp;000 à 2&nbsp;900&nbsp;€, garantie 3&nbsp;mois · <b>Hybride</b> et <b>Commission</b> pour démarrer sans avance. Maintenance mensuelle en plus.</p>
          <a class="btn btn-dark" href="index.html#tarifs">Voir tous les tarifs</a>
        </div>
      </div>
    </section>

    <section id="contact" class="relative overflow-hidden bg-night" aria-labelledby="ct-title">
      <div class="grid-bg" aria-hidden="true"></div>
      <div class="halo halo--low" aria-hidden="true"></div>
      <div class="relative mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-24 lg:py-28 grid lg:grid-cols-12 gap-10 items-end">
        <div class="lg:col-span-7">
          <h2 id="ct-title" class="display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[0.95]">Parlons de votre projet<span class="text-ember">.</span></h2>
          <p class="mt-6 text-lg leading-relaxed text-white/70 max-w-[34rem]">Trois minutes pour décrire votre activité, ou une vidéo de 90&nbsp;secondes qui compare votre site actuel à ce qu'il pourrait être.</p>
        </div>
        <div class="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
          <a href="${devis}" class="btn btn-primary">Demander un devis</a>
          <a href="index.html#audit" class="btn btn-outline">Recevoir l'audit vidéo gratuit</a>
        </div>
      </div>
    </section>
  </main>

${footer()}

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
  <script src="assets/app.js" defer></script>
</body>
</html>
`;
}

for (const s of SECTORS) writeFileSync(`${s.slug}.html`, page(s));

let idx = readFileSync('index.html', 'utf8');
idx = idx.replace(/ {4}<!-- @secteurs[\s\S]*?<!-- \/@secteurs -->/, homeSecteurs()).replace(/ {4}<!-- @demos[\s\S]*?<!-- \/@demos -->/, homeDemos());
writeFileSync('index.html', idx);
console.log(`Pages secteurs : ${SECTORS.map((s) => s.slug).join(', ')} · accueil mis à jour`);

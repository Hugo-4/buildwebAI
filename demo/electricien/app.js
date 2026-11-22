/* Démo électricien · BuildWebAI
   Dépannage guidé (que vérifier avant d'appeler), projets, simulateur de borne de recharge avec aides,
   check-up sécurité en 5 questions, prise de rendez-vous (visite et devis gratuits),
   panneau « Personnaliser » (?nom=…&accent=0D6B68 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
  const now = new Date();
  const H = now.getHours() + now.getMinutes() / 60;
  const wd = now.getDay();
  const TEL = '04 65 71 12 56';

  /* ---------- Prise de rendez-vous (utilisée par toutes les sections) ---------- */
  const MOTIFS = ['Dépannage', 'Rénovation ou mise aux normes', 'Changement de tableau', 'Borne de recharge', 'Domotique', 'Éclairage', 'Diagnostic électrique', 'Autre projet'];
  $('#motif').innerHTML = MOTIFS.map((m) => `<option>${m}</option>`).join('');
  function goRdv(motif) {
    $('#motif').value = motif;
    $('#rdv').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => $('#motif').focus({ preventScroll: true }), 450);
  }

  /* ---------- Dépannage guidé ---------- */
  const open = wd >= 1 && wd <= 5 && H >= 8 && H < 16.5;
  const satAm = wd === 6 && H < 11;
  $('#liveTxt').textContent = open ? 'Dépannage possible aujourd’hui' : satAm ? 'Dépannage possible ce matin' : 'Prochain dépannage : dès lundi 8 h, urgences au téléphone';
  const FAULTS = [
    { id: 'tout', n: 'Plus de courant du tout', lvl: 'today', t: 'D’abord : est-ce tout le quartier ?',
      steps: ['Regardez si les voisins ou l’éclairage de la rue ont du courant.', 'Si non : c’est une coupure du réseau, appelez Enedis au 09 726 750 69 (Rhône).', 'Si oui : réarmez le disjoncteur général, près du compteur.', 'S’il redescend aussitôt, n’insistez pas : il y a un défaut, on vient.'] },
    { id: 'saute', n: 'Le disjoncteur saute', lvl: 'today', t: 'Trouvons l’appareil en cause',
      steps: ['Débranchez tout ce qui chauffe : four, plaques, radiateurs, lave-linge.', 'Réarmez, puis rebranchez un appareil à la fois.', 'Si ça saute avec un appareil précis, c’est lui : il faut le réparer ou le changer.', 'Si ça saute même tout débranché, c’est un défaut d’isolement : appelez-nous.'] },
    { id: 'piece', n: 'Une pièce sans courant', lvl: 'rdv', t: 'Souvent un simple disjoncteur',
      steps: ['Ouvrez le tableau : un petit disjoncteur est peut-être baissé.', 'Remontez-le. S’il retombe, laissez-le baissé.', 'Notez le nom du circuit : il nous aidera à venir avec la bonne pièce.'] },
    { id: 'odeur', n: 'Odeur de brûlé, prise chaude', lvl: 'urgent', t: 'Coupez ce circuit tout de suite',
      steps: ['Au tableau, baissez le disjoncteur de la pièce, ou le général si vous ne le trouvez pas.', 'Ne touchez pas la prise et ne la réutilisez pas.', 'Appelez-nous maintenant : une prise qui chauffe peut provoquer un incendie.'] },
    { id: 'lumiere', n: 'Lumières qui clignotent', lvl: 'rdv', t: 'Une ampoule, ou une connexion à resserrer',
      steps: ['Si c’est une seule lampe : changez l’ampoule, vérifiez qu’elle est compatible avec le variateur.', 'Si plusieurs pièces clignotent ensemble, une connexion est sans doute desserrée au tableau.', 'Ce n’est pas urgent, mais à faire vérifier dans la semaine.'] },
  ];
  let fault = null;
  function renderFaults() {
    $('#faults').innerHTML = FAULTS.map((f) => `<button type="button" role="radio" aria-checked="${fault === f.id}" data-fault="${f.id}">${f.n}</button>`).join('');
    const f = FAULTS.find((x) => x.id === fault);
    if (!f) return;
    const foot = f.lvl === 'urgent'
      ? `<a class="btn btn--accent" href="tel:+33465711256">Appeler le ${TEL}</a><span class="adv-price">Intervention prioritaire, déplacement 69 €</span>`
      : f.lvl === 'today'
        ? `<a class="btn btn--accent" href="tel:+33465711256">${open || satAm ? 'Appeler pour venir aujourd\u2019hui' : `Appeler le ${TEL}`}</a><button type="button" class="btn btn--line btn--sm" data-rdv="Dépannage">Prendre rendez-vous</button><span class="adv-price">Déplacement 69 €, déduit si on répare</span>`
        : `<button type="button" class="btn btn--accent" data-rdv="Dépannage">Prendre rendez-vous</button><span class="adv-price">Déplacement 69 €, déduit si on répare</span>`;
    $('#advice').innerHTML = `<p class="adv-t">${f.t}</p><ol class="adv-list">${f.steps.map((x) => `<li>${x}</li>`).join('')}</ol><div class="adv-foot">${foot}</div>`;
  }
  $('#faults').addEventListener('click', (e) => { const b = e.target.closest('[data-fault]'); if (b) { fault = b.dataset.fault; renderFaults(); $(`[data-fault="${fault}"]`).focus(); } });

  /* ---------- Projets ---------- */
  const PROJ = [
    { img: 'renovation', n: 'Rénovation et mise aux normes', d: 'Toute la maison ou une pièce, aux normes NF C 15-100, avec le passage du Consuel.', p: 'Sur devis', m: 'Rénovation ou mise aux normes' },
    { img: 'tableau', n: 'Tableau électrique', d: 'Remplacement d’un vieux tableau à fusibles, différentiels 30 mA, repérage clair.', p: 'Dès 990 €', m: 'Changement de tableau' },
    { img: 'irve', n: 'Borne de recharge', d: 'Maison ou copropriété, 7,4 ou 11 kW, installateur certifié IRVE.', p: 'Dès 1 190 €', link: '#borne', l: 'Simuler le prix' },
    { img: 'domotique', n: 'Domotique', d: 'Volets, chauffage et éclairage pilotés depuis le téléphone, sans tout recâbler.', p: 'Dès 450 €', m: 'Domotique' },
    { img: 'eclairage', n: 'Éclairage', d: 'Spots, suspensions, bandeaux LED, jardin et allée : on dessine la lumière avec vous.', p: 'Sur devis', m: 'Éclairage' },
    { img: 'diagnostic', n: 'Diagnostic électrique', d: 'Contrôle complet avec rapport, utile avant d’acheter, de louer ou de rénover.', p: '149 €, déduit des travaux', link: '#check', l: 'Faire le check-up' },
  ];
  $('#pgrid').innerHTML = PROJ.map((p) => `<article class="proj">
    <div class="proj-img"><img src="img/${p.img}-600.webp" srcset="img/${p.img}-600.webp 600w, img/${p.img}-900.webp 900w" sizes="(min-width: 960px) 33vw, (min-width: 600px) 50vw, 100vw" alt="" width="900" height="675" loading="lazy" decoding="async"></div>
    <div class="proj-b"><h3>${p.n}</h3><p>${p.d}</p>
      <div class="proj-foot"><span class="proj-price">${p.p}</span>${p.link ? `<a href="${p.link}">${p.l}</a>` : `<a href="#rdv" data-rdv="${p.m}">Demander une visite</a>`}</div></div>
  </article>`).join('');

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rdv]');
    if (!b) return;
    e.preventDefault();
    goRdv(b.dataset.rdv);
  });

  /* ---------- Simulateur borne ---------- */
  const HOMES = [{ id: 'maison', n: 'Maison' }, { id: 'copro', n: 'Appartement en copropriété' }];
  const POWS = [{ id: '7', n: '7,4 kW · monophasé', p: 1190 }, { id: '11', n: '11 kW · triphasé', p: 1490 }];
  const ev = { home: 'maison', pow: '7' };
  const chips = (sel, list, key) => { $(sel).innerHTML = list.map((x) => `<button type="button" role="radio" aria-checked="${ev[key] === x.id}" data-${key}="${x.id}">${x.n}</button>`).join(''); };
  function renderEv() {
    chips('#evHome', HOMES, 'home'); chips('#evPow', POWS, 'pow');
    const dist = +$('#dist').value;
    $('#distV').textContent = `${dist} m`;
    const base = POWS.find((x) => x.id === ev.pow).p;
    const cable = Math.max(0, dist - 10) * 28;
    const copro = ev.home === 'copro' ? 250 : 0;
    const opts = ($('#optApp').checked ? 120 : 0) + ($('#optSurge').checked ? 90 : 0);
    const total = base + cable + copro + opts;
    const credit = Math.min(500, total * 0.75);
    const rows = [['Borne posée et mise en service', euro(base)]];
    if (cable) rows.push([`Câble au-delà de 10 m (${dist - 10} m)`, euro(cable)]);
    if (copro) rows.push(['Raccordement en parking collectif', euro(copro)]);
    if (opts) rows.push(['Options', euro(opts)]);
    rows.push(['Crédit d\u2019impôt estimé', `−${euro(credit)}`, 'aid']);
    rows.push(['Reste à votre charge', euro(total - credit), 'net']);
    $('#evSum').innerHTML = rows.map(([a, b, c = '']) => `<span class="${c}">${a}</span><span class="${c}">${b}</span>`).join('');
    if (ev.pow === '11') $('#evSum').insertAdjacentHTML('beforeend', '<span class="small muted" style="grid-column:1/-1">Le 11 kW demande un abonnement triphasé : on vérifie lors de la visite.</span>');
    if (ev.home === 'copro') $('#evSum').insertAdjacentHTML('beforeend', '<span class="small muted" style="grid-column:1/-1">En copropriété, une prime Advenir peut s’ajouter : nous montons le dossier.</span>');
  }
  $('#evHome').addEventListener('click', (e) => { const b = e.target.closest('[data-home]'); if (b) { ev.home = b.dataset.home; renderEv(); $(`[data-home="${ev.home}"]`).focus(); } });
  $('#evPow').addEventListener('click', (e) => { const b = e.target.closest('[data-pow]'); if (b) { ev.pow = b.dataset.pow; renderEv(); $(`[data-pow="${ev.pow}"]`).focus(); } });
  ['#dist', '#optApp', '#optSurge'].forEach((s) => $(s).addEventListener('input', renderEv));
  $('#evGo').addEventListener('click', () => goRdv('Borne de recharge'));

  /* ---------- Check-up sécurité ---------- */
  const QS = [
    { q: 'Le logement a plus de 15 ans ?', risk: 'oui' },
    { q: 'Le tableau a encore des fusibles en porcelaine ?', risk: 'oui' },
    { q: 'Il y a un interrupteur différentiel 30 mA au tableau ?', risk: 'non' },
    { q: 'Toutes les prises ont une broche de terre ?', risk: 'non' },
    { q: 'Vous branchez des multiprises les unes sur les autres ?', risk: 'oui' },
  ];
  const ans = {};
  function renderQuiz() {
    $('#quiz').innerHTML = QS.map((x, i) => `<div class="q"><p id="q${i}">${x.q}</p><div class="yn" role="radiogroup" aria-labelledby="q${i}">${['oui', 'non'].map((v) => `<button type="button" role="radio" aria-checked="${ans[i] === v}" data-q="${i}" data-v="${v}">${v === 'oui' ? 'Oui' : 'Non'}</button>`).join('')}</div></div>`).join('');
    const done = Object.keys(ans).length === QS.length;
    $('#verdict').hidden = !done;
    if (!done) return;
    const risks = QS.filter((x, i) => ans[i] === x.risk).length;
    const v = $('#verdict');
    v.classList.toggle('is-warn', risks >= 2);
    v.innerHTML = risks === 0
      ? `<p class="v-t">Rien d'alarmant</p><p>Votre installation coche les bonnes cases. Un contrôle tous les dix ans reste une bonne habitude, surtout avant de vendre ou de louer.</p>`
      : `<p class="v-t">${risks >= 3 ? 'Faites contrôler votre installation' : 'Quelques points à vérifier'}</p><p>${risks} réponse${risks > 1 ? 's' : ''} sur 5 signale${risks > 1 ? 'nt' : ''} un risque. Le diagnostic complet coûte 149 € et il est déduit si vous faites les travaux avec nous.</p><button type="button" class="btn btn--accent" data-rdv="Diagnostic électrique">Réserver un diagnostic</button>`;
  }
  $('#quiz').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    ans[b.dataset.q] = b.dataset.v;
    renderQuiz();
    $(`[data-q="${b.dataset.q}"][data-v="${b.dataset.v}"]`).focus();
  });

  /* ---------- Créneaux de visite ---------- */
  const DAYS = [];
  for (let d = new Date(now), i = 0; DAYS.length < 6 && i < 14; i++) {
    d = new Date(now); d.setDate(now.getDate() + i + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) DAYS.push(d);
  }
  const fd = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }).replace('.', '');
  const HALVES = ['Matin, 8 h – 12 h', 'Après-midi, 13 h 30 – 18 h'];
  let day = 0, half = 0;
  function renderSlots() {
    $('#days').innerHTML = DAYS.map((d, i) => `<button type="button" role="radio" aria-checked="${i === day}" data-day="${i}">${fd(d)}</button>`).join('');
    $('#halves').innerHTML = HALVES.map((h, i) => `<button type="button" role="radio" aria-checked="${i === half}" data-half="${i}">${h}</button>`).join('');
  }
  $('#days').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) { day = +b.dataset.day; renderSlots(); $(`[data-day="${day}"]`).focus(); } });
  $('#halves').addEventListener('click', (e) => { const b = e.target.closest('[data-half]'); if (b) { half = +b.dataset.half; renderSlots(); $(`[data-half="${half}"]`).focus(); } });
  $('#rdvForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nm = $('#nm'), tel = $('#tel'), msg = $('#rdvMsg');
    const okN = nm.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(tel.value.trim());
    nm.setAttribute('aria-invalid', String(!okN)); tel.setAttribute('aria-invalid', String(!okT));
    if (!okN || !okT) { msg.className = 'form-msg err'; msg.textContent = !okN ? 'Indiquez votre nom.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okN ? nm : tel).focus(); return; }
    const d = DAYS[day].toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    msg.className = 'form-msg ok';
    msg.textContent = `C'est noté, ${nm.value.trim()} : visite « ${$('#motif').value} » ${d}, ${HALVES[half].toLowerCase()}. Un SMS la veille vous donne l'heure précise (démonstration).`;
  });

  /* ---------- Barre mobile : masquée sur le formulaire ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => $('#mBar').classList.toggle('is-off', e.isIntersecting), { threshold: 0.2 }).observe($('#rdv'));
  }

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Delmas Électricité', accent: '0D6B68' };
  const p = new URLSearchParams(location.search);
  const st = { nom: (p.get('nom') || DEF.nom).slice(0, 28), accent: /^[0-9a-f]{6}$/i.test(p.get('accent') || '') ? p.get('accent').toUpperCase() : DEF.accent };
  if (p.get('presentation') === '1') root.classList.add('is-presentation');
  const lum = (h) => {
    const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const url = (pres) => {
    const q = new URLSearchParams();
    Object.keys(DEF).forEach((k) => { if (st[k] !== DEF[k]) q.set(k, st[k]); });
    if (pres) q.set('presentation', '1');
    return `${location.pathname}${q.toString() ? `?${q}` : ''}`;
  };
  function apply(push = true) {
    $$('[data-bind="nom"]').forEach((el) => { el.textContent = st.nom; });
    document.title = `${st.nom} · Électricien`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#17191E');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Delmas Électricité rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  renderFaults(); renderEv(); renderQuiz(); renderSlots();
  apply(false);
})();

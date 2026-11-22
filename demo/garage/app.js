/* Démo garage · BuildWebAI
   Marque, modèle et motorisation → prix, pré-diagnostic (symptôme + photo + roulable ?) qui oriente vers le bon créneau ou l'urgence,
   rendez-vous par type d'intervention avec rappel SMS à confirmer, suivi de réparation avec devis validé en ligne,
   relance J+3 et demande d'avis à la restitution, tarifs par catégorie, rappels CT et révision,
   panneau « Personnaliser » (?nom=…&accent=1F3FA8 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
  const now = new Date();
  const st = { nom: 'Garage Ferrand' };

  /* ---------- Choix du véhicule : marque, modèle, motorisation ---------- */
  const BRANDS = {
    Peugeot: [['208', 0], ['308', 1], ['2008', 1], ['3008', 2], ['5008', 2]],
    Renault: [['Clio', 0], ['Captur', 1], ['Mégane', 1], ['Scénic', 2], ['Kangoo', 2]],
    'Citroën': [['C3', 0], ['C4', 1], ['C5 Aircross', 2], ['Berlingo', 2]],
    Dacia: [['Sandero', 0], ['Duster', 2], ['Jogger', 2]],
    Volkswagen: [['Polo', 0], ['Golf', 1], ['T-Roc', 1], ['Tiguan', 2]],
    Toyota: [['Yaris', 0], ['Corolla', 1], ['C-HR', 1], ['RAV4', 2]],
    Ford: [['Fiesta', 0], ['Focus', 1], ['Puma', 1], ['Kuga', 2]],
    Fiat: [['500', 0], ['Panda', 0], ['Tipo', 1]],
  };
  const ENERGY = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
  const CATS = ['Citadine', 'Compacte', 'SUV ou familiale'];
  const PRICES = [
    ['Diagnostic électronique', 'Déduit si vous faites la réparation chez nous', [49, 49, 49]],
    ['Vidange et filtre à huile', '', [99, 119, 149]],
    ['Révision constructeur', 'Carnet tamponné, garantie constructeur préservée', [179, 219, 269]],
    ['Plaquettes avant', '', [129, 149, 179]],
    ['Disques et plaquettes avant', '', [249, 289, 349]],
    ['Recharge de climatisation', '', [79, 89, 99]],
    ['Montage et équilibrage de 4 pneus', 'Pneus en plus, au prix affiché', [49, 59, 69]],
    ['Courroie de distribution', 'Kit complet et pompe à eau', null],
  ];
  let car = null;
  const sel = { brand: '', model: '', cat: null, energy: 'Essence' };
  $('#brand').innerHTML = '<option value="">Choisir la marque</option>' + Object.keys(BRANDS).map((b) => `<option>${b}</option>`).join('') + '<option value="autre">Une autre marque</option>';
  function renderModels() {
    const m = $('#model');
    if (!sel.brand || sel.brand === 'autre') { m.disabled = true; m.innerHTML = `<option value="">${sel.brand ? 'Choisissez la taille' : 'D\u2019abord la marque'}</option>`; return; }
    m.disabled = false;
    m.innerHTML = '<option value="">Choisir le modèle</option>' + BRANDS[sel.brand].map(([n]) => `<option>${n}</option>`).join('') + '<option value="autre">Un autre modèle</option>';
  }
  function renderPick() {
    const needCat = sel.brand === 'autre' || sel.model === 'autre';
    $('#catBox').hidden = !needCat;
    $('#catPick').innerHTML = CATS.map((c, i) => `<button type="button" role="radio" aria-checked="${sel.cat === i}" data-pick="${i}">${c}</button>`).join('');
    $('#energy').innerHTML = ENERGY.map((e) => `<button type="button" role="radio" aria-checked="${sel.energy === e}" data-energy="${e}">${e}</button>`).join('');
    const known = sel.brand && sel.brand !== 'autre' && sel.model && sel.model !== 'autre';
    const c = known ? BRANDS[sel.brand].find(([n]) => n === sel.model)[1] : needCat ? sel.cat : null;
    if (c === null || c === undefined) { car = null; $('#veh').hidden = true; renderRdvVeh(); return; }
    car = { n: known ? `${sel.brand} ${sel.model}` : `${CATS[c].toLowerCase()}${sel.brand !== 'autre' ? ` ${sel.brand}` : ''}`, cat: c, known };
    cat = c; renderPrices();
    const ev = sel.energy === 'Électrique';
    const rows = [
      ['Révision constructeur', PRICES[2][2][c] * (ev ? 0.75 : 1)],
      [ev ? 'Contrôle batterie et haute tension' : 'Vidange et filtre à huile', ev ? 59 : PRICES[1][2][c]],
      ['Plaquettes avant', PRICES[3][2][c]],
      ['Recharge de climatisation', PRICES[5][2][c]],
    ];
    $('#veh').hidden = false;
    $('#veh').innerHTML = `<p class="veh-name">${known ? car.n : CATS[c] + (sel.brand !== 'autre' ? ` ${sel.brand}` : '')}</p><p class="veh-meta">${sel.energy} · catégorie ${CATS[c].toLowerCase()}${ev ? ' · pas de vidange sur une électrique' : ''}</p>
      <ul class="veh-list">${rows.map(([n, p]) => `<li><span>${n}</span><b>${euro(p)}</b></li>`).join('')}</ul>
      <a class="btn btn--accent btn--sm" href="#rdv">Réserver pour cette voiture</a>`;
    $$('[data-veh-name]').forEach((el) => { el.textContent = known ? car.n : 'Peugeot 308'; });
    renderRdvVeh();
  }
  const forCar = () => (car ? (car.known ? `votre ${car.n}` : `votre ${car.n}`) : '');
  $('#brand').addEventListener('change', (e) => { sel.brand = e.target.value; sel.model = ''; renderModels(); renderPick(); });
  $('#model').addEventListener('change', (e) => { sel.model = e.target.value; renderPick(); });
  $('#catPick').addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b) { sel.cat = +b.dataset.pick; renderPick(); $(`[data-pick="${sel.cat}"]`).focus(); } });
  $('#energy').addEventListener('click', (e) => { const b = e.target.closest('[data-energy]'); if (b) { sel.energy = b.dataset.energy; renderPick(); $(`[data-energy="${sel.energy}"]`).focus(); } });

  /* ---------- Tarifs ---------- */
  let cat = 1;
  function renderPrices() {
    $('#cats').innerHTML = CATS.map((c, i) => `<button type="button" role="radio" aria-checked="${i === cat}" data-cat="${i}">${c}</button>`).join('');
    $('#ptable').innerHTML = PRICES.map(([n, d, p]) => `<tr><th scope="row">${n}${d ? `<small>${d}</small>` : ''}</th><td>${p ? euro(p[cat]) : 'Sur devis'}</td></tr>`).join('');
  }
  $('#cats').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { cat = +b.dataset.cat; renderPrices(); $(`[data-cat="${cat}"]`).focus(); } });

  /* ---------- Rendez-vous ---------- */
  const SERVICES = [
    { id: 'diag', n: 'Diagnostic · 30 min', kind: 'slot' },
    { id: 'entretien', n: 'Révision ou vidange', kind: 'drop' },
    { id: 'freins', n: 'Freins', kind: 'drop' },
    { id: 'pneus', n: 'Pneus · 45 min', kind: 'slot' },
    { id: 'clim', n: 'Climatisation · 1 h', kind: 'slot' },
    { id: 'repa', n: 'Réparation sur devis', kind: 'drop' },
  ];
  const DAYS = [];
  for (let i = 1; DAYS.length < 6 && i < 14; i++) { const d = new Date(now); d.setDate(now.getDate() + i); if (d.getDay() !== 0) DAYS.push(d); }
  const TIMES = ['8 h 30', '9 h', '9 h 30', '10 h 30', '11 h', '14 h', '15 h 30', '16 h 30'];
  const rdv = { svc: 'diag', day: 0, slot: null };
  const svc = () => SERVICES.find((x) => x.id === rdv.svc);
  const full = (d, i) => ((d * 7 + i * 3 + DAYS[d].getDate()) % 5) === 0;
  function renderRdvVeh() { $('#rdvVeh').textContent = car ? `Pour ${forCar()}, ${sel.energy.toLowerCase()}` : ''; }
  function renderRdv() {
    $('#services').innerHTML = SERVICES.map((x) => `<button type="button" role="radio" aria-checked="${x.id === rdv.svc}" data-svc="${x.id}">${x.n}</button>`).join('');
    $('#days').innerHTML = DAYS.map((d, i) => `<button type="button" role="radio" aria-checked="${i === rdv.day}" data-day="${i}">${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }).replace('.', '')}</button>`).join('');
    const sat = DAYS[rdv.day].getDay() === 6;
    if (svc().kind === 'drop') {
      $('#slotL').textContent = 'Dépôt et retrait';
      rdv.slot = sat ? 'Dépôt 8 h – 9 h, retrait avant 12 h' : 'Dépôt 7 h 45 – 9 h, retrait dès 17 h';
      $('#slots').innerHTML = `<button type="button" role="radio" aria-checked="true" data-slot="${rdv.slot}">${rdv.slot}</button>`;
    } else {
      $('#slotL').textContent = 'L’heure';
      const times = TIMES.filter((t) => !sat || parseInt(t, 10) < 12);
      if (!times.includes(rdv.slot) || full(rdv.day, times.indexOf(rdv.slot))) rdv.slot = times.find((t, i) => !full(rdv.day, i));
      $('#slots').innerHTML = times.map((t, i) => `<button type="button" role="radio" aria-checked="${t === rdv.slot}" data-slot="${t}" ${full(rdv.day, i) ? 'disabled aria-label="' + t + ', complet"' : ''}>${t}</button>`).join('');
    }
    const noLoan = rdv.day % 3 === 1;
    $('#loan').disabled = noLoan; if (noLoan) $('#loan').checked = false;
    $('#loanTxt').textContent = noLoan ? 'complet ce jour-là' : 'gratuit, sur réservation';
  }
  $('#services').addEventListener('click', (e) => { const b = e.target.closest('[data-svc]'); if (b) { rdv.svc = b.dataset.svc; renderRdv(); $(`[data-svc="${rdv.svc}"]`).focus(); } });
  $('#days').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) { rdv.day = +b.dataset.day; renderRdv(); $(`[data-day="${rdv.day}"]`).focus(); } });
  $('#slots').addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (b && !b.disabled) { rdv.slot = b.dataset.slot; renderRdv(); } });
  function goRdv(id) {
    rdv.svc = id; renderRdv();
    $('#rdv').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => $(`[data-svc="${id}"]`).focus({ preventScroll: true }), 450);
  }
  $('#rdvForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nm = $('#nm'), tel = $('#tel'), msg = $('#rdvMsg');
    const okN = nm.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(tel.value.trim());
    nm.setAttribute('aria-invalid', String(!okN)); tel.setAttribute('aria-invalid', String(!okT));
    if (!okN || !okT) { msg.className = 'form-msg err'; msg.textContent = !okN ? 'Indiquez votre nom.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okN ? nm : tel).focus(); return; }
    const d = DAYS[rdv.day].toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const when = svc().kind === 'drop' ? `${d}, ${rdv.slot.toLowerCase()}` : `${d} à ${rdv.slot}`;
    msg.className = 'form-msg ok';
    msg.textContent = `C'est réservé, ${nm.value.trim()} : ${svc().n.split(' · ')[0].toLowerCase()} ${when}${$('#loan').checked ? ', avec véhicule de courtoisie' : ''}.`;
    const box = $('#rdvSms');
    box.hidden = !$('#sms').checked;
    box.innerHTML = `<small>SMS envoyé la veille</small>${st.nom} : rappel de votre rendez-vous ${when.replace(/^\S+ /, 'demain ')}${car ? ` pour ${forCar()}` : ''}. Répondez OUI pour confirmer, ou NON pour libérer le créneau.`;
  });

  /* ---------- Pré-diagnostic ---------- */
  const SYM = [
    { id: 'orange', n: 'Voyant moteur orange', svc: 'diag', tip: 'Souvent un capteur ou l’antipollution : la voiture peut rouler, sans forcer.' },
    { id: 'rouge', n: 'Voyant rouge (huile, température)', svc: 'diag', danger: true, tip: 'Un voyant rouge veut dire : arrêtez-vous dès que possible et coupez le moteur.' },
    { id: 'frein', n: 'Bruit au freinage', svc: 'freins', tip: 'Un grincement annonce souvent des plaquettes usées : à faire dans la semaine.' },
    { id: 'demarre', n: 'Ne démarre pas', svc: 'diag', tip: 'Batterie dans la plupart des cas : on peut venir la tester sur place.' },
    { id: 'fumee', n: 'Fumée', svc: 'diag', danger: true, tip: 'Fumée blanche épaisse ou bleue : ne roulez pas, le moteur peut casser.' },
    { id: 'clim', n: 'La clim ne refroidit plus', svc: 'clim', tip: 'Souvent une simple recharge, contrôle d’étanchéité compris.' },
    { id: 'autre', n: 'Autre chose', svc: 'diag', tip: 'Décrivez-le au mécanicien : le diagnostic dure 30 minutes.' },
  ];
  const ROLLS = [{ id: 'oui', n: 'Oui, normalement' }, { id: 'doute', n: 'Oui, mais je suis inquiet' }, { id: 'non', n: 'Non, elle est immobilisée' }];
  const voy = { sym: null, roll: null };
  function renderVoy() {
    $('#symptoms').innerHTML = SYM.map((x) => `<button type="button" role="radio" aria-checked="${voy.sym === x.id}" data-sym="${x.id}">${x.n}</button>`).join('');
    $('#rolls').innerHTML = ROLLS.map((x) => `<button type="button" role="radio" aria-checked="${voy.roll === x.id}" data-roll="${x.id}">${x.n}</button>`).join('');
    const r = $('#voyRes');
    if (!voy.sym || !voy.roll) { r.hidden = true; return; }
    const s = SYM.find((x) => x.id === voy.sym);
    const urgent = voy.roll === 'non' || (s.danger && voy.roll !== 'oui');
    r.hidden = false;
    r.classList.toggle('is-urgent', urgent);
    r.innerHTML = urgent
      ? `<p class="t">Ne reprenez pas la route</p><p>${s.tip} Un créneau d'urgence est gardé chaque jour : un mécanicien vous rappelle sous 15 minutes, et le remorquage dans Saint-Priest et alentours est à 89 €.</p><a class="btn btn--accent" href="tel:+33465711278">Appeler l'atelier</a>`
      : `<p class="t">${s.svc === 'diag' ? 'Diagnostic de 30 minutes, 49 €' : s.svc === 'freins' ? 'Contrôle des freins, offert si on les change' : 'Contrôle et recharge de clim, 1 h'}</p><p>${s.tip}${s.svc === 'diag' ? ' Les 49 € sont déduits si vous faites la réparation chez nous.' : ''}</p><button type="button" class="btn btn--accent" data-go="${s.svc}">Choisir mon créneau</button>`;
  }
  $('#symptoms').addEventListener('click', (e) => { const b = e.target.closest('[data-sym]'); if (b) { voy.sym = b.dataset.sym; renderVoy(); $(`[data-sym="${voy.sym}"]`).focus(); } });
  $('#rolls').addEventListener('click', (e) => { const b = e.target.closest('[data-roll]'); if (b) { voy.roll = b.dataset.roll; renderVoy(); $(`[data-roll="${voy.roll}"]`).focus(); } });
  $('#voyRes').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) goRdv(b.dataset.go); });
  $('#voyPhoto').addEventListener('change', (e) => { const f = e.target.files[0]; $('#voyPhotoName').textContent = f ? `Photo jointe : ${f.name}` : 'Une photo du tableau de bord suffit souvent.'; });

  /* ---------- Suivi et devis en ligne ---------- */
  const STEPS = ['Voiture reçue', 'Diagnostic terminé', 'Devis envoyé', 'En réparation', 'Prête à récupérer'];
  const TIMES_T = ['8 h 12', '9 h 05', '9 h 20', '', ''];
  const QUOTE = [['Plaquettes avant', 89], ['Disques avant (la paire)', 168], ['Liquide de frein', 35], ['Main-d’œuvre, 1 h 30', 120]];
  const total = QUOTE.reduce((a, [, p]) => a + p, 0);
  let step = 2, refused = false;
  const sms = [];
  const vname = () => (car && car.known ? car.n : 'Peugeot 308');
  function pushSms(t, label) { sms.push({ t, label }); renderSms(); }
  function renderSms() { $('#smsList').innerHTML = sms.map((m) => `<li><small>${m.label}</small>${m.t}</li>`).join(''); }
  function renderTrack() {
    $('#steps').innerHTML = STEPS.map((s, i) => {
      const label = refused && i === 3 ? 'Réparation refusée' : s;
      return `<li class="${i < step ? 'is-done' : i === step ? 'is-now' : ''}"><span>${label}</span><time>${TIMES_T[i]}</time></li>`;
    }).join('');
    const q = $('#quote');
    if (step === 2 && !refused) {
      q.innerHTML = `<p class="q-t">Devis n° D-2481</p><ul class="q-lines">${QUOTE.map(([n, p]) => `<li><span>${n}</span><span>${euro(p)}</span></li>`).join('')}</ul>
        <p class="q-total"><span>Total TTC</span><span>${euro(total)}</span></p>
        <div class="q-actions"><button type="button" class="btn btn--accent btn--sm" data-q="ok">Accepter le devis</button><button type="button" class="btn btn--line btn--sm" data-q="no">Refuser</button><button type="button" class="btn btn--line btn--sm" data-q="ask">Poser une question</button></div>
        <p class="q-note">Sans réponse, un SMS de relance part automatiquement trois jours après.</p>`;
    } else if (step === 3) q.innerHTML = '<p class="q-t">Devis accepté</p><p class="q-note">Les pièces sont en stock : la voiture est sur le pont.</p>';
    else if (step === 4) q.innerHTML = `<p class="q-t">${refused ? 'Voiture à récupérer' : 'Réparation terminée'}</p><p class="q-note">${refused ? 'Seul le diagnostic de 49 € est dû. Les pièces usées vous sont montrées au comptoir.' : 'Paiement au comptoir ou par lien sécurisé. Les pièces changées vous attendent dans un sac.'}</p><button type="button" class="btn btn--line btn--sm" data-q="reset">Rejouer la démo</button>`;
  }
  function startTrack() {
    sms.length = 0; step = 2; refused = false;
    pushSms(`${st.nom} : votre ${vname()} est bien arrivée à l'atelier. Diagnostic en cours.`, '8 h 12');
    pushSms('Diagnostic terminé : plaquettes et disques avant usés à 90 %. Le devis arrive.', '9 h 05');
    pushSms(`Votre devis de ${euro(total)} est prêt. Validez-le en un clic : ferrand.example/d/2481`, '9 h 20');
    renderTrack();
  }
  $('#quote').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const a = b.dataset.q;
    const later = (fn, ms) => setTimeout(fn, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms);
    if (a === 'reset') { startTrack(); $('#quote button').focus(); return; }
    if (a === 'ask') { pushSms('Question reçue : Karim, le mécanicien, vous rappelle dans l’heure.', 'à l’instant'); return; }
    if (a === 'no') {
      refused = true; step = 4; TIMES_T[4] = 'maintenant'; renderTrack();
      pushSms('C’est noté. Votre voiture est prête à être récupérée, seul le diagnostic de 49 € est dû.', 'à l’instant');
      $('#quote button').focus(); return;
    }
    step = 3; TIMES_T[3] = '9 h 41'; renderTrack();
    pushSms('Merci, devis accepté. Réparation en cours, prête vers 16 h.', '9 h 41');
    later(() => {
      step = 4; TIMES_T[4] = '15 h 50'; renderTrack();
      pushSms(`Votre ${vname()} est prête ! Atelier ouvert jusqu'à 18 h 30.`, '15 h 50');
      later(() => pushSms(`Merci pour votre confiance. Un avis Google nous aide beaucoup, 30 secondes : <a href="#suivi">laisser un avis</a>`, 'le lendemain, 10 h'), 1100);
      const r = $('#quote button'); if (r) r.focus();
    }, 1400);
  });

  /* ---------- Rappels CT et révision ---------- */
  const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const back = (m) => { const d = new Date(now); d.setDate(1); d.setMonth(d.getMonth() - m); return d; };
  $('#ct').value = ym(back(20)); $('#rev').value = ym(back(10));
  const fm = (d) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  let dueCT = null, dueRev = null;
  function renderDue() {
    const km = +$('#km').value;
    $('#kmV').textContent = `${km.toLocaleString('fr-FR')} km`;
    const [cy, cm] = ($('#ct').value || ym(back(20))).split('-').map(Number);
    const [ry, rm] = ($('#rev').value || ym(back(10))).split('-').map(Number);
    dueCT = new Date(cy + 2, cm - 1, 1);
    const months = Math.min(12, Math.max(3, Math.round((15000 / km) * 12)));
    dueRev = new Date(ry, rm - 1 + months, 1);
    const late = (d) => d < new Date(now.getFullYear(), now.getMonth(), 1);
    $('#due').innerHTML = `<li class="${late(dueCT) ? 'late' : ''}">Prochain contrôle technique<b>${fm(dueCT)}</b>${late(dueCT) ? 'Dépassé : à faire au plus vite' : ''}</li>
      <li class="${late(dueRev) ? 'late' : ''}">Prochaine révision<b>${fm(dueRev)}</b>${late(dueRev) ? 'En retard' : `tous les ${months} mois à ce rythme`}</li>`;
  }
  ['#ct', '#rev', '#km'].forEach((s) => $(s).addEventListener('input', renderDue));
  $('#remForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#remTel'), m = $('#remMsg');
    const ok = /^(\+33\s?|0)[67](\s?\d{2}){4}$/.test(t.value.trim());
    t.setAttribute('aria-invalid', String(!ok));
    if (!ok) { m.className = 'form-msg err'; m.textContent = 'Indiquez un numéro de portable, par exemple 06 12 34 56 78.'; t.focus(); return; }
    const before = (d) => { const x = new Date(d); x.setMonth(x.getMonth() - 1); return fm(x); };
    m.className = 'form-msg ok';
    m.textContent = `Rappels activés : un SMS en ${before(dueCT)} pour le contrôle technique et en ${before(dueRev)} pour la révision (démonstration).`;
  });

  /* ---------- Barre mobile ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => $('#mBar').classList.toggle('is-off', e.isIntersecting), { threshold: 0.2 }).observe($('#rdv'));
  }

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Garage Ferrand', accent: '1F3FA8' };
  const p = new URLSearchParams(location.search);
  st.nom = (p.get('nom') || DEF.nom).slice(0, 28);
  st.accent = /^[0-9a-f]{6}$/i.test(p.get('accent') || '') ? p.get('accent').toUpperCase() : DEF.accent;
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
    document.title = `${st.nom} · Garage`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#121417');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); startTrack(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); startTrack(); $('#czStatus').textContent = 'Version Garage Ferrand rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  apply(false);
  renderModels(); renderPick(); renderPrices(); renderRdv(); renderVoy(); renderDue(); startTrack();
})();

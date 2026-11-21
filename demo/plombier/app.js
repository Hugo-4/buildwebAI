/* Démo plombier · BuildWebAI
   Disponibilité selon l'heure, estimateur en 4 étapes (problème, urgence, zone, créneau), contrat d'entretien annuel,
   barre mobile Appeler / Estimer, panneau « Personnaliser » (?nom=…&accent=B4532A ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
  const now = new Date();
  const H = now.getHours() + now.getMinutes() / 60;
  const night = H >= 20 || H < 7 || now.getDay() === 0;
  const hhmm = (d) => `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`;

  /* ---------- Disponibilité ---------- */
  $('#liveTxt').textContent = night ? 'Astreinte de nuit · arrivée en 1 h environ' : 'Disponible maintenant · arrivée en 45 min environ';
  $('#live').classList.toggle('is-night', night);

  /* ---------- Estimateur ---------- */
  const ICON = {
    fuite: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    wc: '<path d="M6 4h6v7H6zM4 11h16a8 8 0 0 1-8 8H9l-1 2"/>',
    evier: '<path d="M3 11h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM12 11V5a2 2 0 0 1 4 0"/>',
    chauffe: '<rect x="6" y="3" width="12" height="16" rx="3"/><path d="M10 19v2M14 19v2M12 8v4"/>',
    robinet: '<path d="M4 10h10a4 4 0 0 1 4 4v1M8 10V6h4M18 19v.5"/>',
    autre: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01"/>',
  };
  const PROBS = [
    { id: 'fuite', n: 'Fuite d’eau', min: 120, max: 250 },
    { id: 'wc', n: 'WC bouché', min: 90, max: 150 },
    { id: 'evier', n: 'Évier ou douche bouché', min: 90, max: 150 },
    { id: 'chauffe', n: 'Plus d’eau chaude', min: 120, max: 280 },
    { id: 'robinet', n: 'Robinet à changer', min: 90, max: 140, part: true },
    { id: 'autre', n: 'Autre chose', min: 49, max: 49, diag: true },
  ];
  const WHEN = [
    { id: 'now', n: 'Maintenant, c’est urgent' },
    { id: 'today', n: 'Aujourd’hui' },
    { id: 'week', n: 'Cette semaine' },
  ];
  const ZONE = /^(6900[1-9]|69100|69500|69200|69300|69130|69600|69190|69120|69800|69110|69160|69230)$/;
  const ZNAME = { 69100: 'Villeurbanne', 69500: 'Bron', 69200: 'Vénissieux', 69300: 'Caluire', 69130: 'Écully', 69600: 'Oullins', 69190: 'Saint-Fons' };
  const s = { step: 0, prob: null, when: null, cp: '', slot: null };

  function renderProbs() {
    $('#probs').innerHTML = PROBS.map((p) => `<button type="button" role="radio" aria-checked="${s.prob === p.id}" data-prob="${p.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[p.id]}</svg>${p.n}</button>`).join('');
  }
  function renderWhen() {
    $('#when').innerHTML = WHEN.map((w) => `<button type="button" role="radio" aria-checked="${s.when === w.id}" data-when="${w.id}">${w.n}</button>`).join('');
    $('#whenNote').textContent = s.when === 'now'
      ? (night ? 'Nous sommes en horaires de nuit : la main-d’œuvre est majorée de 50 %, c’est compris dans l’estimation.' : 'Un plombier part dans les 15 minutes, arrivée en 45 minutes environ.')
      : s.when ? 'Sans majoration, aux heures d’ouverture.' : '';
  }
  const urgent = () => s.when === 'now' && night;
  function slots() {
    const out = [];
    if (s.when === 'now') {
      [45, 90].forEach((m) => { const d = new Date(now.getTime() + m * 6e4); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15); out.push(`Vers ${hhmm(d)}`); });
    } else if (s.when === 'today' && H < 17) {
      for (let h = Math.max(8, Math.ceil(H) + 1); h <= 17 && out.length < 3; h += 2) out.push(`Aujourd'hui ${h} h – ${h + 2} h`);
    }
    const tom = new Date(now); tom.setDate(tom.getDate() + (tom.getDay() === 6 ? 2 : 1));
    const day = tom.toLocaleDateString('fr-FR', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase());
    ['8 h – 10 h', '10 h – 12 h', '14 h – 16 h'].forEach((t) => { if (out.length < 4) out.push(`${day} ${t}`); });
    return out;
  }
  function renderQuote() {
    const p = PROBS.find((x) => x.id === s.prob);
    const k = urgent() ? 1.5 : 1;
    const lo = p.diag ? 49 : 49 + (p.min - 49) * k, hi = p.diag ? 49 : 49 + (p.max - 49) * k;
    const lines = [p.diag ? 'Diagnostic sur place, puis devis signé avant toute réparation' : 'Déplacement et diagnostic inclus'];
    if (urgent()) lines.push('Majoration de nuit (+50 % sur la main-d’œuvre) incluse');
    if (p.part) lines.push('Robinet en plus, au prix fournisseur, ou fourni par vous');
    else if (!p.diag) lines.push('Pièce éventuelle en plus, montrée avant la pose');
    lines.push('Vous payez après l’intervention, carte ou virement');
    $('#resT').textContent = `${p.n}, ${s.when === 'now' ? 'en urgence' : s.when === 'today' ? 'aujourd’hui' : 'cette semaine'}`;
    $('#quote').innerHTML = `<p class="q-price">${lo === hi ? euro(lo) : `${euro(lo)} à ${euro(hi)}`}</p><ul class="q-lines">${lines.map((x) => `<li>${x}</li>`).join('')}</ul>`;
    const sl = slots();
    if (!sl.includes(s.slot)) s.slot = sl[0];
    $('#slots').innerHTML = sl.map((t) => `<button type="button" role="radio" aria-checked="${t === s.slot}" data-slot="${t}">${t}</button>`).join('');
  }
  function valid() {
    if (s.step === 0) return !!s.prob;
    if (s.step === 1) return !!s.when;
    if (s.step === 2) return /^\d{5}$/.test(s.cp) && ZONE.test(s.cp);
    return true;
  }
  function show() {
    $$('.step').forEach((f) => { f.hidden = +f.dataset.step !== s.step; });
    $$('#steps li').forEach((li, i) => { li.classList.toggle('is-on', i === s.step); li.classList.toggle('is-done', i < s.step); });
    $('#back').hidden = s.step === 0;
    $('#next').textContent = s.step === 3 ? 'Réserver ce créneau' : 'Continuer';
    $('#next').disabled = !valid();
    if (s.step === 3) renderQuote();
  }
  $('#probs').addEventListener('click', (e) => { const b = e.target.closest('[data-prob]'); if (b) { s.prob = b.dataset.prob; renderProbs(); show(); $(`[data-prob="${s.prob}"]`).focus(); } });
  $('#when').addEventListener('click', (e) => { const b = e.target.closest('[data-when]'); if (b) { s.when = b.dataset.when; renderWhen(); show(); $(`[data-when="${s.when}"]`).focus(); } });
  $('#slots').addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (b) { s.slot = b.dataset.slot; renderQuote(); $(`[data-slot="${s.slot}"]`).focus(); } });
  $('#cp').addEventListener('input', (e) => {
    s.cp = e.target.value.replace(/\D/g, '').slice(0, 5); e.target.value = s.cp;
    const m = $('#cpMsg');
    if (s.cp.length < 5) { m.textContent = ''; m.className = 'form-msg'; }
    else if (ZONE.test(s.cp)) { m.className = 'form-msg ok'; m.textContent = `On intervient à ${ZNAME[s.cp] || `Lyon ${+s.cp.slice(3)}${s.cp === '69001' ? 'er' : 'e'}`}.`; }
    else { m.className = 'form-msg err'; m.textContent = 'Hors de notre zone. Appelez-nous : nous vous donnons le nom d’un confrère.'; }
    $('#next').disabled = !valid();
  });
  $('#photo').addEventListener('change', (e) => { const f = e.target.files[0]; $('#photoName').textContent = f ? `Photo ajoutée : ${f.name}` : 'Elle aide à venir avec la bonne pièce.'; });
  $('#back').addEventListener('click', () => { s.step = Math.max(0, s.step - 1); show(); $('.step:not([hidden]) legend').scrollIntoView({ block: 'nearest' }); });
  $('#est').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid()) return;
    if (s.step < 3) { s.step += 1; show(); const first = $('.step:not([hidden]) button, .step:not([hidden]) input'); if (first) first.focus(); return; }
    const nm = $('#nm'), tel = $('#tel'), msg = $('#bookMsg');
    const okN = nm.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(tel.value.trim());
    nm.setAttribute('aria-invalid', String(!okN)); tel.setAttribute('aria-invalid', String(!okT));
    if (!okN || !okT) { msg.className = 'form-msg err'; msg.textContent = !okN ? 'Indiquez votre nom.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okN ? nm : tel).focus(); return; }
    $$('.step').forEach((f) => { f.hidden = true; }); $('#nav').hidden = true;
    $$('#steps li').forEach((li) => { li.classList.remove('is-on'); li.classList.add('is-done'); });
    $('#doneT').textContent = s.when === 'now' ? `Un plombier part, ${s.slot.toLowerCase()}` : `C'est réservé : ${s.slot.toLowerCase()}`;
    $('#doneTxt').textContent = `Merci ${nm.value.trim()}. Un SMS confirme le créneau et vous prévient quand le plombier est en route, avec son prénom. Coupez l’arrivée d’eau si ça fuit encore. (Démonstration : aucune demande envoyée.)`;
    $('#done').hidden = false; $('#restart').focus();
  });
  $('#restart').addEventListener('click', () => {
    Object.assign(s, { step: 0, prob: null, when: null, cp: '', slot: null });
    $('#cp').value = ''; $('#cpMsg').textContent = ''; $('#nm').value = ''; $('#tel').value = ''; $('#bookMsg').textContent = '';
    $('#done').hidden = true; $('#nav').hidden = false;
    renderProbs(); renderWhen(); show(); $('#probs button').focus();
  });

  /* ---------- Contrat d'entretien ---------- */
  const KINDS = [{ n: 'Chaudière gaz', p: 129 }, { n: 'Pompe à chaleur', p: 159 }, { n: 'Chauffe-eau thermodynamique', p: 99 }];
  let kind = 0;
  function renderKinds() {
    $('#kinds').innerHTML = KINDS.map((k, i) => `<button type="button" role="radio" aria-checked="${i === kind}" data-kind="${i}">${k.n}</button>`).join('');
    $('.care-price b').textContent = euro(KINDS[kind].p);
  }
  $('#kinds').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (b) { kind = +b.dataset.kind; renderKinds(); $(`[data-kind="${kind}"]`).focus(); } });
  $('#careGo').addEventListener('click', () => {
    const v = $('#careMail').value.trim(), m = $('#careMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { m.className = 'form-msg err'; m.textContent = 'Entrez une adresse e-mail valide, par exemple nom@domaine.fr.'; $('#careMail').focus(); return; }
    m.className = 'form-msg ok';
    m.textContent = `C'est noté : le lien de paiement (${euro(KINDS[kind].p)}) et les dates de visite arrivent par e-mail (démonstration).`;
  });

  /* ---------- Barre mobile : masquée pendant l'estimation ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => $('#mBar').classList.toggle('is-off', e.isIntersecting), { threshold: 0.25 }).observe($('#estimer'));
  }

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Lefort Plomberie', accent: 'B4532A' };
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
    document.title = `${st.nom} · Plombier chauffagiste`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#0F1D2B');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Lefort Plomberie rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  renderProbs(); renderWhen(); renderKinds(); show();
  apply(false);
})();

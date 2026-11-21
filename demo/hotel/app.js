/* Démo hôtel · BuildWebAI
   Réservation directe (dates → chambres disponibles → coordonnées → confirmation), conciergerie IA (démo),
   panneau « Personnaliser » (?nom=…&lieu=…&accent=2E4A45&fond=pierre|blanc|sable|nuit ; &presentation=1). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Math.round(n).toLocaleString('fr-FR').replace(/\s/g, ' ')} €`;
  const iso = (d) => d.toISOString().slice(0, 10);
  const fmt = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });

  const ROOMS = {
    classique: { name: 'Classique', meta: 'Vue jardin · 22 m²', price: 165, max: 2 },
    superieure: { name: 'Supérieure vue lac', meta: 'Balcon sur le lac · 28 m²', price: 215, max: 2 },
    suite: { name: 'Suite Belvédère', meta: 'Salon, terrasse · 45 m²', price: 340, max: 4 },
  };

  /* ---------- Dates par défaut : dans une semaine, 2 nuits ---------- */
  const bkIn = $('#bkIn'), bkOut = $('#bkOut'), bkGuests = $('#bkGuests');
  const today = new Date();
  bkIn.min = iso(today);
  bkIn.value = iso(new Date(Date.now() + 7 * 864e5));
  bkOut.value = iso(new Date(Date.now() + 9 * 864e5));
  bkIn.addEventListener('change', () => {
    bkOut.min = iso(new Date(new Date(bkIn.value).getTime() + 864e5));
    if (bkOut.value <= bkIn.value) bkOut.value = bkOut.min;
  });

  /* ---------- Fenêtre de réservation ---------- */
  const dlg = $('#dlg');
  const state = { room: null };
  const nights = () => Math.max(1, Math.round((new Date(bkOut.value) - new Date(bkIn.value)) / 864e5));
  function show(step) {
    ['stepRooms', 'stepGuest', 'stepDone'].forEach((id) => { $(`#${id}`).hidden = id !== step; });
  }
  function openRooms(highlight) {
    if (!bkIn.value || !bkOut.value || bkOut.value <= bkIn.value) { $('#bkErr').hidden = false; bkOut.focus(); return; }
    $('#bkErr').hidden = true;
    const n = nights(), g = +bkGuests.value;
    $('#dlgDates').textContent = `Du ${fmt(bkIn.value)} au ${fmt(bkOut.value)} · ${n} nuit${n > 1 ? 's' : ''} · ${bkGuests.selectedOptions[0].textContent}`;
    const list = Object.entries(ROOMS).filter(([, r]) => r.max >= g);
    $('#avail').innerHTML = list.map(([k, r]) => `<li${k === highlight ? ' class="is-hl"' : ''}><b>${r.name}</b><button type="button" class="btn btn--accent" data-pick="${k}">${euro(r.price * n)}</button><small>${r.meta} · ${euro(r.price)} la nuit, petit-déjeuner inclus</small></li>`).join('')
      || '<li><small>Aucune chambre pour ce nombre de voyageurs : contactez la réception.</small></li>';
    show('stepRooms');
    if (!dlg.open) dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
  }
  $('#reserver').addEventListener('submit', (e) => { e.preventDefault(); openRooms(); });
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRooms(b.dataset.room)));
  $('#avail').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    state.room = b.dataset.pick;
    const r = ROOMS[state.room], n = nights();
    $('#dlgRecap').textContent = `${r.name} · ${n} nuit${n > 1 ? 's' : ''} · ${euro(r.price * n)}, petit-déjeuner inclus`;
    show('stepGuest');
    $('#gName').focus();
  });
  $('#backRooms').addEventListener('click', () => show('stepRooms'));
  $('#stepGuest').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#gName').value.trim(), mail = $('#gMail').value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { $('#gErr').hidden = false; (name ? $('#gMail') : $('#gName')).focus(); return; }
    $('#gErr').hidden = true;
    const r = ROOMS[state.room], n = nights();
    $('#doneTxt').textContent = `${name}, votre chambre ${r.name} vous attend du ${fmt(bkIn.value)} au ${fmt(bkOut.value)} (${euro(r.price * n)}). La confirmation part à ${mail}.`;
    show('stepDone');
  });
  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $$('[data-open-table]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); setBot(true); ask('Je voudrais réserver une table pour le dîner.', 'table'); }));

  /* ---------- Conciergerie IA (réponses de démonstration) ---------- */
  const botBtn = $('#botBtn'), bot = $('#bot'), log = $('#botLog');
  const ANSWERS = {
    arrivee: 'Les chambres sont prêtes dès 15 h. Si vous arrivez plus tôt, nous gardons vos bagages et la piscine vous est ouverte.',
    parking: 'Un parking privé et gratuit de 18 places se trouve derrière la maison, avec deux bornes de recharge électrique.',
    chien: 'Les chiens sont les bienvenus dans les chambres Classique, avec un supplément de 20 € par nuit.',
    table: 'Avec plaisir. Le restaurant sert de 19 h à 21 h 30. Pour combien de personnes, et quel soir ?',
  };
  const say = (text, who) => {
    const li = document.createElement('li');
    li.className = `msg msg--${who}`;
    li.textContent = text;
    log.append(li);
    log.scrollTop = log.scrollHeight;
  };
  function ask(q, key) { say(q, 'me'); setTimeout(() => say(ANSWERS[key] || 'Démonstration : sur votre site, la conciergerie répond à partir de vos vraies informations et peut réserver une chambre ou une table.', 'bot'), 500); }
  function setBot(open) {
    bot.hidden = !open;
    botBtn.setAttribute('aria-expanded', String(open));
    botBtn.setAttribute('aria-label', open ? 'Fermer la conciergerie' : 'Ouvrir la conciergerie');
    if (open) $('#botInput').focus();
  }
  botBtn.addEventListener('click', () => setBot(bot.hidden));
  $('#botClose').addEventListener('click', () => { setBot(false); botBtn.focus(); });
  $$('[data-q]', bot).forEach((b) => b.addEventListener('click', () => ask(b.textContent, b.dataset.q)));
  $('#botForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#botInput');
    if (!input.value.trim()) return;
    ask(input.value.trim());
    input.value = '';
  });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Maison Sauvelune', lieu: "Lac d'Annecy", accent: '2E4A45', fond: 'pierre' };
  const FONDS = ['pierre', 'blanc', 'sable', 'nuit'];
  const p = new URLSearchParams(location.search);
  const st = {
    nom: (p.get('nom') || DEF.nom).slice(0, 32),
    lieu: (p.get('lieu') || DEF.lieu).slice(0, 32),
    accent: /^[0-9a-f]{6}$/i.test(p.get('accent') || '') ? p.get('accent').toUpperCase() : DEF.accent,
    fond: FONDS.includes(p.get('fond')) ? p.get('fond') : DEF.fond,
  };
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
    $$('[data-bind="lieu"]').forEach((el) => { el.textContent = st.lieu; });
    document.title = `${st.nom} · Hôtel, ${st.lieu}`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#1C2422');
    if (st.fond === 'pierre') root.removeAttribute('data-fond'); else root.dataset.fond = st.fond;
    $('#czNom').value = st.nom; $('#czLieu').value = st.lieu; $('#czAccent').value = `#${st.accent}`;
    $$('[data-fond]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fond === st.fond)));
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (open) => { cz.hidden = !open; czBtn.setAttribute('aria-expanded', String(open)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czLieu').addEventListener('input', (e) => { st.lieu = e.target.value.trim() || DEF.lieu; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $$('[data-fond]').forEach((b) => b.addEventListener('click', () => { st.fond = b.dataset.fond; apply(); }));
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Maison Sauvelune rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!bot.hidden) { setBot(false); botBtn.focus(); }
    if (!cz.hidden) { setCz(false); czBtn.focus(); }
  });

  /* ---------- Bouton Réserver mobile : caché tant que le formulaire du hero est visible ---------- */
  const mBook = $('.m-book');
  if (mBook && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => mBook.classList.toggle('is-off', e.isIntersecting)).observe($('#reserver'));
  }

  apply(false);
})();

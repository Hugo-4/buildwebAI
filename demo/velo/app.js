/* Démo atelier vélo · BuildWebAI
   État de l'atelier en direct (délai, places), diagnostic en ligne → prix, durée et mode (express ou dépôt),
   rendez-vous avec capacité par jour, suivi avec devis validé par SMS et relance des vélos non récupérés,
   tarifs, pass entretien annuel et offre d'hiver, assistant IA (réponses simulées) pour les questions du téléphone,
   panneau « Personnaliser » (?nom=…&accent=C98A12 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;
  const now = new Date();
  const H = now.getHours() + now.getMinutes() / 60;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const later = (fn, ms) => setTimeout(fn, reduce ? 0 : ms);
  const st = { nom: 'Atelier Rayon' };
  const fdate = (d, o = { weekday: 'long', day: 'numeric', month: 'long' }) => d.toLocaleDateString('fr-FR', o);

  /* ---------- Jours d'ouverture et capacité de dépôt ---------- */
  const OPEN = (d) => d.getDay() >= 2 && d.getDay() <= 6; // mardi → samedi
  const DAYS = [];
  for (let i = 1; DAYS.length < 6 && i < 14; i++) { const d = new Date(now); d.setDate(now.getDate() + i); if (OPEN(d)) DAYS.push(d); }
  const CAP = 6;
  const taken = (i) => [6, 5, 4, 3, 2, 1][(DAYS[i].getDate() + i * 2) % 6];
  const addOpen = (d, n) => { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (OPEN(x)) n--; } return x; };
  const firstFree = DAYS.findIndex((_, i) => taken(i) < CAP);
  const weekFree = DAYS.slice(0, 4).reduce((a, _, i) => a + (CAP - taken(i)), 0);
  $('#stDelay').textContent = `${Math.max(1, Math.round((addOpen(DAYS[Math.max(0, firstFree)], 2) - now) / 864e5))} jours`;
  $('#stFree').textContent = `${weekFree} place${weekFree > 1 ? 's' : ''}`;

  /* ---------- Diagnostic ---------- */
  const TYPES = [['ville', 'Ville'], ['route', 'Route'], ['vtt', 'VTT'], ['vae', 'Électrique'], ['cargo', 'Cargo'], ['enfant', 'Enfant']];
  const SYMS = [
    { id: 'crevaison', n: 'Crevaison', fix: 'Réparation de crevaison, chambre à air comprise', min: 23, max: 23, dur: 20, express: true },
    { id: 'freins', n: 'Freins faibles ou qui couinent', fix: 'Réglage des freins, plaquettes si besoin', min: 15, max: 35, dur: 20, express: true },
    { id: 'vitesses', n: 'Les vitesses sautent', fix: 'Réglage des vitesses', min: 20, max: 20, dur: 25, express: true },
    { id: 'chaine', n: 'Chaîne qui grince ou déraille', fix: 'Changement de chaîne, chaîne comprise', min: 35, max: 55, dur: 25 },
    { id: 'voile', n: 'Roue voilée', fix: 'Dévoilage de la roue', min: 20, max: 20, dur: 30 },
    { id: 'direction', n: 'Jeu dans la direction', fix: 'Réglage du jeu de direction', min: 15, max: 15, dur: 15, express: true },
    { id: 'assist', n: 'L’assistance se coupe', fix: 'Diagnostic électrique et mise à jour du moteur', min: 39, max: 39, dur: 45, vae: true },
    { id: 'batterie', n: 'La batterie se vide vite', fix: 'Test de capacité de la batterie', min: 25, max: 25, dur: 30, vae: true },
    { id: 'revision', n: 'Révision complète', fix: 'Révision complète (réglages, serrages, nettoyage)', min: 89, max: 89, dur: 90 },
  ];
  const dg = { type: 'ville', syms: new Set() };
  function renderDiag() {
    $('#types').innerHTML = TYPES.map(([id, n]) => `<button type="button" role="radio" aria-checked="${dg.type === id}" data-type="${id}">${n}</button>`).join('');
    const list = SYMS.filter((s) => !s.vae || dg.type === 'vae');
    [...dg.syms].forEach((id) => { if (!list.find((s) => s.id === id)) dg.syms.delete(id); });
    $('#syms').innerHTML = list.map((s) => `<button type="button" aria-pressed="${dg.syms.has(s.id)}" data-sym="${s.id}">${s.n}</button>`).join('');
    const sel = list.filter((s) => dg.syms.has(s.id));
    const r = $('#result');
    if (!sel.length) { r.hidden = true; return; }
    const vaeRev = dg.type === 'vae' ? 10 : 0;
    const cargo = dg.type === 'cargo' ? 10 : 0;
    const lines = sel.map((s) => [s.fix, s.min + (s.id === 'revision' ? vaeRev : 0), s.max + (s.id === 'revision' ? vaeRev : 0)]);
    if (cargo) lines.push(['Manutention vélo cargo', cargo, cargo]);
    const lo = lines.reduce((a, l) => a + l[1], 0), hi = lines.reduce((a, l) => a + l[2], 0);
    const dur = sel.reduce((a, s) => a + s.dur, 0);
    const express = sel.every((s) => s.express) && dur <= 40 && dg.type !== 'cargo';
    r.hidden = false;
    r.innerHTML = `<p class="r-t">${express ? `En express : réparé pendant que vous attendez, environ ${dur} min` : `En dépôt : prêt en 48 h environ`}</p>
      <ul class="r-lines">${lines.map(([n, a, b]) => `<li><span>${n}</span><b>${a === b ? euro(a) : `${euro(a)} à ${euro(b)}`}</b></li>`).join('')}</ul>
      <p class="r-sum"><span>Estimation</span><span>${lo === hi ? euro(lo) : `${euro(lo)} à ${euro(hi)}`}</span></p>
      <p class="muted small">Prix confirmé après un coup d'œil du mécanicien. Rien n'est posé sans votre accord.</p>
      <button type="button" class="btn btn--accent" data-go="${express ? 'express' : 'depot'}">${express ? 'Réserver un créneau express' : 'Réserver une place en dépôt'}</button>`;
  }
  $('#types').addEventListener('click', (e) => { const b = e.target.closest('[data-type]'); if (b) { dg.type = b.dataset.type; renderDiag(); $(`[data-type="${dg.type}"]`).focus(); } });
  $('#syms').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sym]');
    if (!b) return;
    const id = b.dataset.sym;
    if (dg.syms.has(id)) dg.syms.delete(id); else dg.syms.add(id);
    renderDiag(); $(`[data-sym="${id}"]`).focus();
  });
  $('#result').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) goRdv(b.dataset.go); });
  $('#photo').addEventListener('change', (e) => { const f = e.target.files[0]; $('#photoName').textContent = f ? `Photo jointe : ${f.name}` : 'Le dérailleur, le pneu, l’écran du vélo électrique…'; });

  /* ---------- Rendez-vous ---------- */
  const MODES = [{ id: 'express', n: 'Express', d: '30 min, vous attendez sur place' }, { id: 'depot', n: 'Dépôt atelier', d: 'On vous rend le vélo à la date annoncée' }];
  const TIMES = ['9 h 30', '10 h', '11 h', '14 h 30', '15 h 30', '17 h 30', '18 h'];
  const rdv = { mode: 'express', day: 0, time: null };
  const tFull = (d, i) => ((d * 5 + i * 3 + DAYS[d].getDate()) % 4) === 0;
  function renderRdv() {
    $('#modes').innerHTML = MODES.map((m) => `<button type="button" role="radio" aria-checked="${rdv.mode === m.id}" data-mode="${m.id}"><b>${m.n}</b><span>${m.d}</span></button>`).join('');
    const dep = rdv.mode === 'depot';
    if (dep && taken(rdv.day) >= CAP) rdv.day = Math.max(0, firstFree);
    $('#days').innerHTML = DAYS.map((d, i) => {
      const left = CAP - taken(i);
      const off = dep && left <= 0;
      return `<button type="button" role="radio" aria-checked="${i === rdv.day}" data-day="${i}" ${off ? 'disabled' : ''}><b>${fdate(d, { weekday: 'short', day: 'numeric' }).replace('.', '')}</b>${dep ? `<span class="cap"><i style="transform:scaleX(${taken(i) / CAP})"></i></span><small>${left > 0 ? `${left} place${left > 1 ? 's' : ''}` : 'complet'}</small>` : ''}</button>`;
    }).join('');
    $('#timeBox').hidden = dep;
    if (!dep) {
      if (!rdv.time || tFull(rdv.day, TIMES.indexOf(rdv.time))) rdv.time = TIMES.find((t, i) => !tFull(rdv.day, i));
      $('#times').innerHTML = TIMES.map((t, i) => `<button type="button" role="radio" aria-checked="${t === rdv.time}" data-time="${t}" ${tFull(rdv.day, i) ? 'disabled' : ''}>${t}</button>`).join('');
    }
    const back = addOpen(DAYS[rdv.day], 2);
    $('#rdvNote').textContent = dep
      ? `Dépôt entre 9 h et 10 h 30. Prêt ${fdate(back)} dès 17 h. Garde gratuite 7 jours après l'appel, puis 2 € par jour.`
      : 'Crevaison, freins, vitesses, direction : le vélo repart avec vous.';
  }
  $('#modes').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) { rdv.mode = b.dataset.mode; renderRdv(); $(`[data-mode="${rdv.mode}"]`).focus(); } });
  $('#days').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b && !b.disabled) { rdv.day = +b.dataset.day; renderRdv(); $(`[data-day="${rdv.day}"]`).focus(); } });
  $('#times').addEventListener('click', (e) => { const b = e.target.closest('[data-time]'); if (b && !b.disabled) { rdv.time = b.dataset.time; renderRdv(); } });
  function goRdv(mode) {
    rdv.mode = mode; renderRdv();
    $('#rdv').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    later(() => $(`[data-mode="${mode}"]`).focus({ preventScroll: true }), 450);
  }
  $('#rdvForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nm = $('#nm'), tel = $('#tel'), msg = $('#rdvMsg');
    const okN = nm.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(tel.value.trim());
    nm.setAttribute('aria-invalid', String(!okN)); tel.setAttribute('aria-invalid', String(!okT));
    if (!okN || !okT) { msg.className = 'form-msg err'; msg.textContent = !okN ? 'Indiquez votre nom.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okN ? nm : tel).focus(); return; }
    const d = fdate(DAYS[rdv.day]);
    const dep = rdv.mode === 'depot';
    msg.className = 'form-msg ok';
    msg.textContent = dep ? `C'est noté, ${nm.value.trim()} : dépôt ${d}, entre 9 h et 10 h 30.` : `C'est noté, ${nm.value.trim()} : express ${d} à ${rdv.time}.`;
    const box = $('#rdvSms'); box.hidden = false;
    box.innerHTML = dep
      ? `<small>SMS le jour du dépôt</small>${st.nom} : votre vélo est bien arrivé. Il sera prêt ${fdate(addOpen(DAYS[rdv.day], 2))} dès 17 h, on vous écrit dès que c'est fait.`
      : `<small>SMS la veille</small>${st.nom} : rappel de votre créneau express demain à ${rdv.time}. Répondez OUI pour confirmer ou NON pour le libérer.`;
  });

  /* ---------- Suivi, devis, vélo non récupéré ---------- */
  const STEPS = ['Déposé', 'Diagnostiqué', 'Devis envoyé', 'En réparation', 'Prêt', 'Récupéré'];
  const T = ['mar. 9 h 40', '11 h 05', '11 h 10', '', '', ''];
  const QUOTE = [['Dérailleur arrière Shimano Deore 10 vitesses', 54], ['Câble et gaine', 9], ['Main-d’œuvre', 20]];
  const total = QUOTE.reduce((a, [, p]) => a + p, 0);
  let step = 2, refused = false;
  const sms = [];
  const push = (t, l) => { sms.push({ t, l }); $('#smsList').innerHTML = sms.map((m) => `<li><small>${m.l}</small>${m.t}</li>`).join(''); };
  function renderTrack() {
    $('#steps').innerHTML = STEPS.map((s, i) => `<li class="${i < step ? 'is-done' : i === step ? 'is-now' : ''}"><span>${refused && i === 3 ? 'Remonté sans la pièce' : s}</span><time>${T[i]}</time></li>`).join('');
    const q = $('#quote');
    if (step === 2) q.innerHTML = `<p class="q-t">Devis D-318</p><ul class="q-lines">${QUOTE.map(([n, p]) => `<li><span>${n}</span><span>${euro(p)}</span></li>`).join('')}</ul><p class="q-total"><span>Total TTC</span><span>${euro(total)}</span></p>
      <div class="q-actions"><button type="button" class="btn btn--accent btn--sm" data-q="ok">Accepter</button><button type="button" class="btn btn--line btn--sm" data-q="no">Refuser</button><button type="button" class="btn btn--line btn--sm" data-q="ask">Une question</button></div>
      <p class="q-note">Sans réponse sous 48 h, une relance part par SMS.</p>`;
    else if (step === 3) q.innerHTML = '<p class="q-t">Pièce commandée</p><p class="q-note">Elle arrive demain à 10 h chez notre fournisseur. Montage dans la foulée.</p>';
    else if (step === 4) q.innerHTML = `<p class="q-t">${refused ? 'Vélo à récupérer' : 'Prêt à partir'}</p><p class="q-note">${refused ? 'Dérailleur réglé au mieux, sans supplément.' : 'Paiement sur place ou par lien.'} Garde gratuite 7 jours.</p>`;
    else if (step === 5) q.innerHTML = '<p class="q-t">Récupéré, merci !</p><button type="button" class="btn btn--line btn--sm" data-q="reset">Rejouer la démo</button>';
  }
  function startTrack() {
    sms.length = 0; step = 2; refused = false; T[3] = T[4] = T[5] = '';
    push(`${st.nom} : votre VTT est bien déposé (ticket V-318). On vous écrit après le diagnostic.`, 'mar. 9 h 40');
    push(`Le dérailleur arrière est tordu. Photo et devis (${euro(total)}) : rayon.example/d/318`, '11 h 10');
    renderTrack();
  }
  function ready() {
    step = 4; T[4] = 'mer. 16 h 20'; renderTrack();
    push(`Votre VTT est prêt ! L'atelier est ouvert jusqu'à 19 h.`, 'mer. 16 h 20');
    later(() => {
      push('Petit rappel : votre vélo vous attend. Garde gratuite jusqu’à mercredi prochain, ensuite 2 € par jour.', 'sam. 10 h');
      later(() => {
        step = 5; T[5] = 'sam. 15 h'; renderTrack();
        push(`Merci d'être passé ! Un avis Google aide beaucoup un petit atelier, 30 secondes : <a href="#suivi">laisser un avis</a>`, 'sam. 15 h 05');
        const b = $('#quote button'); if (b) b.focus();
      }, 1100);
    }, 1100);
  }
  $('#quote').addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const a = b.dataset.q;
    if (a === 'reset') { startTrack(); $('#quote button').focus(); return; }
    if (a === 'ask') { push('Question transmise : Malo vous rappelle avant 18 h.', 'à l’instant'); return; }
    if (a === 'no') { refused = true; step = 3; T[3] = '11 h 30'; renderTrack(); push('C’est noté : on règle le dérailleur au mieux, sans supplément.', '11 h 30'); later(ready, 1200); return; }
    step = 3; T[3] = '11 h 24'; renderTrack();
    push('Merci, devis accepté. La pièce arrive demain matin.', '11 h 24');
    later(ready, 1400);
  });

  /* ---------- Tarifs ---------- */
  const PRICES = [
    ['Réparation de crevaison', 'Chambre à air comprise, 26 à 29 pouces et 700', '20 min', 23],
    ['Réglage des freins', 'Plaquettes en plus si usées', '15 min', 15],
    ['Réglage des vitesses', '', '20 min', 20],
    ['Changement de chaîne', 'Chaîne en plus, de 15 à 35 €', '20 min', 20],
    ['Dévoilage de roue', '', '30 min', 20],
    ['Révision essentielle', 'Réglages, serrages, pression, graissage', '45 min', 49],
    ['Révision complète', 'Essentielle, plus nettoyage de la transmission et contrôle des roulements', '1 h 30', 89],
    ['Révision vélo électrique', 'Révision complète, diagnostic et mise à jour du moteur', '1 h 45', 99],
    ['Diagnostic électrique seul', 'Déduit si vous faites la réparation', '30 min', 39],
  ];
  $('#ptable').innerHTML = PRICES.map(([n, d, t, p]) => `<tr><th scope="row">${n}${d ? `<small>${d}</small>` : ''}</th><td class="dur">${t}</td><td>${euro(p)}</td></tr>`).join('');

  /* ---------- Pass entretien et hiver ---------- */
  const m = now.getMonth();
  $('#winter').textContent = (m >= 10 || m <= 1)
    ? 'Cet hiver, l’atelier a de la place : révisions à −20 % jusqu’à fin février.'
    : 'En janvier et février, les révisions sont à −20 % : c’est le moment où l’atelier a de la place.';
  $('#passForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#passMail').value.trim(), msg = $('#passMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.className = 'form-msg err'; msg.textContent = 'Entrez une adresse e-mail valide, par exemple nom@domaine.fr.'; $('#passMail').focus(); return; }
    msg.className = 'form-msg';
    msg.textContent = 'C’est noté : le lien de paiement (79 €) arrive par e-mail, et un SMS vous rappellera la révision de printemps (démonstration).';
  });

  /* ---------- Assistant (réponses simulées) ---------- */
  const isOpen = OPEN(now) && ((H >= 9 && H < 12.5) || (H >= 14 && H < 19));
  const QUICK = ['Vous êtes ouverts ?', 'Mon vélo est-il prêt ?', 'Prix d’une révision', 'Chambre à air en stock ?', 'Vélos électriques ?', 'Parler à un mécanicien'];
  let waitPhone = false, waitTicket = false;
  function answer(q) {
    const t = q.toLowerCase();
    if (waitPhone && /(\+33\s?|0)[1-9](\s?\d{2}){4}/.test(q)) { waitPhone = false; return 'Merci, c’est transmis : un mécanicien vous rappelle aujourd’hui avant 18 h.'; }
    if (/v-?\s?\d{2,}/i.test(q) || (waitTicket && /\d{2,}/.test(q))) { waitTicket = false; return 'Ticket V-318 : la pièce est arrivée, le montage est en cours. Prêt aujourd’hui vers 17 h, on vous envoie un SMS.'; }
    if (/ouvert|horaire|heure|ferm/.test(t)) return `${isOpen ? 'Oui, l’atelier est ouvert en ce moment.' : 'L’atelier est fermé en ce moment.'} Horaires : du mardi au samedi, 9 h – 12 h 30 et 14 h – 19 h.`;
    if (/prêt|pret|fini|récup|recup|ticket/.test(t)) { waitTicket = true; return 'Je regarde ! Quel est votre numéro de ticket ? Il commence par V-, par exemple V-318.'; }
    if (/prix|tarif|combien|révision|revision|coût|cout/.test(t)) return 'Révision essentielle 49 €, complète 89 €, vélo électrique 99 €. Le détail est dans <a href="#tarifs" data-close>les tarifs</a>, et le <a href="#diag" data-close>diagnostic en ligne</a> donne un prix pour votre panne.';
    if (/chambre|pneu|crev|stock/.test(t)) return 'Oui : chambres à air en 700 × 25 à 32, 26, 27,5 et 29 pouces, 20 et 24 pouces enfant. 8 € la chambre, ou 23 € posée en 20 minutes avec un <a href="#rdv" data-close>créneau express</a>.';
    if (/électrique|electrique|vae|batterie|bosch|shimano|bafang|moteur/.test(t)) return 'Oui, nous réparons les vélos électriques Bosch, Shimano et Bafang : diagnostic 39 € (déduit des travaux), révision complète 99 €.';
    if (/humain|mécanicien|mecanicien|appel|parler|quelqu/.test(t)) { waitPhone = true; return 'Je transmets à Léa ou Malo. Quel est votre numéro ? Ils vous rappellent dans la journée.'; }
    if (/bonjour|salut|hello/.test(t)) return 'Bonjour ! Posez-moi votre question : horaires, prix, pièces en stock, suivi de votre vélo…';
    waitPhone = true;
    return 'Je préfère ne pas vous répondre au hasard. Laissez votre numéro : un mécanicien vous répond par SMS dans la journée.';
  }
  const log = $('#chatLog');
  const say = (html, me) => { const li = document.createElement('li'); if (me) { li.className = 'me'; li.textContent = html; } else li.innerHTML = html; log.appendChild(li); log.scrollTop = log.scrollHeight; };
  function ask(q) {
    if (!q.trim()) return;
    say(q, true);
    later(() => say(answer(q)), 450);
  }
  $('#chatQuick').innerHTML = QUICK.map((q) => `<button type="button">${q}</button>`).join('');
  $('#chatQuick').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
  $('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); ask($('#chatIn').value); $('#chatIn').value = ''; });
  let chatFrom = null;
  function openChat() {
    chatFrom = document.activeElement;
    $('#chat').hidden = false; $('#chatBtn').setAttribute('aria-expanded', 'true'); $('#mBar').classList.add('is-off');
    if (!log.children.length) say(`Bonjour ! Je suis l'assistant en ligne de ${st.nom}. Je réponds tout de suite aux questions courantes : horaires, prix, pièces en stock, suivi de votre vélo.`);
    $('#chatIn').focus();
  }
  function closeChat() {
    $('#chat').hidden = true; $('#chatBtn').setAttribute('aria-expanded', 'false'); $('#mBar').classList.remove('is-off');
    if (chatFrom && document.contains(chatFrom)) chatFrom.focus();
  }
  $$('[data-chat]').forEach((b) => b.addEventListener('click', openChat));
  $('#chatClose').addEventListener('click', closeChat);
  log.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) { chatFrom = null; closeChat(); } });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Atelier Rayon', accent: 'C98A12' };
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
  function apply(pushUrl = true) {
    $$('[data-bind="nom"]').forEach((el) => { el.textContent = st.nom; });
    document.title = `${st.nom} · Réparation de vélos`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#1A1F1B');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (pushUrl) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); startTrack(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); startTrack(); $('#czStatus').textContent = 'Version Atelier Rayon rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#chat').hidden) closeChat();
    else if (!cz.hidden) { setCz(false); czBtn.focus(); }
  });

  apply(false);
  renderDiag(); renderRdv(); startTrack();
})();

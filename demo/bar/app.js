/* Démo bar classique · BuildWebAI
   Ouvert/fermé et happy hour selon l'heure, ardoise du jour, carte par rubriques (prix happy hour barrés),
   Click & Collect (plats, planches, bouteilles et packs ; confirmation de majorité si alcool), agenda de la semaine,
   réservation de table et privatisation, panneau « Personnaliser » (?nom=…&wall=13221B&accent=C9A050 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} €`;
  const now = new Date();
  const H = now.getHours() + now.getMinutes() / 60;
  const wd = now.getDay();
  const fdate = (d, o = { weekday: 'long', day: 'numeric', month: 'long' }) => d.toLocaleDateString('fr-FR', o);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const OPEN_DAY = (d) => d >= 2 && d <= 6; // mardi → samedi, 16 h – 1 h
  const st = { nom: 'Le Sémaphore' };

  /* ---------- Ouvert, happy hour ---------- */
  const lateNight = H < 1 && OPEN_DAY((wd + 6) % 7);
  const isOpen = (OPEN_DAY(wd) && H >= 16) || lateNight;
  const hhOn = OPEN_DAY(wd) && H >= 17 && H < 20;
  const nextOpen = () => { for (let i = 0; i < 8; i++) { const d = new Date(now); d.setDate(now.getDate() + i); if (OPEN_DAY(d.getDay()) && (i > 0 || H < 16)) return [d, i]; } return [now, 0]; };
  const [nod, noi] = nextOpen();
  $('#openTxt').textContent = isOpen
    ? (H >= 22.5 || lateNight ? 'Ouvert jusqu’à 1 h · cuisine fermée' : 'Ouvert jusqu’à 1 h · cuisine jusqu’à 22 h 30')
    : noi === 0 ? 'Ouvre aujourd’hui à 16 h' : `Fermé · ouvre ${noi === 1 ? 'demain' : fdate(nod, { weekday: 'long' })} à 16 h`;
  $('#open').classList.toggle('is-closed', !isOpen);
  $('#hhNow').textContent = hhOn ? `C'est maintenant, jusqu'à 20 h.` : OPEN_DAY(wd) && H < 17 ? 'Aujourd’hui à partir de 17 h.' : '';

  /* ---------- Ardoise du jour ---------- */
  const PLATS = {
    2: ['Andouillette de Lyon, sauce moutarde', 'Frites maison ou salade', 16],
    3: ['Bavette à l’échalote', 'Frites maison', 17],
    4: ['Quenelle de brochet, sauce Nantua', 'Riz pilaf', 16],
    5: ['Fish and chips du comptoir', 'Cabillaud en tempura, sauce tartare', 15],
    6: ['Tartare de bœuf au couteau', 'Frites maison, salade', 18],
  };
  const slateDay = OPEN_DAY(wd) ? now : nod;
  const plat = PLATS[slateDay.getDay()];
  $('#slateDay').textContent = OPEN_DAY(wd) ? cap(fdate(now)) : `Fermé aujourd'hui · l'ardoise de ${fdate(nod, { weekday: 'long' })}`;
  $('#slate').innerHTML = [[plat[0], plat[1], plat[2]], ['Tarte aux pralines', 'La recette de la maison', 7], ['Le vin du moment : Brouilly 2023', 'Le verre', 6]]
    .map(([n, d, p]) => `<li><span>${n}<small>${d}</small></span><b>${euro(p)}</b></li>`).join('');

  /* ---------- Carte ---------- */
  const TABS = [['grignoter', 'À grignoter'], ['plats', 'Plats'], ['cocktails', 'Cocktails'], ['bieres', 'Bières'], ['vins', 'Vins'], ['sans', 'Sans alcool']];
  const MENU = {
    grignoter: [
      { id: 'planche', n: 'Planche mixte', d: 'Rosette, jambon cru, comté 18 mois, saint-marcellin, cornichons', p: 19, go: true },
      { id: 'charcut', n: 'Planche de charcuterie', d: 'De la maison Sibilia, aux Halles', p: 15, go: true },
      { id: 'croque', n: 'Croque-monsieur au comté', d: 'Pain de campagne, jambon blanc, béchamel', p: 11, go: true },
      { id: 'frites', n: 'Frites maison', d: 'Double cuisson, sel fumé', p: 5, go: true },
      { id: 'jb', n: 'Jambon-beurre du comptoir', d: 'Baguette tradition, beurre demi-sel', p: 7, go: true },
      { id: 'gougeres', n: 'Gougères tièdes', d: 'Les six', p: 6, go: true },
    ],
    plats: [
      { id: 'pdj', n: `Le plat du jour : ${plat[0].toLowerCase()}`, d: plat[1], p: plat[2], go: true },
      { id: 'burger', n: 'Burger du comptoir', d: 'Bœuf de l’Aubrac, cheddar affiné, oignons confits, frites', p: 18, go: true },
      { id: 'lyonnaise', n: 'Salade lyonnaise', d: 'Frisée, lardons, croûtons, œuf poché', p: 15, go: true },
      { id: 'madame', n: 'Croque-madame', d: 'Le croque-monsieur et son œuf au plat, salade', p: 13, go: true },
    ],
    cocktails: [
      { id: 'oldf', n: 'Old Fashioned', d: 'Bourbon, sucre, angostura, zeste d’orange', p: 11, hh: true },
      { id: 'negroni', n: 'Negroni', d: 'Gin, vermouth rouge, bitter', p: 10, hh: true },
      { id: 'spritz', n: 'Spritz', d: 'Apéritif italien, prosecco, eau gazeuse', p: 9, hh: true },
      { id: 'sour', n: 'Whisky Sour', d: 'Whisky, citron, sucre, blanc d’œuf', p: 11, hh: true },
      { id: 'maison', n: 'Le cocktail de la maison', d: 'Gin, chartreuse verte, citron, sirop de thym', p: 12, hh: true },
    ],
    bieres: [
      { id: 'blonde', n: 'Pression blonde', d: 'La pinte, 50 cl', p: 7.5, hh: true },
      { id: 'blanche', n: 'Pression blanche', d: 'La pinte, 50 cl', p: 8, hh: true },
      { id: 'ipa', n: 'IPA de la brasserie du quartier', d: 'La pinte, 50 cl', p: 8.5, hh: true },
      { id: 'pack4', n: 'Quatre bouteilles de la brasserie du quartier', d: 'Blonde, blanche, IPA, ambrée · 33 cl', p: 14, go: true, alc: true },
    ],
    vins: [
      { id: 'brouilly', n: 'Brouilly 2023', d: 'Le verre 6 € au comptoir · la bouteille à emporter', p: 28, go: true, alc: true },
      { id: 'cdr', n: 'Côtes-du-Rhône 2022', d: 'Le verre 5 € au comptoir · la bouteille à emporter', p: 22, go: true, alc: true },
      { id: 'macon', n: 'Mâcon-Villages blanc 2023', d: 'Le verre 6 € au comptoir · la bouteille à emporter', p: 26, go: true, alc: true },
      { id: 'cremant', n: 'Crémant de Bourgogne', d: 'La coupe, au comptoir', p: 8 },
    ],
    sans: [
      { id: 'limo', n: 'Limonade artisanale', d: 'Citron ou framboise, 33 cl', p: 4.5, go: true },
      { id: 'mock', n: 'Garrigue', d: 'Cocktail sans alcool : thym, citron, tonic', p: 7 },
      { id: 'diabolo', n: 'Diabolo', d: 'Menthe, grenadine ou pêche', p: 4 },
      { id: 'cafe', n: 'Café', d: 'Torréfié à la Croix-Rousse', p: 2.2 },
    ],
  };
  const PACKS = [
    { id: 'p-duo', n: 'L’apéro à deux', d: 'Planche mixte et une bouteille de Brouilly', p: 42, img: 'planche', alc: true },
    { id: 'p-match', n: 'Le pack match', d: 'Quatre bouteilles de bière, deux croques, une grande frite', p: 34, img: 'frites', alc: true },
    { id: 'p-diner', n: 'Le dîner du comptoir', d: 'Croque-monsieur, frites, tarte aux pralines', p: 18, img: 'croque' },
  ];
  const ALL = [...Object.values(MENU).flat(), ...PACKS];
  const cart = {};
  let tab = 'grignoter';
  const tabs = () => $$('#tabs [role="tab"]');
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(([id, n]) => `<button type="button" role="tab" aria-selected="${tab === id}" tabindex="${tab === id ? 0 : -1}" data-tab="${id}">${n}</button>`).join('');
  }
  function renderMenu() {
    $('#menuImg').src = `img/${tab}-800.webp`;
    $('#menuImg').srcset = `img/${tab}-500.webp 500w, img/${tab}-800.webp 800w`;
    $('#menuImg').sizes = '(min-width: 860px) 30vw, 100vw';
    $('#menuList').setAttribute('aria-label', TABS.find(([id]) => id === tab)[1]);
    $('#menuList').innerHTML = MENU[tab].map((it) => {
      const hp = it.hh && hhOn ? it.p - 2 : it.p;
      const q = cart[it.id] || 0;
      return `<div class="item"><p class="item-n">${it.n}${it.go ? ' <span class="tag">À emporter</span>' : ''}</p>
        <p class="item-p">${hp !== it.p ? `<s>${euro(it.p)}</s>` : ''}${euro(hp)}</p>
        <p class="item-d">${it.d}</p>
        ${it.go ? `<span class="item-a"><button type="button" class="add" data-add="${it.id}" data-n="${q}" aria-label="Ajouter ${it.n} à la commande">${q ? `Ajouté · ${q}` : 'Ajouter'}</button></span>` : ''}</div>`;
    }).join('');
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; renderTabs(); renderMenu(); $(`[data-tab="${tab}"]`).focus(); } });
  $('#tabs').addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const i = TABS.findIndex(([id]) => id === tab);
    tab = TABS[(i + d + TABS.length) % TABS.length][0]; renderTabs(); renderMenu(); $(`[data-tab="${tab}"]`).focus();
  });

  /* ---------- Packs, créneaux, panier ---------- */
  $('#packs').innerHTML = PACKS.map((k) => `<article class="pack"><img src="img/${k.img}-400.webp" alt="" width="400" height="400" loading="lazy" decoding="async"><div class="pack-b"><p class="pack-n">${k.n}</p><p class="pack-d">${k.d}</p><div class="pack-f"><b>${euro(k.p)}</b><button type="button" class="add" data-add="${k.id}" data-n="0">Ajouter</button></div></div></article>`).join('');
  const fmt = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  const SLOTS = (() => {
    const out = [];
    const today = OPEN_DAY(wd) && H < 22;
    let m = today ? Math.max(17 * 60 + 30, Math.ceil((now.getHours() * 60 + now.getMinutes() + 25) / 15) * 15) : 17 * 60 + 30;
    const label = today ? 'Aujourd’hui' : noi === 1 ? 'Demain' : cap(fdate(nod, { weekday: 'long' }));
    while (out.length < 6 && m <= 22 * 60 + 30) { out.push(`${label} ${fmt(m)}`); m += 15; }
    return out;
  })();
  let slot = SLOTS[0];
  const at = (s) => s.toLowerCase().replace(/ (\d+ h)/, ' à $1');
  function renderSlots() { $('#slots').innerHTML = SLOTS.map((s) => `<button type="button" role="radio" aria-checked="${s === slot}" data-slot="${s}">${s}</button>`).join(''); }
  $('#slots').addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (b) { slot = b.dataset.slot; renderSlots(); renderCart(); $(`[data-slot="${slot}"]`).focus(); } });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    cart[b.dataset.add] = (cart[b.dataset.add] || 0) + 1;
    renderCart();
  });
  const hasAlc = () => ALL.some((it) => it.alc && cart[it.id]);
  function renderCart() {
    const lines = ALL.filter((it) => cart[it.id]);
    let n = 0, t = 0;
    lines.forEach((it) => { n += cart[it.id]; t += cart[it.id] * it.p; });
    $('#cartLines').innerHTML = lines.map((it) => `<li><span>${cart[it.id]} × ${it.n}<button type="button" data-remove="${it.id}">retirer</button></span><span>${euro(it.p * cart[it.id])}</span></li>`).join('');
    $('#cartEmpty').hidden = n > 0;
    $('#cartTotal').textContent = euro(t);
    $('#cartWhere').textContent = n ? `Au bout du comptoir, ${at(slot)}` : '';
    $('#ageBox').hidden = !hasAlc();
    if (!hasAlc()) $('#age').checked = false;
    $('#order').disabled = n === 0;
    $$('[data-add]').forEach((btn) => { const q = cart[btn.dataset.add] || 0; btn.dataset.n = q; btn.textContent = q ? `Ajouté · ${q}` : 'Ajouter'; });
    $('#fCount').textContent = n; $('#fTotal').textContent = euro(t);
    $('#fCart').hidden = n === 0 || !$('#cartDone').hidden || inView;
  }
  $('#cartLines').addEventListener('click', (e) => { const b = e.target.closest('[data-remove]'); if (b) { delete cart[b.dataset.remove]; renderCart(); $('#order').focus(); } });
  $('#order').addEventListener('click', () => {
    const msg = $('#orderMsg');
    if (hasAlc() && !$('#age').checked) { msg.className = 'form-msg err'; msg.textContent = 'Cochez la case de majorité : votre commande contient de l’alcool.'; $('#age').focus(); return; }
    msg.textContent = '';
    const n = Object.values(cart).reduce((a, b) => a + b, 0);
    const t = ALL.reduce((a, it) => a + (cart[it.id] || 0) * it.p, 0);
    $('#doneT').textContent = `Prête ${at(slot)}`;
    $('#doneTxt').textContent = `${n} article${n > 1 ? 's' : ''}, ${euro(t)}, à régler au retrait. Votre sac vous attend au bout du comptoir, un SMS vous prévient quand il est prêt.${hasAlc() ? ' Une pièce d’identité peut vous être demandée.' : ''} (Démonstration : aucune commande envoyée.)`;
    $('#cartForm').hidden = true; $('#cartDone').hidden = false; $('#fCart').hidden = true;
    $('#again').focus();
  });
  $('#again').addEventListener('click', () => {
    Object.keys(cart).forEach((k) => delete cart[k]);
    $('#cartDone').hidden = true; $('#cartForm').hidden = false; renderCart();
  });
  let inView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; renderCart(); }, { threshold: 0.15 }).observe($('#emporter'));
  }

  /* ---------- Agenda ---------- */
  const EVENTS = [
    { d: 2, n: 'Le quiz du mardi', m: '20 h 30 · gratuit, équipes de 2 à 6', k: 'Table' },
    { d: 4, n: 'Jazz manouche au comptoir', m: '21 h · trio Swing des Pentes, entrée libre', k: 'Table' },
    { d: 5, n: 'Dégustation de vins nature', m: '19 h · quatre vins et une planche, 18 €', k: 'Afterwork' },
    { d: 6, n: 'Le match du soir sur grand écran', m: '21 h · pression à 6 € pendant le match', k: 'Table' },
  ];
  const nextDow = (d) => { const x = new Date(now); x.setDate(now.getDate() + ((d - wd + 7) % 7 || (H >= 21 ? 7 : 0))); return x; };
  const evs = EVENTS.map((e) => ({ ...e, date: nextDow(e.d) })).sort((a, b) => a.date - b.date);
  $('#events').innerHTML = evs.map((e, i) => `<li class="ev"><span class="ev-d"><b>${e.date.getDate()}</b><span>${fdate(e.date, { weekday: 'short' }).replace('.', '')}</span></span><span><p class="ev-n">${e.n}</p><p class="ev-m">${e.m}</p></span><button type="button" class="btn btn--line btn--sm" data-ev="${i}">Réserver</button></li>`).join('');

  /* ---------- Réservation et privatisation ---------- */
  const KINDS = ['Table', 'Afterwork', 'Anniversaire', 'Privatiser la salle du fond'];
  const DAYS = [];
  for (let i = 0; DAYS.length < 7 && i < 14; i++) { const d = new Date(now); d.setDate(now.getDate() + i); if (OPEN_DAY(d.getDay()) && (i > 0 || H < 21)) DAYS.push(d); }
  const HOURS = ['17 h 30', '18 h 30', '19 h 30', '20 h 30', '21 h 30'];
  const bk = { kind: 'Table', ppl: 4, day: 0, hour: '19 h 30' };
  function renderBook() {
    $('#kinds').innerHTML = KINDS.map((k) => `<button type="button" role="radio" aria-checked="${bk.kind === k}" data-kind="${k}">${k}</button>`).join('');
    $('#days').innerHTML = DAYS.map((d, i) => `<button type="button" role="radio" aria-checked="${i === bk.day}" data-day="${i}">${i === 0 && d.toDateString() === now.toDateString() ? 'Ce soir' : fdate(d, { weekday: 'short', day: 'numeric' }).replace('.', '')}</button>`).join('');
    const full = (h) => ((bk.day * 3 + HOURS.indexOf(h) + DAYS[bk.day].getDate()) % 5 === 0) && bk.ppl > 6;
    if (full(bk.hour)) bk.hour = HOURS.find((h) => !full(h));
    $('#hours').innerHTML = HOURS.map((h) => `<button type="button" role="radio" aria-checked="${h === bk.hour}" data-hour="${h}" ${full(h) ? 'disabled' : ''}>${h}</button>`).join('');
    $('#ppl').textContent = bk.ppl;
    const group = bk.kind.startsWith('Privatiser') || bk.ppl > 8;
    $('#groupNote').textContent = group
      ? `Au-delà de 8 personnes, on vous installe dans la salle du fond${bk.ppl > 40 ? ' (40 personnes au plus)' : ''}. Formule groupe : planches à partager et un verre par personne, 22 € par personne. Un acompte de 30 % bloque la salle.`
      : bk.kind === 'Anniversaire' ? 'Apportez le gâteau, on s’occupe des bougies et du crémant (8 € la coupe).' : '';
  }
  $('#kinds').addEventListener('click', (e) => { const b = e.target.closest('[data-kind]'); if (b) { bk.kind = b.dataset.kind; if (bk.kind.startsWith('Privatiser') && bk.ppl < 12) bk.ppl = 12; renderBook(); $(`[data-kind="${bk.kind}"]`).focus(); } });
  $('#days').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) { bk.day = +b.dataset.day; renderBook(); $(`[data-day="${bk.day}"]`).focus(); } });
  $('#hours').addEventListener('click', (e) => { const b = e.target.closest('[data-hour]'); if (b && !b.disabled) { bk.hour = b.dataset.hour; renderBook(); $(`[data-hour="${bk.hour}"]`).focus(); } });
  $('#pplDec').addEventListener('click', () => { bk.ppl = Math.max(1, bk.ppl - 1); renderBook(); });
  $('#pplInc').addEventListener('click', () => { bk.ppl = Math.min(40, bk.ppl + 1); renderBook(); });
  $('#events').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ev]');
    if (!b) return;
    const ev = evs[+b.dataset.ev];
    bk.kind = ev.k;
    const i = DAYS.findIndex((d) => d.toDateString() === ev.date.toDateString());
    if (i >= 0) bk.day = i;
    bk.hour = ev.d === 5 ? '18 h 30' : '20 h 30';
    renderBook();
    $('#reserver').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => $('#nm').focus({ preventScroll: true }), 450);
  });
  $('#bookForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nm = $('#nm'), tel = $('#tel'), msg = $('#bookMsg');
    const okN = nm.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(tel.value.trim());
    nm.setAttribute('aria-invalid', String(!okN)); tel.setAttribute('aria-invalid', String(!okT));
    if (!okN || !okT) { msg.className = 'form-msg err'; msg.textContent = !okN ? 'Indiquez votre nom.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okN ? nm : tel).focus(); return; }
    const group = bk.kind.startsWith('Privatiser') || bk.ppl > 8;
    msg.className = 'form-msg ok';
    msg.textContent = `Merci ${nm.value.trim()} : ${bk.kind.startsWith('Privatiser') ? 'privatisation de la salle du fond' : bk.kind.toLowerCase()} pour ${bk.ppl} personne${bk.ppl > 1 ? 's' : ''}, ${fdate(DAYS[bk.day])} à ${bk.hour}. ${group ? 'On vous rappelle dans l’heure pour la formule et l’acompte.' : 'Confirmation par SMS dans quelques minutes.'} (Démonstration.)`;
  });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Le Sémaphore', wall: '13221B', accent: 'C9A050' };
  const p = new URLSearchParams(location.search);
  const hex = (k) => (/^[0-9a-f]{6}$/i.test(p.get(k) || '') ? p.get(k).toUpperCase() : DEF[k]);
  st.nom = (p.get('nom') || DEF.nom).slice(0, 26); st.wall = hex('wall'); st.accent = hex('accent');
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
    document.title = `${st.nom} · Bar`;
    root.style.setProperty('--wall', `#${st.wall}`);
    root.style.setProperty('--brass', `#${st.accent}`);
    const light = lum(st.wall) > 0.3;
    root.style.setProperty('--cream', light ? '#1B1F1C' : '#EFE6D2');
    root.style.setProperty('--muted', light ? 'rgb(27 31 28 / .72)' : 'rgb(239 230 210 / .74)');
    root.style.setProperty('--line', light ? 'rgb(27 31 28 / .16)' : 'rgb(239 230 210 / .16)');
    root.style.colorScheme = light ? 'light' : 'dark';
    const L = lum(st.accent);
    root.style.setProperty('--on-brass', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#13221B');
    $('#czNom').value = st.nom; $('#czWall').value = `#${st.wall}`; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czWall').addEventListener('input', (e) => { st.wall = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Le Sémaphore rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  apply(false);
  renderTabs(); renderMenu(); renderSlots(); renderCart(); renderBook();
})();

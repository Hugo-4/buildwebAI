/* Démo club de rugby · BuildWebAI
   Billetterie des matchs à domicile (+ repas, abonnement saison), licences de la saison (Pass'Sport, pack équipement,
   remise famille, paiement en 3 fois), boutique aux couleurs du club, packs partenaires avec rappel, don défiscalisé,
   panier unique en tiroir, panneau « Personnaliser » (?nom=…&accent=8C1D2C&c2=F4EFE6 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} €`;
  const now = new Date();
  const cart = new Map(); // key -> { label, sub, amount, kind, lic?, licBase? }
  const fdate = (d, o) => d.toLocaleDateString('fr-FR', o);

  /* ---------- Matchs à domicile ---------- */
  const sundays = [];
  const d0 = new Date(now); d0.setHours(15, 0, 0, 0);
  d0.setDate(d0.getDate() + ((7 - d0.getDay()) % 7));
  if (d0 < now) d0.setDate(d0.getDate() + 7);
  for (let i = 0; i < 3; i++) { const d = new Date(d0); d.setDate(d0.getDate() + i * 14); sundays.push(d); }
  const MATCHES = [
    { vs: 'US Monts d’Or', comp: 'Fédérale 2 · seniors 15 h, réserve 13 h 15', tag: 'Derby' },
    { vs: 'Olympique des Dombes', comp: 'Fédérale 2 · seniors 15 h, féminines 13 h', tag: '15 h' },
    { vs: 'RC Val de Saône', comp: 'Fédérale 2 · seniors 15 h, réserve 13 h 15', tag: '15 h' },
  ].map((m, i) => ({ ...m, date: sundays[i] }));
  const days = Math.floor((sundays[0] - new Date(now.toDateString())) / 864e5);
  $('#nextMatch').textContent = `Prochain match à domicile : ${fdate(sundays[0], { weekday: 'long', day: 'numeric', month: 'long' })}, 15 h · ${days <= 0 ? "aujourd'hui" : days === 1 ? 'demain' : `dans ${days} jours`}`;

  const RATES = [
    { id: 'plein', n: 'Plein tarif', p: 8 },
    { id: 'reduit', n: 'Tarif réduit', d: 'Étudiants, demandeurs d’emploi, 12–18 ans', p: 5 },
    { id: 'enfant', n: 'Moins de 12 ans', d: 'Accompagné d’un adulte', p: 0 },
  ];
  let match = 0;
  const qty = { plein: 2, reduit: 0, enfant: 0 };
  function renderMatches() {
    $('#matches').innerHTML = MATCHES.map((m, i) => `<button type="button" class="match" role="radio" aria-checked="${i === match}" data-match="${i}">
      <span class="m-date"><b>${m.date.getDate()}</b><span>${fdate(m.date, { month: 'short' }).replace('.', '')}</span></span>
      <span class="m-vs">Contre ${m.vs}<span class="m-comp">${m.comp}</span></span>
      <span class="m-tag">${m.tag}</span></button>`).join('');
    const m = MATCHES[match];
    $('#tTitle').textContent = `Contre ${m.vs}, ${fdate(m.date, { weekday: 'long', day: 'numeric', month: 'long' })}`;
  }
  function renderRates() {
    $('#rates').innerHTML = RATES.map((r) => `<div class="rate"><span>${r.n} · <b>${r.p ? euro(r.p) : 'gratuit'}</b>${r.d ? `<small>${r.d}</small>` : ''}</span>
      <div class="stepper"><button type="button" data-dec="${r.id}" aria-label="Un billet ${r.n} de moins">−</button><span aria-live="polite">${qty[r.id]}</span><button type="button" data-inc="${r.id}" aria-label="Un billet ${r.n} de plus">+</button></div></div>`).join('');
    const n = Object.values(qty).reduce((a, b) => a + b, 0);
    const t = RATES.reduce((a, r) => a + r.p * qty[r.id], 0) + ($('#meal').checked ? 25 * n : 0);
    $('#addTickets').disabled = n === 0;
    $('#addTickets').textContent = n ? `Ajouter ${n} billet${n > 1 ? 's' : ''} · ${euro(t)}` : 'Choisissez vos billets';
  }
  $('#matches').addEventListener('click', (e) => { const b = e.target.closest('[data-match]'); if (b) { match = +b.dataset.match; renderMatches(); $(`[data-match="${match}"]`).focus(); } });
  $('#matches').addEventListener('keydown', (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault(); match = (match + d + MATCHES.length) % MATCHES.length; renderMatches(); $(`[data-match="${match}"]`).focus();
  });
  $('#rates').addEventListener('click', (e) => {
    const b = e.target.closest('[data-inc],[data-dec]');
    if (!b) return;
    const id = b.dataset.inc || b.dataset.dec;
    qty[id] = Math.max(0, Math.min(10, qty[id] + (b.dataset.inc ? 1 : -1)));
    renderRates();
    $(`[data-${b.dataset.inc ? 'inc' : 'dec'}="${id}"]`).focus();
  });
  $('#meal').addEventListener('change', renderRates);
  $('#addTickets').addEventListener('click', () => {
    const m = MATCHES[match];
    const n = Object.values(qty).reduce((a, b) => a + b, 0);
    if (!n) return;
    const parts = RATES.filter((r) => qty[r.id]).map((r) => `${qty[r.id]} ${r.n.toLowerCase()}`);
    cart.set(`t:${match}`, { label: `Billets · contre ${m.vs}`, sub: `${parts.join(', ')} · ${fdate(m.date, { day: 'numeric', month: 'short' })}`, amount: RATES.reduce((a, r) => a + r.p * qty[r.id], 0), kind: 'ticket' });
    if ($('#meal').checked) cart.set(`meal:${match}`, { label: `Repas d'avant-match × ${n}`, sub: 'Club-house, 12 h', amount: 25 * n, kind: 'ticket' });
    else cart.delete(`meal:${match}`);
    renderCart(); openCart();
  });
  $('#addSeason').addEventListener('click', () => {
    cart.set('season', { label: 'Abonnement saison', sub: '11 matchs à domicile, carte nominative', amount: 60, kind: 'ticket' });
    renderCart(); openCart();
  });

  /* ---------- Licences ---------- */
  const CATS = [
    { id: 'ecole', n: 'École de rugby', a: 'U6 à U14 · 5 à 13 ans', p: 180, pass: true },
    { id: 'juniors', n: 'Juniors', a: 'U16 et U18 · 14 à 17 ans', p: 220, pass: true },
    { id: 'feminines', n: 'Féminines', a: 'À partir de 15 ans', p: 200, pass: true },
    { id: 'seniors', n: 'Seniors', a: 'À partir de 18 ans', p: 260 },
    { id: 'loisir', n: 'Rugby à 5', a: 'Loisir, mixte, sans plaquage', p: 150 },
  ];
  let cat = 0, licN = 0;
  function renderCats() {
    $('#cats').innerHTML = CATS.map((c, i) => `<button type="button" class="cat" role="radio" aria-checked="${i === cat}" data-cat="${i}">
      <img src="img/${c.id}-600.webp" alt="" width="600" height="450" loading="lazy" decoding="async">
      <span class="cat-b"><b>${c.n}</b><span>${c.a}</span><strong>${euro(c.p)} la saison</strong></span></button>`).join('');
    const c = CATS[cat];
    $('#passSport').closest('.opt').hidden = !c.pass;
    if (!c.pass) $('#passSport').checked = false;
    renderLicSum();
  }
  const licPrice = () => CATS[cat].p - ($('#passSport').checked ? 50 : 0);
  function renderLicSum() {
    const c = CATS[cat];
    const name = $('#lName').value.trim();
    const t = licPrice() + ($('#kit').checked ? 45 : 0);
    $('#licSum').textContent = `Licence ${c.n}${name ? ` pour ${name}` : ''} : ${euro(t)}${$('#passSport').checked ? ', Pass’Sport déduit' : ''}.`;
  }
  $('#cats').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { cat = +b.dataset.cat; renderCats(); $(`[data-cat="${cat}"]`).focus(); } });
  $('#cats').addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault(); cat = (cat + d + CATS.length) % CATS.length; renderCats(); $(`[data-cat="${cat}"]`).focus();
  });
  ['#lName', '#passSport', '#kit'].forEach((s) => $(s).addEventListener('input', renderLicSum));
  $('#addLic').addEventListener('click', () => {
    const c = CATS[cat];
    const name = $('#lName').value.trim();
    licN += 1;
    cart.set(`lic:${licN}`, { label: `Licence ${c.n}${name ? ` · ${name}` : ''}`, sub: `Saison 2026-2027${$('#passSport').checked ? ' · Pass’Sport −50 €' : ''}`, licBase: licPrice(), amount: licPrice(), kind: 'lic' });
    if ($('#kit').checked) cart.set(`kit:${licN}`, { label: 'Pack équipement', sub: name ? `Pour ${name}` : 'Maillot, short, chaussettes, sac', amount: 45, kind: 'shop' });
    $('#lName').value = ''; $('#passSport').checked = false; $('#kit').checked = false;
    renderLicSum(); renderCart(); openCart();
  });

  /* ---------- Boutique ---------- */
  const JERSEY = 'M70 22 40 32 10 62l22 30 20-12v104h96V80l20 12 22-30-30-30-30-10c-8 14-52 14-60 0z';
  const ART = {
    maillot: `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><clipPath id="cj"><path d="${JERSEY}"/></clipPath></defs><path class="fill-a" d="${JERSEY}"/><g clip-path="url(#cj)" class="fill-b"><rect x="0" y="92" width="200" height="22"/><rect x="0" y="136" width="200" height="22"/></g><path class="fill-b" d="M70 22c8 14 52 14 60 0l-6-2c-8 10-40 10-48 0z"/></svg>`,
    polo: `<svg viewBox="0 0 200 200" aria-hidden="true"><path class="fill-ink" d="${JERSEY}"/><path class="fill-a" d="M70 22c8 14 52 14 60 0l-30 28z"/><rect class="fill-b" x="96" y="44" width="8" height="34"/><path class="fill-a" d="M10 62l22 30 8-5-22-30zM190 62l-22 30-8-5 22-30z"/></svg>`,
    echarpe: `<svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-35 100 100)"><rect class="fill-a" x="20" y="80" width="160" height="40"/><g class="fill-b"><rect x="44" y="80" width="18" height="40"/><rect x="91" y="80" width="18" height="40"/><rect x="138" y="80" width="18" height="40"/></g><g class="fill-a"><rect x="8" y="84" width="10" height="3"/><rect x="8" y="94" width="10" height="3"/><rect x="8" y="104" width="10" height="3"/><rect x="8" y="114" width="10" height="3"/><rect x="182" y="84" width="10" height="3"/><rect x="182" y="94" width="10" height="3"/><rect x="182" y="104" width="10" height="3"/><rect x="182" y="114" width="10" height="3"/></g></g></svg>`,
    ballon: `<svg viewBox="0 0 200 200" aria-hidden="true"><g transform="rotate(-30 100 100)"><ellipse class="fill-b" cx="100" cy="100" rx="88" ry="54" stroke="#14171C" stroke-width="3"/><path class="fill-a" d="M70 50c-10 30-10 70 0 100h18c-10-30-10-70 0-100zM130 50c10 30 10 70 0 100h-18c10-30 10-70 0-100z"/><path d="M100 82v36M92 88h16M92 100h16M92 112h16" stroke="#14171C" stroke-width="3" fill="none"/></g></svg>`,
  };
  const ITEMS = [
    { id: 'maillot', n: 'Maillot domicile', d: 'Cerclé aux couleurs du club, coupe ajustée.', p: 55, sizes: ['8 ans', '12 ans', 'S', 'M', 'L', 'XL'] },
    { id: 'polo', n: 'Polo du club', d: 'Pour les déplacements et la 3e mi-temps.', p: 38, sizes: ['S', 'M', 'L', 'XL'] },
    { id: 'echarpe', n: 'Écharpe supporter', d: 'Tricotée, double face.', p: 18 },
    { id: 'ballon', n: 'Ballon du club', d: 'Taille 4 pour les jeunes, 5 pour les adultes.', p: 25, sizes: ['T4', 'T5'] },
  ];
  const size = { maillot: 'M', polo: 'M', ballon: 'T5' };
  function renderItems() {
    $('#items').innerHTML = ITEMS.map((it) => `<article class="item">
      <div class="item-art">${ART[it.id]}</div>
      <div class="item-body"><h3>${it.n}</h3><p>${it.d}</p>
        ${it.sizes ? `<div class="sizes" role="radiogroup" aria-label="Taille ${it.n}">${it.sizes.map((s) => `<button type="button" role="radio" aria-checked="${size[it.id] === s}" data-size="${it.id}|${s}">${s}</button>`).join('')}</div>` : ''}
        <div class="item-foot"><span class="item-price">${euro(it.p)}</span><button type="button" class="add" data-item="${it.id}">Ajouter</button></div></div>
    </article>`).join('');
  }
  $('#items').addEventListener('click', (e) => {
    const s = e.target.closest('[data-size]');
    if (s) { const [id, v] = s.dataset.size.split('|'); size[id] = v; renderItems(); $(`[data-size="${id}|${v}"]`).focus(); return; }
    const b = e.target.closest('[data-item]');
    if (!b) return;
    const it = ITEMS.find((x) => x.id === b.dataset.item);
    const key = `shop:${it.id}:${size[it.id] || ''}`;
    const cur = cart.get(key);
    const q = (cur?.q || 0) + 1;
    cart.set(key, { label: `${q > 1 ? `${q} × ` : ''}${it.n}${size[it.id] ? ` · ${size[it.id]}` : ''}`, sub: 'Retrait au club-house le jour du match', amount: it.p * q, q, kind: 'shop' });
    renderCart();
    b.textContent = `Ajouté · ${q}`;
  });

  /* ---------- Partenaires ---------- */
  const PACKS = [
    { n: 'Supporter', p: 300, list: ['Logo sur le site et les réseaux', '2 abonnements saison'] },
    { n: 'Partenaire', p: 900, list: ['Panneau en bord de terrain', 'Logo sur le site', '4 abonnements et 4 repas d’avant-match'] },
    { n: 'Partenaire majeur', p: 2500, top: true, list: ['Logo sur la manche du maillot seniors', 'Panneau et logo sur le site', '8 abonnements, repas à chaque match'] },
  ];
  $('#packs').innerHTML = PACKS.map((k, i) => `<article class="pack${k.top ? ' is-top' : ''}">
    <h3>${k.n}</h3>
    <p class="pack-price">${euro(k.p)} <small>la saison</small></p>
    <p class="pack-net">Soit ${euro(k.p * 0.4)} après réduction d'impôt (mécénat)</p>
    <ul>${k.list.map((x) => `<li>${x}</li>`).join('')}</ul>
    <button type="button" class="btn ${k.top ? 'btn--accent' : 'btn--line'}" data-pack="${i}">Être rappelé</button>
  </article>`).join('');
  $('#packs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pack]');
    if (!b) return;
    $('#cbT').textContent = `Être rappelé · pack ${PACKS[+b.dataset.pack].n}`;
    $('#cbForm').hidden = false; $('#cbMsg').textContent = '';
    $('#cbCo').focus();
  });
  $('#cbForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const co = $('#cbCo'), tel = $('#cbTel'), msg = $('#cbMsg');
    const okC = co.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(tel.value.trim());
    co.setAttribute('aria-invalid', String(!okC)); tel.setAttribute('aria-invalid', String(!okT));
    if (!okC || !okT) { msg.className = 'form-msg err'; msg.textContent = !okC ? 'Indiquez le nom de votre entreprise.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okC ? co : tel).focus(); return; }
    msg.className = 'form-msg';
    msg.textContent = `Merci, ${co.value.trim()} : la plaquette part par e-mail et le président vous rappelle sous 48 h (démonstration).`;
  });

  /* ---------- Don ---------- */
  const DONS = [20, 50, 100, 200];
  let don = 1;
  function renderDons() {
    $('#gifts').innerHTML = DONS.map((g, i) => `<button type="button" role="radio" aria-checked="${i === don}" data-don="${i}">${g}&nbsp;€</button>`).join('');
    $('#giveCost').textContent = `Après la réduction d'impôt de 66 %, ce don vous coûte ${euro(DONS[don] * 0.34)}. Reçu fiscal envoyé par e-mail.`;
  }
  $('#gifts').addEventListener('click', (e) => { const b = e.target.closest('[data-don]'); if (b) { don = +b.dataset.don; renderDons(); $(`[data-don="${don}"]`).focus(); } });
  $('#addDon').addEventListener('click', () => {
    cart.set('don', { label: `Don à l'école de rugby`, sub: `Coût réel ${euro(DONS[don] * 0.34)} après réduction d'impôt`, amount: DONS[don], kind: 'don' });
    renderCart(); openCart();
  });

  /* ---------- Panier ---------- */
  function lines() {
    // Remise famille : −20 % sur la licence la moins chère à partir de la deuxième
    const lics = [...cart].filter(([, v]) => v.kind === 'lic').sort((a, b) => b[1].licBase - a[1].licBase);
    lics.forEach(([, v], i) => { v.amount = i === 0 ? v.licBase : Math.round(v.licBase * 0.8); });
    return [...cart];
  }
  function totals() {
    let n = 0, t = 0, lic = 0;
    lines().forEach(([, v]) => { n += 1; t += v.amount; if (v.kind === 'lic') lic += v.amount; });
    const split = $('#split').checked && lic > 0;
    const third = Math.ceil(lic / 3);
    return { n, t, lic, split, today: split ? t - lic + third : t, later: split ? (lic - third) / 2 : 0 };
  }
  function renderCart() {
    $('#cartLines').innerHTML = lines().map(([k, v]) => `<li><span>${v.label}${v.sub ? `<small>${v.sub}</small>` : ''}<button type="button" data-remove="${k}">retirer</button></span><span>${v.kind === 'lic' && v.amount !== v.licBase ? `<s>${euro(v.licBase)}</s> ` : ''}${v.amount ? euro(v.amount) : 'gratuit'}${v.kind === 'lic' && v.amount !== v.licBase ? '<small>remise famille</small>' : ''}</span></li>`).join('') || '<li class="muted">Votre panier est vide.</li>';
    const T = totals();
    $('#splitBox').hidden = T.lic === 0;
    $('#cartNow').textContent = euro(T.today);
    const notes = [];
    if (T.split) notes.push(`Puis 2 × ${euro(T.later)} le 5 des deux mois suivants, sans frais.`);
    if (cart.has('don')) notes.push('Le reçu fiscal du don arrive par e-mail.');
    $('#cartNote').textContent = notes.join(' ');
    $('#pay').disabled = T.n === 0;
    $('#cCount').textContent = T.n;
    $('#cTotal').textContent = euro(T.today);
    $('#cartBtn').hidden = T.n === 0 || !$('#cart').hidden;
  }
  $('#split').addEventListener('change', renderCart);
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    $('#cart').hidden = false; $('#scrim').hidden = false; $('#cartBtn').hidden = true;
    $('#cartBtn').setAttribute('aria-expanded', 'true');
    $('#cartClose').focus();
  }
  function closeCart() {
    $('#cart').hidden = true; $('#scrim').hidden = true;
    $('#cartBtn').setAttribute('aria-expanded', 'false');
    if (!$('#cartDone').hidden) { $('#cartDone').hidden = true; $('#cartForm').hidden = false; }
    renderCart();
    if (lastFocus && document.contains(lastFocus) && lastFocus !== document.body) lastFocus.focus();
  }
  $('#cartBtn').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  $('#scrim').addEventListener('click', closeCart);
  $('#cart').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...$('#cart').querySelectorAll('button:not([disabled]), [href], input')].filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  $('#cartLines').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    cart.delete(b.dataset.remove);
    renderCart(); renderItems();
    $('#cartClose').focus();
  });
  $('#pay').addEventListener('click', () => {
    const T = totals();
    if (!T.n) return;
    const kinds = new Set([...cart.values()].map((v) => v.kind));
    const bits = [];
    if (kinds.has('ticket')) bits.push('Vos billets arrivent par e-mail avec un QR code, à présenter à l’entrée.');
    if (kinds.has('lic')) bits.push('Le secrétariat vous envoie le lien pour déposer le certificat médical et la photo.');
    if (kinds.has('shop')) bits.push('Vos articles vous attendent au club-house le jour du match.');
    if (kinds.has('don')) bits.push('Merci pour l’école de rugby, le reçu fiscal suit.');
    $('#doneT').textContent = `Paiement de ${euro(T.today)} validé`;
    $('#doneTxt').textContent = `${bits.join(' ')}${T.split ? ` Prochaines échéances : 2 × ${euro(T.later)}.` : ''} (Démonstration : aucun débit.)`;
    cart.clear(); $('#split').checked = false;
    $('#cartForm').hidden = true; $('#cartDone').hidden = false;
    renderCart(); renderItems();
    $('#again').focus();
  });
  $('#again').addEventListener('click', closeCart);

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Union Rugby des Berges', accent: '8C1D2C', c2: 'F4EFE6' };
  const p = new URLSearchParams(location.search);
  const hex = (k) => (/^[0-9a-f]{6}$/i.test(p.get(k) || '') ? p.get(k).toUpperCase() : DEF[k]);
  const st = { nom: (p.get('nom') || DEF.nom).slice(0, 32), accent: hex('accent'), c2: hex('c2') };
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
  const sigle = (n) => {
    const w = n.split(/[\s'’-]+/).filter((x) => x.length > 2 || /^[A-Z]{2,}$/.test(x));
    return (w.length > 1 ? w.map((x) => x[0]).join('') : n.replace(/\s/g, '')).slice(0, 3).toUpperCase();
  };
  function apply(push = true) {
    $$('[data-bind="nom"]').forEach((el) => { el.textContent = st.nom; });
    $$('[data-bind="sigle"]').forEach((el) => { el.textContent = sigle(st.nom); });
    document.title = `${st.nom} · Club de rugby`;
    root.style.setProperty('--accent', `#${st.accent}`);
    root.style.setProperty('--c2', `#${st.c2}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#14171C');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`; $('#czC2').value = `#${st.c2}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czC2').addEventListener('input', (e) => { st.c2 = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Union Rugby des Berges rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#cart').hidden) closeCart();
    else if (!cz.hidden) { setCz(false); czBtn.focus(); }
  });

  renderMatches(); renderRates(); renderCats(); renderItems(); renderDons(); renderCart();
  apply(false);
})();

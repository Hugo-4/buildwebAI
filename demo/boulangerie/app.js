/* Démo boulangerie · BuildWebAI
   Vitrine par catégorie, paniers du moment (mis en avant selon l'heure), créneaux toutes les 15 min,
   commande Click & Collect, panneau « Personnaliser » (?nom=…&accent=7A4320 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${n.toFixed(2).replace('.', ',')} €`;

  /* ---------- Catalogue ---------- */
  const PRODUCTS = [
    { id: 'baguette', cat: 'pains', name: 'Baguette tradition', desc: 'Levain, 24 h de pousse, croûte qui chante.', price: 1.3, stock: 0, hot: true },
    { id: 'levain', cat: 'pains', name: 'Grand levain', desc: 'Miche de 1 kg, mie alvéolée, se garde 5 jours.', price: 7.8, stock: 4 },
    { id: 'graines', cat: 'pains', name: 'Pain aux graines', desc: 'Lin, tournesol, courge, sésame.', price: 4.6, stock: 0 },
    { id: 'croissant', cat: 'viennoiseries', name: 'Croissant au beurre', desc: 'Beurre AOP Charentes-Poitou.', price: 1.4, stock: 0, hot: true },
    { id: 'cannelle', cat: 'viennoiseries', name: 'Roulé cannelle', desc: 'Pâte levée feuilletée, sucre muscovado.', price: 2.9, stock: 6 },
    { id: 'tarte', cat: 'patisseries', name: 'Tarte aux fruits', desc: 'Fruits de saison sur crème d’amande.', price: 4.2, stock: 0 },
    { id: 'fraisier', cat: 'patisseries', name: 'Fraisier', desc: 'Génoise, crème mousseline, fraises de Saint-Genis.', price: 5.5, stock: 3 },
    { id: 'chocolat', cat: 'patisseries', name: 'Gâteau au chocolat', desc: 'Entier, 6 à 8 parts, votre message sur la plaque.', price: 28, stock: 0, order: true },
    { id: 'cookies', cat: 'patisseries', name: 'Cookies noisette', desc: 'Les quatre, chocolat noir 70 %.', price: 6, stock: 0 },
    { id: 'sandwich', cat: 'sale', name: 'Sandwich du jour', desc: 'Baguette tradition, jambon blanc, comté 18 mois.', price: 6.9, stock: 8 },
  ];
  const MOMENTS = [
    { id: 'p-petitdej', name: 'Petit-déjeuner', when: '6 h 30 – 10 h', items: ['1 baguette tradition', '2 croissants au beurre', '1 roulé cannelle'], price: 6.5, was: 7 },
    { id: 'p-midi', name: 'Formule midi', when: '11 h 30 – 14 h', items: ['1 sandwich du jour', '1 tarte aux fruits', '1 boisson'], price: 10.9, was: 12.6 },
    { id: 'p-dessert', name: 'Goûter & dessert', when: '14 h – 18 h', items: ['4 cookies noisette', '2 parts de fraisier'], price: 15.5, was: 17 },
    { id: 'p-soir', name: 'Fin de journée', when: 'dès 18 h 30', items: ['Pains et viennoiseries du jour', 'Composé selon les invendus', 'Environ 12 € de produits'], price: 6, was: 12, eco: true },
  ];
  const ALL = [...PRODUCTS, ...MOMENTS];
  const cart = {};
  const now = new Date();
  const H = now.getHours() + now.getMinutes() / 60;

  /* ---------- Four ---------- */
  const next = [7, 12, 17].find((h) => h > H);
  $('#ovenTxt').textContent = H < 6.5 || H >= 19.5
    ? 'Fermé · première fournée demain à 7 h'
    : next
      ? (next - H <= 0.5 ? `Fournée dans ${Math.max(1, Math.round((next - H) * 60))} min` : `Prochaine fournée à ${next} h`)
      : 'Dernière fournée sortie à 17 h';

  /* ---------- Vitrine ---------- */
  let cat = 'pains';
  const control = (id) => {
    const q = cart[id] || 0;
    return q
      ? `<div class="stepper"><button type="button" data-dec="${id}" aria-label="Retirer un">−</button><span aria-live="polite">${q}</span><button type="button" data-inc="${id}" aria-label="Ajouter un">+</button></div>`
      : `<button type="button" class="add" data-inc="${id}">Ajouter</button>`;
  };
  function renderProducts() {
    $('#products').innerHTML = PRODUCTS.filter((p) => p.cat === cat).map((p) => `
      <article class="product">
        <div class="p-img"><img src="img/${p.id}-600.webp" srcset="img/${p.id}-400.webp 400w, img/${p.id}-600.webp 600w" sizes="(min-width: 1050px) 25vw, (min-width: 760px) 33vw, 50vw" alt="" width="600" height="600" loading="lazy" decoding="async">
          ${p.hot ? '<span class="badge badge--hot">Sort du four</span>' : p.order ? '<span class="badge">Sur commande 48 h</span>' : ''}</div>
        <div class="p-body">
          <h3 class="p-name">${p.name}</h3>
          <p class="p-desc">${p.desc}</p>
          ${p.stock ? `<p class="p-stock">Plus que ${p.stock} aujourd'hui</p>` : ''}
          <div class="p-foot"><span class="p-price">${euro(p.price)}</span><span data-ctl="${p.id}">${control(p.id)}</span></div>
        </div>
      </article>`).join('');
  }
  const tabs = $$('#tabs [role="tab"]');
  const select = (b, focus) => {
    cat = b.dataset.cat;
    tabs.forEach((t) => { const on = t === b; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $('#products').setAttribute('aria-label', b.textContent);
    if (focus) b.focus();
    renderProducts();
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => select(b));
    b.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- Paniers du moment ---------- */
  const nowId = H < 10 ? 'p-petitdej' : H < 14 ? 'p-midi' : H < 18 ? 'p-dessert' : 'p-soir';
  function renderMoments() {
    $('#moments').innerHTML = MOMENTS.map((m) => `
      <article class="moment${m.id === nowId ? ' is-now' : ''}">
        <div class="m-img"><img src="img/${m.id}-600.webp" srcset="img/${m.id}-600.webp 600w, img/${m.id}-900.webp 900w" sizes="(min-width: 1050px) 25vw, (min-width: 600px) 50vw, 100vw" alt="" width="900" height="675" loading="lazy" decoding="async">
          <span class="m-when">${m.id === nowId ? 'En ce moment · ' : ''}${m.when}</span></div>
        <div class="m-body">
          <h3>${m.name}</h3>
          <ul class="m-list">${m.items.map((x) => `<li>${x}</li>`).join('')}</ul>
          ${m.eco ? '<p class="p-stock">Anti-gaspi : −50 %, quantité limitée</p>' : ''}
          <div class="m-foot"><span class="m-price">${euro(m.price)}<s>${euro(m.was)}</s></span><span data-ctl="${m.id}">${control(m.id)}</span></div>
        </div>
      </article>`).join('');
  }

  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    const id = (inc || dec)?.dataset[inc ? 'inc' : 'dec'];
    if (!id) return;
    cart[id] = Math.max(0, (cart[id] || 0) + (inc ? 1 : -1));
    if (!cart[id]) delete cart[id];
    const box = $(`[data-ctl="${id}"]`);
    if (box) {
      box.innerHTML = control(id);
      const again = box.querySelector(inc ? '[data-inc]' : (cart[id] ? '[data-dec]' : '[data-inc]'));
      if (again) again.focus();
    }
    renderCart();
  });

  /* ---------- Créneaux toutes les 15 min ---------- */
  const fmt = (m) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  const open = 6 * 60 + 30, close = 19 * 60 + 30;
  let start = Math.ceil((now.getHours() * 60 + now.getMinutes() + 20) / 15) * 15;
  let day = "Aujourd'hui";
  if (start < open) start = open;
  if (start > close - 15 * 5) { start = 7 * 60; day = 'Demain'; }
  const SLOTS = Array.from({ length: 6 }, (_, i) => `${day} ${fmt(start + i * 15)}`);
  let slot = SLOTS[0];
  function renderSlots() {
    $('#slots').innerHTML = SLOTS.map((s) => `<button type="button" aria-pressed="${s === slot}" data-slot="${s}">${s}</button>`).join('');
  }
  $('#slots').addEventListener('click', (e) => {
    const b = e.target.closest('[data-slot]');
    if (!b) return;
    slot = b.dataset.slot;
    renderSlots();
    renderCart();
  });

  /* ---------- Commande ---------- */
  function totals() {
    let n = 0, t = 0;
    ALL.forEach((p) => { const q = cart[p.id] || 0; n += q; t += q * p.price; });
    return { n, t };
  }
  function renderCart() {
    const lines = ALL.filter((p) => cart[p.id]);
    $('#cartLines').innerHTML = lines.map((p) => `<li><span>${cart[p.id]} × ${p.name}<button type="button" data-remove="${p.id}">retirer</button></span><span>${euro(p.price * cart[p.id])}</span></li>`).join('');
    const { n, t } = totals();
    $('#cartEmpty').hidden = n > 0;
    $('#cartTotal').textContent = euro(t);
    const cake = cart.chocolat ? ' · gâteau prêt sous 48 h' : '';
    $('#cartWhere').textContent = n ? `Comptoir coupe-file · ${slot.toLowerCase()}${cake}` : '';
    $('#order').disabled = n === 0;
    $('#mCount').textContent = n;
    $('#mTotal').textContent = euro(t);
    $('#mCart').hidden = n === 0 || !$('#cartDone').hidden;
  }
  $('#cartLines').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    const id = b.dataset.remove;
    delete cart[id];
    const box = $(`[data-ctl="${id}"]`);
    if (box) box.innerHTML = control(id);
    renderCart();
    if (!$('#order').disabled) $('#order').focus();
  });
  $('#order').addEventListener('click', () => {
    const { n, t } = totals();
    if (!n) return;
    $('#doneT').textContent = `C'est réservé, ${slot.toLowerCase()}`;
    $('#doneTxt').textContent = `${n} article${n > 1 ? 's' : ''}, ${euro(t)}, à régler au retrait. Votre sac vous attend au comptoir coupe-file : un SMS vous prévient dès qu'il est prêt.${cart.chocolat ? ' Le gâteau sera prêt sous 48 h, nous vous rappelons pour le message de la plaque.' : ''}`;
    $('#cartForm').hidden = true;
    $('#cartDone').hidden = false;
    $('#mCart').hidden = true;
    $('#again').focus();
  });
  $('#again').addEventListener('click', () => {
    Object.keys(cart).forEach((k) => delete cart[k]);
    $('#cartDone').hidden = true; $('#cartForm').hidden = false;
    renderProducts(); renderMoments(); renderCart();
  });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Le Fournil de Jeanne', accent: '7A4320' };
  const p = new URLSearchParams(location.search);
  const st = { nom: (p.get('nom') || DEF.nom).slice(0, 30), accent: /^[0-9a-f]{6}$/i.test(p.get('accent') || '') ? p.get('accent').toUpperCase() : DEF.accent };
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
    document.title = `${st.nom} · Boulangerie`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#2A1E16');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version du Fournil de Jeanne rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  renderProducts();
  renderMoments();
  renderSlots();
  renderCart();
  apply(false);
})();

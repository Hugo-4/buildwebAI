/* Démo épicerie · BuildWebAI
   Paniers précomposés (ajout, abonnement hebdomadaire), Click & Collect au comptoir ou en casier,
   lettre d'info, panneau « Personnaliser » (?nom=…&accent=2F5D3A ; &presentation=1). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${n.toFixed(2).replace('.', ',')} €`;

  const BASKETS = [
    { id: 'semaine', name: 'Panier de la semaine', for: '2 personnes · 5 repas', img: 'semaine', price: 29, list: ['8 à 10 légumes et fruits de saison', '6 œufs fermiers', 'Un bouquet d’herbes'], recipe: 'Recette glissée : gratin de courge à la tomme', sub: true },
    { id: 'apero', name: 'Panier apéro', for: '4 personnes', img: 'apero', price: 34, list: ['3 fromages de la semaine', 'Saucisson sec de Bresse', 'Pain au levain', 'Confiture de figues'], recipe: 'Le petit plus : les accords fromages et vins' },
    { id: 'petitdej', name: 'Panier petit-déjeuner', for: '2 personnes · 1 semaine', img: 'petitdej', price: 19, list: ['Pain au levain', 'Beurre de baratte', 'Confiture et miel du Bugey', 'Jus de pomme du Pilat'], recipe: 'Recette glissée : granola maison au miel' },
    { id: 'antigaspi', name: 'Panier anti-gaspi', for: 'Surprise · le samedi', img: 'antigaspi', price: 12, was: 20, tag: '15 paniers par semaine', list: ['Fruits et légumes moches ou très mûrs', 'Produits à date courte'], recipe: 'Recette glissée : soupe et compote du samedi' },
  ];
  const cart = {};
  let weekly = false;

  /* ---------- Cartes des paniers ---------- */
  $('#bkGrid').innerHTML = BASKETS.map((b) => `
    <article class="bk">
      <div class="bk-img"><img src="img/${b.img}-900.webp" srcset="img/${b.img}-600.webp 600w, img/${b.img}-900.webp 900w" sizes="(min-width: 1100px) 25vw, (min-width: 600px) 50vw, 100vw" alt="" width="900" height="675" loading="lazy" decoding="async">${b.tag ? `<span class="bk-tag">${b.tag}</span>` : ''}</div>
      <div class="bk-body">
        <h3>${b.name}</h3>
        <p class="bk-for">${b.for}</p>
        <ul class="bk-list">${b.list.map((x) => `<li>${x}</li>`).join('')}</ul>
        <p class="bk-recipe">${b.recipe}</p>
        ${b.sub ? '<label class="sub"><input type="checkbox" id="weekly"> Chaque semaine, 10&nbsp;% de moins</label>' : ''}
        <div class="bk-foot"><span class="bk-price">${euro(b.price)}${b.was ? `<s>${euro(b.was)}</s>` : ''}</span><button type="button" class="bk-add" data-add="${b.id}">Ajouter</button></div>
      </div>
    </article>`).join('');

  $('#bkGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    cart[btn.dataset.add] = (cart[btn.dataset.add] || 0) + 1;
    renderCart();
  });
  $('#weekly').addEventListener('change', (e) => {
    weekly = e.target.checked;
    if (weekly && !cart.semaine) cart.semaine = 1;
    renderCart();
  });

  /* ---------- Retrait : comptoir ou casier ---------- */
  const SLOTS = {
    comptoir: ["Aujourd'hui à 17 h", 'Demain à 10 h', 'Demain à 18 h'],
    casier: ['Ce soir dès 19 h', 'Demain dès 7 h', 'Demain soir dès 19 h'],
  };
  let mode = 'comptoir';
  let slot = SLOTS.comptoir[0];
  function renderSlots() {
    $('#slots').innerHTML = SLOTS[mode].map((s) => `<button type="button" aria-pressed="${s === slot}" data-slot="${s}">${s.replace(' h', ' h')}</button>`).join('');
  }
  $$('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    $$('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    slot = SLOTS[mode][0];
    renderSlots();
    renderCart();
  }));
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
    BASKETS.forEach((b) => {
      const q = cart[b.id] || 0;
      n += q;
      t += q * b.price * (b.id === 'semaine' && weekly ? 0.9 : 1);
    });
    return { n, t };
  }
  function renderCart() {
    const lines = BASKETS.filter((b) => cart[b.id]);
    $('#cartLines').innerHTML = lines.map((b) => {
      const unit = b.price * (b.id === 'semaine' && weekly ? 0.9 : 1);
      return `<li><span>${cart[b.id]} × ${b.name}${b.id === 'semaine' && weekly ? ' (chaque semaine)' : ''}<button type="button" data-remove="${b.id}">retirer</button></span><span>${euro(unit * cart[b.id])}</span></li>`;
    }).join('');
    const { n, t } = totals();
    $('#cartEmpty').hidden = n > 0;
    $('#cartTotal').textContent = euro(t);
    $('#cartWhere').textContent = n ? `${mode === 'casier' ? 'Casier réfrigéré' : 'Au comptoir'} · ${slot.toLowerCase()}` : '';
    $('#order').disabled = n === 0;
    $$('[data-add]').forEach((btn) => {
      const q = cart[btn.dataset.add] || 0;
      btn.textContent = q ? `Ajouté · ${q}` : 'Ajouter';
      btn.dataset.added = String(q > 0);
    });
    $('#mCount').textContent = n;
    $('#mTotal').textContent = euro(t);
    $('#mCart').hidden = n === 0 || !$('#cartDone').hidden;
  }
  $('#cartLines').addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    delete cart[b.dataset.remove];
    if (b.dataset.remove === 'semaine') { weekly = false; $('#weekly').checked = false; }
    renderCart();
  });
  $('#order').addEventListener('click', () => {
    const { n, t } = totals();
    if (!n) return;
    $('#doneT').textContent = mode === 'casier' ? `Votre casier est réservé, ${slot.toLowerCase()}` : `À retirer ${slot.toLowerCase()}`;
    $('#doneTxt').textContent = `${n} panier${n > 1 ? 's' : ''}, ${euro(t)}. ${mode === 'casier' ? 'Le code du casier vous arrive par SMS dès que la commande est prête.' : 'Un SMS vous prévient dès que la commande est prête au comptoir.'}${weekly ? ' Votre panier de la semaine sera prêt au même créneau chaque semaine.' : ''}`;
    $('#cartForm').hidden = true;
    $('#cartDone').hidden = false;
    $('#mCart').hidden = true;
    $('#again').focus();
  });
  $('#again').addEventListener('click', () => {
    Object.keys(cart).forEach((k) => delete cart[k]);
    weekly = false; $('#weekly').checked = false;
    $('#cartDone').hidden = true; $('#cartForm').hidden = false;
    renderCart();
  });

  /* ---------- Lettre d'info ---------- */
  $('#newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#newsMail').value.trim();
    $('#newsMsg').textContent = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
      ? 'C’est noté (démonstration) : le prochain carnet arrive début du mois.'
      : 'Entrez une adresse e-mail valide, par exemple nom@domaine.fr.';
  });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Odette', accent: '2F5D3A' };
  const p = new URLSearchParams(location.search);
  const st = { nom: (p.get('nom') || DEF.nom).slice(0, 24), accent: /^[0-9a-f]{6}$/i.test(p.get('accent') || '') ? p.get('accent').toUpperCase() : DEF.accent };
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
    document.title = `${st.nom} · Épicerie de quartier`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#1F2A1D');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (open) => { cz.hidden = !open; czBtn.setAttribute('aria-expanded', String(open)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Odette rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  renderSlots();
  renderCart();
  apply(false);
})();

/* Démo caviste · BuildWebAI
   Click & Collect : filtres, panier, créneau de retrait, confirmation (démonstration, rien n'est envoyé).
   Panneau « Personnaliser » : ?nom=…&accent=7A2235 ; &presentation=1 masque le panneau. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${n.toFixed(2).replace('.', ',')} €`;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const WINES = [
    { id: 'morgon', name: 'Morgon « Côte du Py »', region: 'Beaujolais · Gamay · 2022', color: 'Rouge', price: 21.5, dot: '#7B1E2B' },
    { id: 'cdr', name: 'Côtes-du-Rhône', region: 'Rhône sud · Grenache · 2023', color: 'Rouge', price: 12.9, dot: '#7B1E2B' },
    { id: 'cornas', name: 'Cornas', region: 'Rhône nord · Syrah · 2020', color: 'Rouge', price: 46, dot: '#4A0F1C' },
    { id: 'stjoseph', name: 'Saint-Joseph blanc', region: 'Rhône nord · Marsanne · 2022', color: 'Blanc', price: 27, dot: '#D9C27A' },
    { id: 'chablis', name: 'Chablis premier cru Vaillons', region: 'Bourgogne · Chardonnay · 2021', color: 'Blanc', price: 34, dot: '#D9C27A' },
    { id: 'muscadet', name: 'Muscadet sur lie', region: 'Loire · Melon de Bourgogne · 2023', color: 'Blanc', price: 11.5, dot: '#E3D9A0' },
    { id: 'bandol', name: 'Bandol rosé', region: 'Provence · Mourvèdre · 2023', color: 'Rosé', price: 24, dot: '#E7A1A0' },
    { id: 'cremant', name: 'Crémant du Jura brut nature', region: 'Jura · Chardonnay', color: 'Bulles', price: 18.9, dot: '#EFE3B8' },
  ];
  const cart = { morgon: 2 };
  let filter = 'Tous';
  let slot = "aujourd'hui à 18 h";

  /* ---------- Liste des vins ---------- */
  function renderWines() {
    const shown = WINES.filter((w) => filter === 'Tous' || w.color === filter);
    $('#wines').innerHTML = shown.map((w) => {
      const q = cart[w.id] || 0;
      const ctl = q
        ? `<div class="stepper"><button type="button" data-dec="${w.id}" aria-label="Retirer une bouteille de ${esc(w.name)}">−</button><span>${q}</span><button type="button" data-inc="${w.id}" aria-label="Ajouter une bouteille de ${esc(w.name)}">+</button></div>`
        : `<button type="button" class="add" data-inc="${w.id}" aria-label="Ajouter ${esc(w.name)} au panier">Ajouter</button>`;
      return `<li class="wine"><span class="dot" style="background:${w.dot}" aria-hidden="true"></span><div><span class="wine-name">${esc(w.name)}</span><span class="wine-region">${esc(w.region)}</span></div><span class="wine-price">${euro(w.price)}</span>${ctl}</li>`;
    }).join('');
  }
  $('#wines').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) cart[inc.dataset.inc] = (cart[inc.dataset.inc] || 0) + 1;
    else if (dec) { const id = dec.dataset.dec; cart[id] -= 1; if (cart[id] <= 0) delete cart[id]; }
    else return;
    const focusId = (inc || dec).dataset.inc || (inc || dec).dataset.dec;
    const kind = inc ? 'inc' : 'dec';
    render();
    const again = $(`[data-${kind}="${focusId}"]`) || $(`[data-inc="${focusId}"]`);
    if (again) again.focus();
  });
  $$('#filters [data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    $$('#filters [data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    renderWines();
  }));

  /* ---------- Panier ---------- */
  function renderCart() {
    const lines = WINES.filter((w) => cart[w.id]);
    const count = lines.reduce((a, w) => a + cart[w.id], 0);
    const total = lines.reduce((a, w) => a + cart[w.id] * w.price, 0);
    $('#cartLines').innerHTML = lines.map((w) => `<li><span>${cart[w.id]} × ${esc(w.name)}</span><span>${euro(cart[w.id] * w.price)}</span></li>`).join('');
    $('#cartEmpty').hidden = count > 0;
    $('#cartTotal').textContent = euro(total);
    $('#order').disabled = count === 0;
    $('#hdCount').textContent = count;
    $('#mCount').textContent = count;
    $('#mTotal').textContent = euro(total);
    $('#mCart').hidden = count === 0 || !$('#cartDone').hidden;
    return { count, total };
  }
  const render = () => { renderWines(); renderCart(); };
  $$('#slots [data-slot]').forEach((b) => b.addEventListener('click', () => {
    slot = b.dataset.slot;
    $$('#slots [data-slot]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  $('#order').addEventListener('click', () => {
    const { count, total } = renderCart();
    if (!count) return;
    $('#doneT').textContent = `Commande prête ${slot}`;
    $('#doneTxt').textContent = `${count} bouteille${count > 1 ? 's' : ''}, ${euro(total)}. Un SMS vous prévient dès qu'elles sont prêtes, rue Saint-Jean.`;
    $('#cartForm').hidden = true;
    $('#cartDone').hidden = false;
    $('#mCart').hidden = true;
    $('#again').focus();
  });
  $('#again').addEventListener('click', () => {
    Object.keys(cart).forEach((k) => delete cart[k]);
    $('#cartDone').hidden = true;
    $('#cartForm').hidden = false;
    render();
  });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Cave Ondine', accent: '7A2235' };
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
    document.title = `${st.nom} · Vins en Click & Collect`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#191617');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (open) => { cz.hidden = !open; czBtn.setAttribute('aria-expanded', String(open)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Cave Ondine rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const link = new URL(url(true), location.href).href;
    try { await navigator.clipboard.writeText(link); $('#czStatus').textContent = 'Lien copié : il s’ouvre sans ce panneau.'; }
    catch { $('#czStatus').textContent = link; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cz.hidden) { setCz(false); czBtn.focus(); } });

  render();
  apply(false);
})();

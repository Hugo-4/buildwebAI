/* Démo club de sport · BuildWebAI
   Affluence en direct, planning réservable (séance à l'unité ou incluse), formules + options, packs coaching,
   bar en Click & Collect, carte cadeau, parrainage, essai gratuit, panier unique en tiroir,
   panneau « Personnaliser » (?nom=…&accent=2B3FE0 ; &presentation=1). */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} €`;
  const now = new Date();
  const H = now.getHours() + now.getMinutes() / 60;

  /* ---------- Panier unique ---------- */
  const cart = new Map(); // key -> { label, sub, now, monthly, qty }
  const DROP_IN = 12;

  /* ---------- Affluence ---------- */
  const level = H < 6 || H >= 23 ? 0 : (H >= 18 && H < 21) ? 4 : (H >= 7 && H < 9) || (H >= 12 && H < 14) ? 3 : (H >= 17 && H < 22) ? 2 : 1;
  $$('.crowd-bars i').forEach((b, i) => b.classList.toggle('on', i < level));
  $('#crowdTxt').textContent = level === 0 ? 'Fermé · réouverture à 6 h' : `Affluence en ce moment : ${['', 'calme', 'normale', 'soutenue', 'heure de pointe'][level]}`;

  /* ---------- Planning ---------- */
  const T = [
    { id: 'cross', n: 'Cross training', coach: 'Malik', d: 45, cap: 16 },
    { id: 'yoga', n: 'Yoga vinyasa', coach: 'Inès', d: 60, cap: 20 },
    { id: 'pilates', n: 'Pilates', coach: 'Inès', d: 45, cap: 14 },
    { id: 'force', n: 'Force & technique', coach: 'Théo', d: 60, cap: 10 },
    { id: 'cardio', n: 'Cardio HIIT', coach: 'Malik', d: 30, cap: 18 },
  ];
  const TIMES = [7, 12.5, 18, 19.25, 20.5];
  const hh = (t) => `${Math.floor(t)} h${t % 1 ? ` ${String(Math.round((t % 1) * 60)).padStart(2, '0')}` : ''}`;
  const DAYS = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() + i); return d; });
  const dayName = (d, i) => (i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'long' }));
  let day = 0;
  const taken = (i, j, cap) => Math.min(cap, Math.floor(((i * 7 + j * 13 + DAYS[i].getDate()) * 37) % (cap + 4)));
  function renderDays() {
    $('#days').innerHTML = DAYS.map((d, i) => `<button type="button" role="tab" aria-selected="${i === day}" tabindex="${i === day ? 0 : -1}" data-day="${i}" aria-label="${dayName(d, i)} ${d.getDate()}">${d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}<b>${d.getDate()}</b></button>`).join('');
  }
  function renderClasses() {
    $('#classes').setAttribute('aria-label', `Cours de ${dayName(DAYS[day], day).toLowerCase()}`);
    $('#classes').innerHTML = TIMES.map((t, j) => {
      const c = T[(day + j) % T.length];
      const key = `cls:${day}:${j}`;
      const left = c.cap - taken(day, j, c.cap);
      const past = day === 0 && t <= H;
      const on = cart.has(key);
      const btn = past ? '<button type="button" class="book" disabled>Terminé</button>'
        : left <= 0 && !on ? '<button type="button" class="book" disabled>Complet</button>'
        : `<button type="button" class="book" data-book="${key}" data-i="${j}" aria-pressed="${on}">${on ? 'Réservé ✓' : 'Réserver'}</button>`;
      return `<li class="cls">
        <span class="cls-time">${hh(t)}</span>
        <img class="cls-img" src="img/${c.id}-200.webp" alt="" width="64" height="64" loading="lazy" decoding="async">
        <div class="cls-txt"><p class="cls-name">${c.n}</p><p class="cls-meta">${c.d} min · avec ${c.coach}</p></div>
        <div class="spots${left <= 3 ? ' low' : ''}"><span>${left <= 0 ? 'Complet' : `${left} place${left > 1 ? 's' : ''} sur ${c.cap}`}</span><span class="spots-bar"><i style="transform:scaleX(${(c.cap - Math.max(left, 0)) / c.cap})"></i></span></div>
        ${btn}
      </li>`;
    }).join('');
  }
  $('#days').addEventListener('click', (e) => { const b = e.target.closest('[data-day]'); if (b) { day = +b.dataset.day; renderDays(); renderClasses(); } });
  $('#days').addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault(); day = (day + d + 7) % 7; renderDays(); renderClasses(); $(`[data-day="${day}"]`).focus();
  });
  $('#classes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (!b) return;
    const key = b.dataset.book;
    if (cart.has(key)) cart.delete(key);
    else {
      const c = T[(day + +b.dataset.i) % T.length];
      cart.set(key, { label: c.n, sub: `${dayName(DAYS[day], day)} ${DAYS[day].getDate()} · ${hh(TIMES[+b.dataset.i])}`, now: DROP_IN, kind: 'cls' });
    }
    renderClasses(); renderCart();
    $(`[data-book="${key}"]`)?.focus();
  });

  /* ---------- Formules ---------- */
  const PLANS = [
    { id: 'essentiel', n: 'Essentiel', p: 29, items: ['Plateau muscu et cardio', '6 h – 23 h, 7 jours sur 7', 'Application et programme de départ'] },
    { id: 'illimite', n: 'Illimité', p: 45, best: true, items: ['Tout Essentiel', 'Les 40 cours collectifs inclus', 'Réservation 7 jours à l’avance'] },
    { id: 'premium', n: 'Premium', p: 69, items: ['Tout Illimité', '1 séance de coaching par mois', 'Serviette et casier inclus'] },
  ];
  let eng = 0;
  const price = (p) => (eng ? Math.round(p * 0.8) : p);
  function renderPlans() {
    const cur = cart.get('plan');
    $('#plans').innerHTML = PLANS.map((p) => `
      <article class="plan-c${p.best ? ' is-best' : ''}">
        ${p.best ? '<span class="plan-tag">Le plus choisi</span>' : ''}
        <h3>${p.n}</h3>
        <p class="plan-price"><b>${price(p.p)}&nbsp;€</b><span class="muted">/ mois${eng ? ', 12 mois' : ''}</span></p>
        <ul class="plan-list">${p.items.map((x) => `<li>${x}</li>`).join('')}</ul>
        <button type="button" class="btn ${cur?.id === p.id ? '' : 'btn--accent'} btn--full" data-plan="${p.id}" aria-pressed="${cur?.id === p.id}">${cur?.id === p.id ? 'Dans le panier ✓' : `Choisir ${p.n}`}</button>
      </article>`).join('');
  }
  $$('[data-eng]').forEach((b) => b.addEventListener('click', () => {
    eng = +b.dataset.eng;
    $$('[data-eng]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const cur = cart.get('plan');
    if (cur) { const p = PLANS.find((x) => x.id === cur.id); setPlan(p); }
    renderPlans(); renderCart();
  }));
  function setPlan(p) {
    cart.set('plan', { id: p.id, label: `Formule ${p.n}`, sub: eng ? 'Engagement 12 mois' : 'Sans engagement, résiliable en ligne', now: price(p.p), monthly: price(p.p), kind: 'plan' });
  }
  $('#plans').addEventListener('click', (e) => {
    const b = e.target.closest('[data-plan]');
    if (!b) return;
    const p = PLANS.find((x) => x.id === b.dataset.plan);
    if (cart.get('plan')?.id === p.id) cart.delete('plan'); else setPlan(p);
    renderPlans(); renderCart(); renderClasses();
    $(`[data-plan="${p.id}"]`).focus();
  });
  const EXTRAS = { casier: { label: 'Casier à l’année', now: 5, monthly: 5 }, serviette: { label: 'Serviette fournie', now: 4, monthly: 4 }, bilan: { label: 'Bilan corporel et programme', now: 39 } };
  $$('.extras input').forEach((i) => i.addEventListener('change', () => {
    if (i.checked) cart.set(`x:${i.value}`, { ...EXTRAS[i.value], kind: 'extra' }); else cart.delete(`x:${i.value}`);
    renderCart();
  }));

  /* ---------- Coaching ---------- */
  const PACKS = [{ n: 1, p: 45 }, { n: 5, p: 199 }, { n: 10, p: 360 }];
  let pack = 1;
  function renderPacks() {
    $('#packs').innerHTML = PACKS.map((k, i) => `<button type="button" role="radio" aria-checked="${i === pack}" data-pack="${i}"><b>${k.n} séance${k.n > 1 ? 's' : ''}</b><span>${euro(k.p)}${k.n > 1 ? ` · ${euro(k.p / k.n)} la séance` : ''}</span></button>`).join('');
    const k = PACKS[pack];
    $('#packSum').textContent = k.n > 1 ? `Vous économisez ${euro(45 * k.n - k.p)} par rapport à la séance à l'unité.` : 'La première séance comprend un bilan de 15 minutes.';
  }
  $('#packs').addEventListener('click', (e) => { const b = e.target.closest('[data-pack]'); if (b) { pack = +b.dataset.pack; renderPacks(); $(`[data-pack="${pack}"]`).focus(); } });
  $('#addPack').addEventListener('click', () => {
    const k = PACKS[pack];
    cart.set('coach', { label: `Coaching · ${k.n} séance${k.n > 1 ? 's' : ''}`, sub: 'Créneau à choisir avec votre coach', now: k.p, kind: 'coach' });
    renderCart(); openCart();
  });

  /* ---------- Bar ---------- */
  const MENU = [
    { id: 'shake', n: 'Shake protéiné', d: 'Whey, lait d’avoine, banane ou cacao.', p: 4.5 },
    { id: 'barre', n: 'Barre protéinée', d: 'Chocolat noir et noisettes, 20 g de protéines.', p: 2.9 },
    { id: 'bowl', n: 'Bowl de récupération', d: 'Quinoa, légumes croquants, graines. Pour après la séance du midi.', p: 8.9 },
  ];
  function renderMenu() {
    $('#menu').innerHTML = MENU.map((m) => {
      const q = cart.get(`bar:${m.id}`)?.qty || 0;
      return `<article class="item">
        <div class="item-img"><img src="img/${m.id}-600.webp" srcset="img/${m.id}-400.webp 400w, img/${m.id}-600.webp 600w" sizes="(min-width: 860px) 33vw, 40vw" alt="" width="600" height="600" loading="lazy" decoding="async"></div>
        <div class="item-body"><h3>${m.n}</h3><p>${m.d}</p>
          <div class="item-foot"><span class="item-price">${euro(m.p)}</span><button type="button" class="add" data-bar="${m.id}" data-n="${q}">${q ? `Ajouté · ${q}` : 'Ajouter'}</button></div></div>
      </article>`;
    }).join('');
  }
  $('#menu').addEventListener('click', (e) => {
    const b = e.target.closest('[data-bar]');
    if (!b) return;
    const m = MENU.find((x) => x.id === b.dataset.bar);
    const cur = cart.get(`bar:${m.id}`);
    cart.set(`bar:${m.id}`, { label: m.n, sub: 'Prêt au bar à la fin de votre séance', now: m.p, qty: (cur?.qty || 0) + 1, kind: 'bar' });
    renderMenu(); renderCart(); $(`[data-bar="${m.id}"]`).focus();
  });

  /* ---------- Carte cadeau et parrainage ---------- */
  const GIFTS = [30, 50, 100];
  let gift = 1;
  const renderGifts = () => { $('#gifts').innerHTML = GIFTS.map((g, i) => `<button type="button" role="radio" aria-checked="${i === gift}" data-gift="${i}">${g}&nbsp;€</button>`).join(''); };
  $('#gifts').addEventListener('click', (e) => { const b = e.target.closest('[data-gift]'); if (b) { gift = +b.dataset.gift; renderGifts(); $(`[data-gift="${gift}"]`).focus(); } });
  $('#addGift').addEventListener('click', () => {
    cart.set(`gift:${GIFTS[gift]}`, { label: `Carte cadeau ${GIFTS[gift]} €`, sub: 'Envoyée par e-mail, valable un an', now: GIFTS[gift], qty: (cart.get(`gift:${GIFTS[gift]}`)?.qty || 0) + 1, kind: 'gift' });
    renderCart(); openCart();
  });
  $('#copyRef').addEventListener('click', async () => {
    const link = `${location.origin}${location.pathname}?parrain=${$('#refCode').textContent}`;
    try { await navigator.clipboard.writeText(link); $('#refMsg').textContent = 'Lien copié : envoyez-le à votre ami.'; }
    catch { $('#refMsg').textContent = link; }
  });

  /* ---------- Essai gratuit ---------- */
  const TRIAL = [1, 2, 3].map((i) => { const d = new Date(now); d.setDate(d.getDate() + i); return `${i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase())} ${i === 2 ? '12 h 30' : '18 h'}`; });
  let tw = 0;
  const renderTrial = () => { $('#tWhen').innerHTML = TRIAL.map((t, i) => `<button type="button" role="radio" aria-checked="${i === tw}" data-tw="${i}">${t}</button>`).join(''); };
  $('#tWhen').addEventListener('click', (e) => { const b = e.target.closest('[data-tw]'); if (b) { tw = +b.dataset.tw; renderTrial(); $(`[data-tw="${tw}"]`).focus(); } });
  $('#trialForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#tName'), t = $('#tTel');
    const okN = n.value.trim().length > 1, okT = /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(t.value.trim());
    n.setAttribute('aria-invalid', String(!okN)); t.setAttribute('aria-invalid', String(!okT));
    const msg = $('#tMsg');
    if (!okN || !okT) { msg.className = 'form-msg err'; msg.textContent = !okN ? 'Indiquez votre prénom.' : 'Indiquez un numéro au format 06 12 34 56 78.'; (!okN ? n : t).focus(); return; }
    msg.className = 'form-msg';
    msg.textContent = `C'est noté, ${n.value.trim()} : rendez-vous ${TRIAL[tw].toLowerCase()} à l'accueil. Un SMS de confirmation part tout de suite (démonstration).`;
  });

  /* ---------- Panier : rendu et tiroir ---------- */
  const hasCourses = () => ['illimite', 'premium'].includes(cart.get('plan')?.id);
  function totals() {
    let n = 0, t = 0, m = 0;
    cart.forEach((it) => {
      const q = it.qty || 1;
      n += q;
      const free = it.kind === 'cls' && hasCourses();
      t += free ? 0 : it.now * q;
      m += (it.monthly || 0) * q;
    });
    return { n, t, m };
  }
  function renderCart() {
    $('#cartLines').innerHTML = [...cart].map(([k, it]) => {
      const q = it.qty || 1;
      const free = it.kind === 'cls' && hasCourses();
      return `<li><span>${q > 1 ? `${q} × ` : ''}${it.label}${it.sub ? `<small>${it.sub}</small>` : ''}<button type="button" data-remove="${k}">retirer</button></span><span>${free ? 'inclus' : euro(it.now * q)}${it.monthly ? '<small>1er mois</small>' : ''}</span></li>`;
    }).join('') || '<li class="muted">Votre panier est vide.</li>';
    const { n, t, m } = totals();
    $('#cartNow').textContent = euro(t);
    $('#cartMonthly').textContent = m ? `Puis ${euro(m)} par mois, prélevés le 1er. Frais d'inscription offerts en ligne.` : '';
    $('#pay').disabled = n === 0;
    $('#cCount').textContent = n;
    $('#cTotal').textContent = euro(t);
    $('#cartBtn').hidden = n === 0 || !$('#cart').hidden;
  }
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
    (lastFocus && document.contains(lastFocus) && lastFocus !== document.body ? lastFocus : $('#contenu')).focus?.();
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
    const k = b.dataset.remove;
    cart.delete(k);
    if (k.startsWith('x:')) $(`.extras input[value="${k.slice(2)}"]`).checked = false;
    renderAll();
    $('#cartClose').focus();
  });
  $('#pay').addEventListener('click', () => {
    const { n, t, m } = totals();
    if (!n) return;
    const bits = [];
    if (cart.has('plan')) bits.push('Votre badge d’accès est activé dans l’application : présentez-le à l’entrée.');
    if ([...cart.values()].some((x) => x.kind === 'cls')) bits.push('Vos places aux cours sont réservées, un rappel vous arrive 2 h avant.');
    if ([...cart.keys()].some((k) => k.startsWith('bar:'))) bits.push('Votre commande vous attend au bar à la fin de la séance.');
    if (cart.has('coach')) bits.push('Votre coach vous écrit sous 24 h pour fixer le premier créneau.');
    if ([...cart.keys()].some((k) => k.startsWith('gift:'))) bits.push('La carte cadeau part par e-mail avec votre message.');
    $('#doneT').textContent = `Paiement de ${euro(t)} validé`;
    $('#doneTxt').textContent = `${bits.join(' ')}${m ? ` Prochain prélèvement : ${euro(m)} le 1er du mois.` : ''} (Démonstration : aucun débit.)`;
    cart.clear();
    $$('.extras input').forEach((i) => { i.checked = false; });
    $('#cartForm').hidden = true; $('#cartDone').hidden = false;
    renderAll();
    $('#again').focus();
  });
  $('#again').addEventListener('click', closeCart);
  function renderAll() { renderClasses(); renderPlans(); renderMenu(); renderCart(); }

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Halle 9', accent: '2B3FE0' };
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
    document.title = `${st.nom} · Club de sport`;
    $('#refCode').textContent = `${st.nom.toUpperCase().replace(/[^A-Z0-9]+/g, '')}-CAMILLE`;
    root.style.setProperty('--accent', `#${st.accent}`);
    const L = lum(st.accent);
    root.style.setProperty('--on-accent', 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? '#FFFFFF' : '#101317');
    $('#czNom').value = st.nom; $('#czAccent').value = `#${st.accent}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (o) => { cz.hidden = !o; czBtn.setAttribute('aria-expanded', String(o)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czAccent').addEventListener('input', (e) => { st.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Halle 9 rétablie.'; });
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

  renderDays(); renderPacks(); renderGifts(); renderTrial();
  renderAll();
  apply(false);
})();

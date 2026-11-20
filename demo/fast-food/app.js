/* Démo fast-food · BuildWebAI
   Panier + sticky bar, réservation, chatbot IA (réponses de démonstration), inscription au club,
   panneau « Personnaliser » (?nom=…&c1=14254A&c2=F26A1B ; &presentation=1 masque le panneau). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const euro = (n) => `${n.toFixed(2).replace('.', ',')} €`;

  /* ---------- Panier ---------- */
  const cart = new Map([['Le Double Smash', { price: 12.9, qty: 1 }], ['Les Frites Maison', { price: 4.5, qty: 1 }]]);
  const barCount = $('#barCount');
  function renderCart(bump = false) {
    let n = 0, total = 0;
    const lines = [];
    cart.forEach((v, name) => { n += v.qty; total += v.qty * v.price; lines.push(`<li><span>${v.qty} × ${name}</span><span>${euro(v.qty * v.price)}</span></li>`); });
    barCount.textContent = n;
    $('#barTotal').textContent = euro(total);
    $('#cartTotal').textContent = euro(total);
    $('#cartLines').innerHTML = lines.join('');
    $('#cartEmpty').hidden = n > 0;
    $('#cartOrder').disabled = n === 0;
    if (bump) { barCount.classList.remove('bump'); void barCount.offsetWidth; barCount.classList.add('bump'); }
  }
  $$('[data-add]').forEach((b) => b.addEventListener('click', () => {
    const [name, price] = b.dataset.add.split('|');
    const cur = cart.get(name) || { price: +price, qty: 0 };
    cur.qty += 1;
    cart.set(name, cur);
    renderCart(true);
    const label = b.textContent;
    b.textContent = 'Ajouté ✓';
    setTimeout(() => { b.textContent = label; }, 1200);
  }));
  $('#cartOrder').addEventListener('click', () => {
    if (!cart.size) return;
    $('#cartFill').hidden = true;
    $('#cartDone').hidden = false;
    cart.clear();
    renderCart();
  });

  /* ---------- Fenêtres ---------- */
  const dialogs = { panier: $('#dlg-panier'), resa: $('#dlg-resa') };
  $$('[data-open]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    const d = dialogs[el.dataset.open];
    if (!d) return;
    if (el.dataset.open === 'panier') { $('#cartFill').hidden = false; $('#cartDone').hidden = true; }
    if (el.dataset.open === 'resa') resetResa();
    d.showModal ? d.showModal() : d.setAttribute('open', '');
  }));
  Object.values(dialogs).forEach((d) => {
    $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => d.close()));
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  });

  /* ---------- Réservation (démonstration) ---------- */
  const resDate = $('#resDate'), resName = $('#resName');
  function resetResa() {
    const t = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
    resDate.min = new Date().toISOString().slice(0, 10);
    if (!resDate.value) resDate.value = t;
    $('#resFields').hidden = false; $('#resDone').hidden = true; $('#resErr').hidden = true;
  }
  $('#resForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!resDate.value || !resName.value.trim()) { $('#resErr').hidden = false; (resDate.value ? resName : resDate).focus(); return; }
    const d = new Date(`${resDate.value}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const n = $('#resCovers').value;
    $('#resSummary').textContent = `${d} à ${$('#resTime').value.replace(':', 'h')}, ${n} personne${n > 1 ? 's' : ''}, au nom de ${resName.value.trim()}.`;
    $('#resFields').hidden = true; $('#resDone').hidden = false;
  });

  /* ---------- Chatbot IA (réponses de démonstration) ---------- */
  const botBtn = $('#botBtn'), bot = $('#bot'), log = $('#botLog');
  const ANSWERS = {
    allergenes: 'Le Double Smash contient du gluten (pain), du lait (cheddar) et de la moutarde. Le Crispy Chicken contient du gluten et des œufs. Nos frites sont sans gluten, cuites dans une huile dédiée.',
    horaires: 'Nous sommes ouverts 7 jours sur 7, de 11h30 à 23h, rue de la République. En ce moment, une commande est prête en 15 minutes.',
    menu: 'Je vous propose 2 Double Smash, 2 frites maison et 2 boissons : 39,80 €. Je l’ajoute au panier ?',
  };
  const say = (text, who) => {
    const li = document.createElement('li');
    li.className = `msg msg--${who}`;
    li.textContent = text;
    log.append(li);
    log.scrollTop = log.scrollHeight;
  };
  const reply = (text) => setTimeout(() => say(text, 'bot'), 500);
  function setBot(open) {
    bot.hidden = !open;
    botBtn.setAttribute('aria-expanded', String(open));
    botBtn.setAttribute('aria-label', open ? 'Fermer l’assistant' : 'Ouvrir l’assistant');
    if (open) $('#botInput').focus();
  }
  botBtn.addEventListener('click', () => setBot(bot.hidden));
  $('#botClose').addEventListener('click', () => { setBot(false); botBtn.focus(); });
  $$('[data-q]', bot).forEach((b) => b.addEventListener('click', () => { say(b.textContent, 'me'); reply(ANSWERS[b.dataset.q]); }));
  $('#botForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#botInput');
    const q = input.value.trim();
    if (!q) return;
    say(q, 'me');
    input.value = '';
    reply('Démonstration : sur votre site, l’assistant répond à partir de votre vraie carte, de vos horaires et de vos allergènes, et peut prendre la commande.');
  });

  /* ---------- Club ---------- */
  $('#clubForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#clubMail').value.trim();
    $('#clubMsg').textContent = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
      ? 'Bienvenue au club (démonstration) : votre burger offert vous attend au comptoir.'
      : 'Entrez une adresse e-mail valide, par exemple nom@domaine.fr.';
  });

  /* ---------- Personnalisation ---------- */
  const DEF = { nom: 'Smash Club', c1: '14254A', c2: 'F26A1B' };
  const p = new URLSearchParams(location.search);
  const hex = (v, d) => (/^[0-9a-f]{6}$/i.test(v || '') ? v.toUpperCase() : d);
  const st = { nom: (p.get('nom') || DEF.nom).slice(0, 24), c1: hex(p.get('c1'), DEF.c1), c2: hex(p.get('c2'), DEF.c2) };
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
    document.title = `${st.nom} · Street food`;
    root.style.setProperty('--navy', `#${st.c1}`);
    root.style.setProperty('--orange', `#${st.c2}`);
    // texte posé sur chaque couleur : blanc ou bleu nuit, celui qui contraste le plus
    const onColor = (h) => { const L = lum(h); return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.0697) ? '#FFFFFF' : '#14254A'; };
    root.style.setProperty('--on-navy', onColor(st.c1));
    root.style.setProperty('--on-orange', onColor(st.c2));
    // version foncée de l'accent pour l'écriture manuscrite sur fond clair
    const dark = [0, 2, 4].map((i) => Math.round(parseInt(st.c2.slice(i, i + 2), 16) * 0.72).toString(16).padStart(2, '0')).join('');
    root.style.setProperty('--orange-ink', `#${dark}`);
    $('#czNom').value = st.nom; $('#czC1').value = `#${st.c1}`; $('#czC2').value = `#${st.c2}`;
    if (push) history.replaceState(null, '', url(false));
  }
  const czBtn = $('#czBtn'), cz = $('#cz');
  const setCz = (open) => { cz.hidden = !open; czBtn.setAttribute('aria-expanded', String(open)); };
  czBtn.addEventListener('click', () => setCz(cz.hidden));
  $('#czClose').addEventListener('click', () => { setCz(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { st.nom = e.target.value.trim() || DEF.nom; apply(); });
  $('#czC1').addEventListener('input', (e) => { st.c1 = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czC2').addEventListener('input', (e) => { st.c2 = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czReset').addEventListener('click', () => { Object.assign(st, DEF); apply(); $('#czStatus').textContent = 'Version Smash Club rétablie.'; });
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

  renderCart();
  apply(false);
})();

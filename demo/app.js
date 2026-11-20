/* Démo restaurant · BuildWebAI
   - menu plein écran, fenêtres Réserver et Carte, « Lire la suite »
   - panneau « Personnaliser » : nom, ville, couleur, fond et police, repris dans l'adresse de la page
     (?nom=…&ville=…&accent=7A1F22&fond=creme&police=cormorant ; &presentation=1 masque le panneau) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- Menu plein écran ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  function setNav(open) {
    burger.setAttribute('aria-expanded', String(open));
    if (open) {
      nav.hidden = false;
      requestAnimationFrame(() => nav.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    } else {
      nav.classList.remove('is-open');
      nav.hidden = true;
      document.body.style.overflow = '';
    }
  }
  burger.addEventListener('click', () => setNav(nav.hidden));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));

  /* ---------- Fenêtres : réservation et carte ---------- */
  const dialogs = { reserver: $('#dlg-reserver'), carte: $('#dlg-carte') };
  function openDialog(name, section) {
    const d = dialogs[name];
    if (!d) return;
    setNav(false);
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    if (name === 'carte' && section) {
      const target = $(`#c-${section}`, d);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
    if (name === 'reserver') resetReservation();
  }
  $$('[data-open]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    openDialog(el.dataset.open, el.dataset.section);
  }));
  Object.values(dialogs).forEach((d) => {
    $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => d.close()));
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  });

  /* ---------- Réservation (démonstration, rien n'est envoyé) ---------- */
  const resForm = $('#resForm'), resDate = $('#resDate'), resName = $('#resName');
  const iso = (d) => d.toISOString().slice(0, 10);
  function resetReservation() {
    const tomorrow = new Date(Date.now() + 864e5);
    resDate.min = iso(new Date());
    if (!resDate.value) resDate.value = iso(tomorrow);
    $('#resFields').hidden = false;
    $('#resDone').hidden = true;
    $('#resErr').hidden = true;
  }
  resForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!resDate.value || !resName.value.trim()) {
      $('#resErr').hidden = false;
      (resDate.value ? resName : resDate).focus();
      return;
    }
    const date = new Date(`${resDate.value}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const n = $('#resCovers').value;
    $('#resSummary').textContent = `${date} à ${$('#resTime').value.replace(':', 'h')}, ${n} couvert${n > 1 ? 's' : ''}, au nom de ${resName.value.trim()}.`;
    $('#resFields').hidden = true;
    $('#resDone').hidden = false;
    $('#resDone .btn').focus();
  });

  /* ---------- Lire la suite ---------- */
  const moreBtn = $('#moreBtn'), more = $('#more');
  moreBtn.addEventListener('click', () => {
    const open = more.hidden;
    more.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
    moreBtn.textContent = open ? 'Réduire' : 'Lire la suite';
  });

  /* ---------- Personnalisation ---------- */
  const DEFAULTS = { nom: 'Maison Aurèle', ville: 'Lyon', accent: '7A1F22', fond: 'creme', police: 'cormorant' };
  const FONDS = ['creme', 'ivoire', 'sable', 'blanc', 'nuit'];
  const POLICES = {
    cormorant: { family: '"Cormorant Garamond", Georgia, serif', css: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500', scale: 1.12 },
    playfair: { family: '"Playfair Display", Georgia, serif', css: 'Playfair+Display:ital,wght@0,400;0,500;1,400;1,500', scale: 0.92 },
    dmserif: { family: '"DM Serif Display", Georgia, serif', css: 'DM+Serif+Display:ital@0;1', scale: 0.92 },
    fraunces: { family: '"Fraunces", Georgia, serif', css: 'Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400', scale: 0.94 },
  };
  const params = new URLSearchParams(location.search);
  const state = {
    nom: (params.get('nom') || DEFAULTS.nom).slice(0, 40),
    ville: (params.get('ville') || DEFAULTS.ville).slice(0, 30),
    accent: /^[0-9a-f]{6}$/i.test(params.get('accent') || '') ? params.get('accent').toUpperCase() : DEFAULTS.accent,
    fond: FONDS.includes(params.get('fond')) ? params.get('fond') : DEFAULTS.fond,
    police: POLICES[params.get('police')] ? params.get('police') : DEFAULTS.police,
  };
  if (params.get('presentation') === '1') root.classList.add('is-presentation');

  const lum = (hex) => {
    const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const loadedFonts = new Set(['cormorant']);
  function loadFont(key) {
    if (loadedFonts.has(key)) return;
    loadedFonts.add(key);
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${POLICES[key].css}&display=swap`;
    document.head.append(l);
  }

  function apply(updateUrl = true) {
    $$('[data-bind="nom"]').forEach((el) => { el.textContent = state.nom; });
    $$('[data-bind="ville"]').forEach((el) => { el.textContent = state.ville; });
    document.title = `${state.nom} · Restaurant à ${state.ville}`;
    root.style.setProperty('--accent', `#${state.accent}`);
    root.style.setProperty('--on-accent', lum(state.accent) > 0.4 ? '#1E1A15' : '#FFFFFF');
    if (state.fond === 'creme') root.removeAttribute('data-fond'); else root.dataset.fond = state.fond;
    loadFont(state.police);
    root.style.setProperty('--serif', POLICES[state.police].family);
    root.style.setProperty('--serif-scale', POLICES[state.police].scale);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#F4EEE4';
    // contrôles du panneau
    $('#czNom').value = state.nom;
    $('#czVille').value = state.ville;
    $('#czAccent').value = `#${state.accent}`;
    $('#czPolice').value = state.police;
    $$('[data-accent]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.accent === state.accent)));
    $$('[data-fond]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fond === state.fond)));
    if (updateUrl) history.replaceState(null, '', shareUrl(false));
  }
  function shareUrl(presentation) {
    const p = new URLSearchParams();
    Object.keys(DEFAULTS).forEach((k) => { if (state[k] !== DEFAULTS[k]) p.set(k, state[k]); });
    if (presentation) p.set('presentation', '1');
    const q = p.toString();
    return `${location.pathname}${q ? `?${q}` : ''}${location.hash}`;
  }

  const czBtn = $('#czBtn'), cz = $('#cz'), czStatus = $('#czStatus');
  function setPanel(open) {
    cz.hidden = !open;
    czBtn.setAttribute('aria-expanded', String(open));
    if (open) $('#czNom').focus();
  }
  czBtn.addEventListener('click', () => setPanel(cz.hidden));
  $('#czClose').addEventListener('click', () => { setPanel(false); czBtn.focus(); });
  $('#czNom').addEventListener('input', (e) => { state.nom = e.target.value.trim() || DEFAULTS.nom; apply(); });
  $('#czVille').addEventListener('input', (e) => { state.ville = e.target.value.trim() || DEFAULTS.ville; apply(); });
  $('#czAccent').addEventListener('input', (e) => { state.accent = e.target.value.slice(1).toUpperCase(); apply(); });
  $('#czPolice').addEventListener('change', (e) => { state.police = e.target.value; apply(); });
  $$('[data-accent]').forEach((b) => b.addEventListener('click', () => { state.accent = b.dataset.accent; apply(); }));
  $$('[data-fond]').forEach((b) => b.addEventListener('click', () => { state.fond = b.dataset.fond; apply(); }));
  $('#czReset').addEventListener('click', () => { Object.assign(state, DEFAULTS); apply(); czStatus.textContent = 'Version Maison Aurèle rétablie.'; });
  $('#czCopy').addEventListener('click', async () => {
    const url = new URL(shareUrl(true), location.href).href;
    try {
      await navigator.clipboard.writeText(url);
      czStatus.textContent = 'Lien copié : il s’ouvre sans ce panneau.';
    } catch {
      czStatus.textContent = url;
    }
  });

  /* ---------- Échap ferme ce qui est ouvert ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!nav.hidden) { setNav(false); burger.focus(); }
    if (!cz.hidden) { setPanel(false); czBtn.focus(); }
  });

  apply(false);
})();

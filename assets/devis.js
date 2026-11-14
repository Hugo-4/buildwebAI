/* BuildWebAI — questionnaire de devis multi-étapes
   Envoi : POST application/json vers le relais same-origin api/devis.php, qui transmet le même JSON
   au webhook Airtable côté serveur (le webhook ne répond pas aux requêtes CORS d'un navigateur).
   Mouvement : transform et opacity uniquement (Web Animations API), sorties plus courtes que les entrées. */
(() => {
  const ENDPOINT = 'api/devis.php';
  const CONTACT = 'contact@build-web-ai.com';

  // Les clés exactes attendues par le mapping Airtable, toujours toutes envoyées
  const KEYS = [
    'nom_etablissement', 'role', 'activite', 'localisation', 'email', 'deja_site', 'url_site',
    'type_offre',
    'noms_logiciels', 'frustration', 'objectif', 'taille_site', 'temps_perdu', 'delai', 'budget', 'exemples', 'commentaires_sur_mesure',
    'starter_description', 'starter_domaine', 'starter_couleurs', 'starter_style', 'starter_drive', 'starter_structure', 'commentaires_starter',
    'outils', 'assets', 'reves',
  ];
  const BRANCH = {
    sur_mesure: ['noms_logiciels', 'frustration', 'objectif', 'taille_site', 'temps_perdu', 'delai', 'budget', 'exemples', 'commentaires_sur_mesure'],
    starter: ['starter_description', 'starter_domaine', 'starter_couleurs', 'starter_style', 'starter_drive', 'starter_structure', 'commentaires_starter'],
  };
  const STEP_NAMES = ['Identité et établissement', 'Choix de la formule', 'Votre projet', 'Écosystème et ambitions'];
  const REQUIRED = {
    1: ['nom_etablissement', 'role', 'activite', 'localisation', 'email', 'deja_site'],
    2: ['type_offre'],
    sur_mesure: ['frustration', 'objectif', 'delai', 'budget'],
    starter: ['starter_description'],
    4: [],
  };
  const MESSAGES = {
    nom_etablissement: 'Indiquez le nom de votre établissement.',
    role: 'Indiquez votre rôle dans l’établissement.',
    activite: 'Choisissez votre type d’activité.',
    localisation: 'Indiquez votre ville ou votre quartier.',
    email: 'Entrez une adresse email valide, par exemple nom@domaine.fr.',
    deja_site: 'Dites-nous si vous avez déjà un site.',
    url_site: 'Indiquez l’adresse de votre site actuel.',
    type_offre: 'Choisissez une formule pour continuer.',
    frustration: 'Décrivez en quelques mots ce qui vous freine aujourd’hui.',
    objectif: 'Choisissez votre objectif principal.',
    delai: 'Choisissez un délai de lancement.',
    budget: 'Choisissez une fourchette de budget.',
    starter_description: 'Décrivez votre établissement en une ou deux phrases.',
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const form = document.getElementById('dvForm');
  if (!form) return;
  const $ = (s, r = form) => r.querySelector(s);
  const $$ = (s, r = form) => [...r.querySelectorAll(s)];
  const nextBtn = $('#dvNext'), backBtn = $('#dvBack'), label = $('.dv-label', nextBtn);
  const sendErr = $('#dvSendErr'), done = $('#dvDone'), bar = $('#dvBar'), progressText = $('#dvProgressText');
  let step = 1;
  let sending = false;

  const ease = { out: 'cubic-bezier(.23, 1, .32, 1)', in: 'cubic-bezier(.55, 0, 1, .45)' };
  const anim = (el, frames, opts) => (reduce || !el.animate ? Promise.resolve() : el.animate(frames, { fill: 'both', ...opts }).finished.catch(() => {}));

  /* ---------- Lecture des valeurs ---------- */
  const val = (name) => {
    const els = form.elements[name];
    if (!els) return '';
    if (els instanceof RadioNodeList || (els.length !== undefined && !els.tagName)) {
      const list = [...els];
      if (list[0]?.type === 'checkbox') return list.filter((e) => e.checked).map((e) => e.value).join(','); // format Airtable : « logo,photos »
      return list.find((e) => e.checked)?.value || '';
    }
    if (els.type === 'checkbox') return els.checked ? els.value : '';
    return (els.value || '').trim();
  };
  const offer = () => val('type_offre');

  function payload() {
    const data = {};
    KEYS.forEach((k) => { data[k] = val(k); });
    if (data.deja_site !== 'oui') data.url_site = '';
    const other = data.type_offre === 'starter' ? 'sur_mesure' : 'starter';
    if (data.type_offre) BRANCH[other].forEach((k) => { data[k] = ''; });
    return data;
  }

  /* ---------- Étapes ---------- */
  const panelFor = (n) => (n === 3 ? $(`.dv-panel[data-step="3"][data-branch="${offer() || 'sur_mesure'}"]`) : $(`.dv-panel[data-step="${n}"]`));

  function paintProgress() {
    bar.style.transform = `scaleX(${step / 4})`;
    $$('[data-step-dot]').forEach((d) => {
      const n = +d.dataset.stepDot;
      d.classList.toggle('is-current', n === step);
      d.classList.toggle('is-done', n < step);
    });
    progressText.textContent = `Étape ${step} sur 4 · ${STEP_NAMES[step - 1]}`;
    backBtn.hidden = step === 1;
    label.textContent = step === 4 ? 'Envoyer ma demande' : 'Continuer';
  }

  async function go(n) {
    if (n === step) return;
    const dir = n > step ? 1 : -1;
    const from = panelFor(step);
    const to = panelFor(n);
    await anim(from, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-20 * dir}px)` }], { duration: 160, easing: ease.in });
    from.hidden = true;
    step = n;
    paintProgress();
    to.hidden = false;
    const top = form.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 96, behavior: reduce ? 'auto' : 'smooth' });
    $('.dv-title', to)?.focus({ preventScroll: true });
    await anim(to, [{ opacity: 0, transform: `translateX(${24 * dir}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 260, easing: ease.out });
  }

  /* ---------- Validation ---------- */
  function fieldBox(name) {
    const el = form.elements[name];
    const node = el && (el.tagName ? el : el[0]);
    return node ? node.closest('.f') : null;
  }
  function setError(name, msg) {
    const box = fieldBox(name);
    if (!box) return;
    const err = $('.f-err', box);
    const target = box.tagName === 'FIELDSET' ? box : $('input, textarea, select', box);
    if (!err) return;
    if (!err.id) err.id = `err-${name}`;
    if (msg) {
      err.textContent = msg;
      err.hidden = false;
      target.setAttribute('aria-invalid', 'true');
      target.setAttribute('aria-describedby', err.id);
    } else {
      err.hidden = true;
      target.removeAttribute('aria-invalid');
      target.removeAttribute('aria-describedby');
    }
  }
  function check(name) {
    const v = val(name);
    if (name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    return v.length > 0;
  }
  function validate(n) {
    let names = n === 3 ? REQUIRED[offer() || 'sur_mesure'] : REQUIRED[n];
    if (n === 1 && val('deja_site') === 'oui') names = [...names, 'url_site'];
    let first = null;
    names.forEach((name) => {
      const ok = check(name);
      setError(name, ok ? '' : MESSAGES[name]);
      if (!ok && !first) first = name;
    });
    if (first) {
      const el = form.elements[first];
      (el.tagName ? el : el[0]).focus();
    }
    return !first;
  }
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (name && e.target.closest('.f')?.querySelector('.f-err:not([hidden])') && check(name)) setError(name, '');
  });
  form.addEventListener('change', (e) => {
    const name = e.target.name;
    if (!name) return;
    if (check(name)) setError(name, '');
    if (name === 'deja_site') toggleUrl();
    if (e.target.dataset.exclusive !== undefined && e.target.checked) {
      $$(`input[name="${name}"]`).forEach((i) => { if (i !== e.target) i.checked = false; });
    } else if (e.target.type === 'checkbox' && e.target.checked) {
      const ex = $(`input[name="${name}"][data-exclusive]`);
      if (ex) ex.checked = false;
    }
  });

  const urlWrap = $('#urlWrap');
  function toggleUrl() {
    const show = val('deja_site') === 'oui';
    if (show === !urlWrap.hidden) return;
    if (show) {
      urlWrap.hidden = false;
      anim(urlWrap, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: ease.out });
    } else {
      setError('url_site', '');
      urlWrap.hidden = true;
    }
  }

  /* ---------- Envoi ---------- */
  function setLoading(on) {
    sending = on;
    nextBtn.classList.toggle('is-loading', on);
    nextBtn.setAttribute('aria-busy', String(on));
    nextBtn.disabled = on;
    backBtn.disabled = on;
    label.textContent = on ? 'Envoi en cours…' : (step === 4 ? 'Envoyer ma demande' : 'Continuer');
  }

  async function send() {
    if ($('#dvHp').value) return; // robot : rien n'est envoyé
    sendErr.hidden = true;
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload()),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await showDone();
    } catch (err) {
      sendErr.innerHTML = `L’envoi n’a pas abouti. Vos réponses sont conservées : réessayez dans un instant, ou écrivez-nous à <a href="mailto:${CONTACT}">${CONTACT}</a>.`;
      sendErr.hidden = false;
      setLoading(false);
    } finally {
      clearTimeout(timer);
    }
  }

  async function showDone() {
    const card = form;
    const parts = [...$$('.dv-panel:not([hidden])'), $('.dv-nav'), $('.dv-progress'), progressText];
    await Promise.all(parts.map((p) => anim(p, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: ease.in })));
    parts.forEach((p) => { p.hidden = true; });
    $('.dv-nav').style.display = 'none';
    const nom = val('nom_etablissement');
    $('#dvDoneTxt').textContent = `Merci${nom ? ` pour ${nom}` : ''}. Nous revenons vers vous à ${val('email')} sous 48 h ouvrées avec une proposition adaptée à votre établissement.`;
    done.hidden = false;
    $('h2', done).focus({ preventScroll: true });
    const top = card.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 96, behavior: reduce ? 'auto' : 'smooth' });
    anim($('.dv-done-ico', done), [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.06)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }], { duration: 520, easing: ease.out });
    [...done.children].slice(1).forEach((c, i) => anim(c, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, delay: 120 + i * 70, easing: ease.out }));
  }

  /* ---------- Navigation ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (sending) return;
    if (!validate(step)) return;
    if (step < 4) go(step + 1);
    else send();
  });
  backBtn.addEventListener('click', () => { if (step > 1 && !sending) go(step - 1); });

  // Pré-sélection depuis les boutons de la page Tarifs : devis.html?offre=starter | sur_mesure
  const pre = new URLSearchParams(location.search).get('offre');
  if (pre === 'starter' || pre === 'sur_mesure') {
    const input = $(`input[name="type_offre"][value="${pre}"]`);
    if (input) input.checked = true;
  }
  paintProgress();
})();

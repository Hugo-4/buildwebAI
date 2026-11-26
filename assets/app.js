/* BuildWebAI — interactions
   GSAP + ScrollTrigger + Lenis. Seules transform et opacity sont animées. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString('fr-FR').replace(/ |\s/g, ' ');

  // Adresse de contact unique (formulaire d'audit + footer)
  const CONTACT_EMAIL = 'contact@build-web-ai.com';

  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (!reduce && window.Lenis && hasGsap) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const navH = () => ($('#nav .nav-bar')?.offsetHeight || 64);
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id === '#top' ? document.body : $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: 0, duration: 1.1 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (id !== '#top') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
    });
  });

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('#menuBtn');
  const menu = $('#mobileMenu');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Ouvrir le menu');
    setTimeout(() => { menu.hidden = true; }, 200);
    lenis?.start();
  }
  menuBtn?.addEventListener('click', () => {
    if (menu.hidden) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Fermer le menu');
      lenis?.stop();
    } else closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Preloader (0,8 s) + entrée du hero ---------- */
  const pre = $('#preloader');
  function heroEnter() {
    if (!hasGsap || reduce) return;
    gsap.from('.hero .hero-line > .hero-in', { yPercent: 105, duration: 0.8, ease: 'expo.out', stagger: 0.07 });
    gsap.from('.hero > div > div > .hero-in:not(.hero-line *)', { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: 0.06, delay: 0.2 });
    gsap.from('.hero-call', { opacity: 0, y: 24, scale: 0.98, duration: 0.8, ease: 'expo.out', delay: 0.25 });
  }
  if (!pre || !hasGsap || reduce) {
    pre?.remove();
    heroEnter();
  } else {
    lenis?.stop();
    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => { pre.remove(); lenis?.start(); },
    });
    tl.from('.pl-stem', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.32 })
      .from('.pl-top', { x: -14, opacity: 0, duration: 0.28 }, 0.14)
      .from('.pl-bot', { x: -18, opacity: 0, duration: 0.28 }, 0.24)
      .from('.pl-sq', { scale: 0, rotation: 90, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2.4)' }, 0.48)
      // fin de l'assemblage à 0,8 s, puis sortie
      .to(pre, { yPercent: -100, duration: 0.5, ease: 'expo.inOut' }, 0.8)
      .add(heroEnter, 0.95);
  }

  /* ---------- Halo : respiration lente ---------- */
  if (hasGsap && !reduce) {
    gsap.to('.hero .halo', { x: -60, y: 40, scale: 1.08, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ---------- Simulation d'appel (20h34) ---------- */
  const msgs = $$('#transcript .msg');
  const results = $$('.call-card .result');
  const timerEl = $('#callTimer');
  const statusEl = $('#callStatus');
  const toggle = $('#callToggle');
  let callTl = null;
  let waveTl = null;
  if (hasGsap && !reduce && msgs.length) {
    const clock = { s: 0 };
    waveTl = gsap.timeline({ repeat: -1 });
    $$('.wave i').forEach((bar, i) => {
      waveTl.to(bar, { scaleY: () => gsap.utils.random(0.3, 1), duration: 0.22, ease: 'sine.inOut', repeat: 7, yoyo: true, repeatRefresh: true }, i * 0.04);
    });
    callTl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, defaults: { ease: 'expo.out' } });
    callTl
      .set([...msgs, ...results], { opacity: 0, y: 10 })
      .call(() => { statusEl.textContent = 'Décroché par l’IA'; })
      .set(clock, { s: 0 })
      .to(clock, { s: 48, duration: 9, ease: 'none', onUpdate: () => {
        const s = Math.floor(clock.s);
        timerEl.textContent = `00:${String(s).padStart(2, '0')}`;
      } }, 0.2);
    msgs.forEach((m, i) => callTl.to(m, { opacity: 1, y: 0, duration: 0.5 }, 0.5 + i * 2.1));
    callTl
      .call(() => { statusEl.textContent = 'Réservation confirmée'; }, null, 9.2)
      .to(results, { opacity: 1, y: 0, duration: 0.45, stagger: 0.18 }, 9.3)
      .to({}, { duration: 3.5 });

    // Pause hors écran, et bouton de pause pour l'utilisateur
    let userPaused = false;
    const setPaused = (p) => { p ? (callTl.pause(), waveTl.pause()) : (callTl.resume(), waveTl.resume()); };
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      setPaused(userPaused);
      toggle.setAttribute('aria-pressed', String(userPaused));
      toggle.textContent = userPaused ? 'Reprendre' : 'Mettre en pause';
    });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => { if (!userPaused) setPaused(!self.isActive); },
    });
  } else if (toggle) {
    toggle.hidden = true;
  }

  /* ---------- Module 2 : Présence digitale & Click & Collect ---------- */
  (function clickCollect() {
    const stage = $('#ccStage');
    if (!stage) return;
    const seq = $('#seq'), seqClip = $('#seqClip'), seqInner = $('#seqInner');
    const seqCanvas = $('#seqCanvas'), phCanvas = $('#phoneCanvas');
    const media = $('#phMedia'), screen = $('#phoneScreen'), phone = $('#phone');
    const phBody = $('#phBody'), phMenu = $('#phMenu'), phName = $('#phName'), phMeta = $('#phMeta');
    const upsell = $('#phUpsell'), upYes = $('#phUpsellYes'), upNo = $('#phUpsellNo');
    const orderBtn = $('#phOrder'), done = $('#phDone'), resetBtn = $('#phReset'), live = $('#phLive');
    const FRAMES = 120;
    const FOCUS = 0.58; // hauteur du plat dans la frame verticale, gardée au recadrage dans l'iPhone
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const motion = hasGsap && !reduce && window.ScrollTrigger;
    const euro = (n) => `${n.toFixed(2).replace('.', ',')} €`;

    if (motion) document.documentElement.classList.add('cc-motion');

    /* Séquences d'images : 540p si l'écran n'a pas besoin de plus, 1080p sinon */
    // 1080p seulement sur grand écran haute densité ; le 540p suffit au mobile (poids divisé par deux)
    const HD = (motion ? seq.offsetHeight : media.offsetHeight * 1.8) * DPR > 1300;
    function makeSeq(dir) {
      const s = { imgs: new Array(FRAMES), ok: null, started: false };
      s.src = (i) => `${dir}/${HD ? '' : '540/'}frame_${String(i + 1).padStart(4, '0')}.webp`;
      s.load = (i) => {
        if (s.imgs[i]) return s.imgs[i];
        const im = new Image();
        im.decoding = 'async';
        im.onload = () => onFrame(s, i);
        im.src = s.src(i);
        s.imgs[i] = im;
        return im;
      };
      s.loadAll = () => { if (s.started) return; s.started = true; for (let i = 0; i < FRAMES; i++) s.load(i); };
      s.nearest = (i) => {
        for (let d = 0; d < FRAMES; d++) {
          for (const j of [i - d, i + d]) {
            const im = s.imgs[j];
            if (im && im.complete && im.naturalWidth) return im;
          }
        }
        return null;
      };
      return s;
    }
    const bistrot = makeSeq('public/frames-bistrot');
    const bar = makeSeq('public/frames-bar'); // séquence bar à vin : visuel fixe en repli tant qu'elle n'est pas livrée
    // Visuels des onglets : chargés seulement quand on en a besoin
    const STILL_SRC = { fastfood: 'public/editorial/fastfood.webp', epicerie: 'public/editorial/epicerie.webp', bar: 'public/editorial/bar.webp' };
    const stills = {};
    const loadStill = (k) => {
      if (stills[k] || !STILL_SRC[k]) return;
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { if (state.theme === k) drawPhone(); };
      im.src = STILL_SRC[k];
      stills[k] = im;
    };

    const state = { theme: 'bistrot', frame: 0, phFrame: FRAMES - 1, landed: !motion };

    function onFrame(s, i) {
      if (s === bistrot && Math.abs(i - state.frame) < 3) requestDraw();
      const phSeq = state.theme === 'bistrot' ? bistrot : (state.theme === 'bar' && bar.ok ? bar : null);
      if (s === phSeq && Math.abs(i - state.phFrame) < 3) drawPhone();
    }
    // Passer à true une fois public/frames-bar/ (et son dossier 540/) déposé sur le serveur
    const HAS_BAR_FRAMES = false;
    bar.ok = HAS_BAR_FRAMES;

    // Rien n'est téléchargé avant que la section approche de l'écran
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      bistrot.load(0);
      bistrot.load(FRAMES - 1);
      if (motion) bistrot.loadAll();
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { warm(); io.disconnect(); }
      }, { rootMargin: '600px 0px' });
      io.observe(stage);
    } else warm();

    /* Dessin canvas (recadrage type cover, centré sur la hauteur choisie) */
    function sizeCanvas(cv, w, h) {
      const W = Math.max(1, Math.round(w * DPR)), H = Math.max(1, Math.round(h * DPR));
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    }
    function drawCover(cv, img, focusY) {
      if (!img || !img.complete || !img.naturalWidth) return false;
      const ctx = cv.getContext('2d');
      const cw = cv.width, ch = cv.height, iw = img.naturalWidth, ih = img.naturalHeight;
      const sc = Math.max(cw / iw, ch / ih), sw = cw / sc, sh = ch / sc;
      const sx = (iw - sw) / 2;
      const sy = Math.max(0, Math.min(ih - sh, ih * focusY - sh / 2));
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      return true;
    }
    let raf = 0;
    function requestDraw() {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; drawCover(seqCanvas, bistrot.nearest(Math.round(state.frame)), 0.5); });
    }
    function drawPhone() {
      const t = state.theme;
      const s = t === 'bistrot' ? bistrot : (t === 'bar' && bar.ok ? bar : null);
      const img = s ? s.nearest(Math.round(state.phFrame)) : stills[t];
      if (drawCover(phCanvas, img, s ? FOCUS : 0.5)) media.classList.add('has-canvas');
    }

    /* Géométrie : où le canvas plein cadre doit se loger dans l'iPhone (positions de layout, hors transforms) */
    const geo = { W: 1, H: 1, s: 1, k: 1, dx: 0, dy: 0 };
    function offsetIn(el, root) {
      let x = 0, y = 0, n = el;
      while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { x, y };
    }
    function measure() {
      const mw = media.offsetWidth, mh = media.offsetHeight;
      sizeCanvas(phCanvas, mw, mh);
      drawPhone();
      if (!motion) return;
      const W = seq.offsetWidth, H = seq.offsetHeight;
      const a = offsetIn(seq, stage), m = offsetIn(media, stage);
      geo.W = W; geo.H = H;
      geo.s = mw / W;
      geo.k = mh / geo.s / H;
      geo.dx = m.x + mw / 2 - (a.x + W / 2);
      geo.dy = m.y + mh / 2 - (a.y + H / 2);
      sizeCanvas(seqCanvas, W, H);
      requestDraw();
      applyMorph(P.t);
    }

    /* Morph : translate + scale uniformes, recadrage vertical par scaleY compensé (aucune déformation) */
    const P = { frame: 0, t: 0 };
    function applyMorph(t) {
      const s = 1 + (geo.s - 1) * t;
      const k = 1 + (geo.k - 1) * t;
      const f = 0.5 + (FOCUS - 0.5) * t;
      gsap.set(seq, { x: geo.dx * t, y: geo.dy * t, scale: s, opacity: t >= 0.999 ? 0 : 1 });
      gsap.set(seqClip, { scaleY: k });
      gsap.set(seqInner, { scaleY: 1 / k, y: ((0.5 - f) * geo.H) / k });
      const landed = t >= 0.999;
      if (landed !== state.landed) {
        state.landed = landed;
        if (landed) drawPhone();
        phBody.inert = !landed;
      }
      gsap.set(media, { opacity: landed ? 1 : 0 });
    }

    if (motion) {
      phBody.inert = true;
      // Les frames se chargent quand la section approche
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: stage, start: 'top top', end: '+=300%', pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: measure },
      });
      tl.to(P, { frame: FRAMES - 1, duration: 0.62, onUpdate: () => { state.frame = P.frame; requestDraw(); } }, 0)
        .to('.cc-hook', { opacity: 0, y: -48, duration: 0.1, ease: 'power2.in' }, 0.25)
        .fromTo(phone, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' }, 0.4)
        .to(P, { t: 1, duration: 0.35, ease: 'power2.inOut', onUpdate: () => applyMorph(P.t) }, 0.35)
        .fromTo('.cc-copy .cc-title', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.5)
        .fromTo('.cc-copy .cc-lead', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.54)
        .fromTo('.cc-cards--stage .metric', { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.08, stagger: 0.05, ease: 'power2.out' }, 0.58)
        .fromTo(phBody, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.7)
        .fromTo('#ccHint', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.06, ease: 'power2.out' }, 0.78)
        .to({}, { duration: 0.1 }, 0.9);

      // Mobile : les cartes métriques passent sous la scène, en flux normal, et entrent en décalé
      const box = $('.cc-cards-mobile');
      const list = $('.cc-cards--stage');
      if (box && list) {
        const clone = list.cloneNode(true);
        clone.classList.remove('cc-cards--stage');
        box.append(clone);
        box.removeAttribute('aria-hidden');
        const mm = gsap.matchMedia();
        mm.add('(max-width: 1023px)', () => {
          gsap.fromTo(clone.children, { opacity: 0, y: 24 }, {
            opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.12,
            scrollTrigger: { trigger: clone, start: 'top 85%', once: true },
          });
        });
      }
      applyMorph(0);
    } else {
      window.addEventListener('resize', measure);
    }
    measure();
    window.addEventListener('load', measure);

    /* Simulateur Click & Collect dans l'iPhone */
    const THEMES = {
      bistrot: {
        name: 'Maison Comptoir', meta: 'Bistrot · Retrait en 15 min',
        items: [
          { n: 'Saint-Jacques snackées, riz noir', d: 'Beurre noisette, jus corsé', p: 26 },
          { n: 'Tartare de bœuf au couteau', d: 'Frites maison, salade de saison', p: 19 },
          { n: 'Mousse au chocolat', d: 'Fleur de sel, éclats de noisette', p: 8.5 },
        ],
        up: { t: 'Un verre de Chablis pour accompagner ?', n: 'Verre de Chablis', p: 7 },
      },
      fastfood: {
        name: 'Smash Club', meta: 'Smash burgers · Prêt en 8 min',
        items: [
          { n: 'Double smash cheddar', d: 'Deux steaks, cheddar affiné, oignons', p: 12.9 },
          { n: 'Frites maison', d: 'Sel fumé, sauce de la maison', p: 4.5 },
          { n: 'Milkshake vanille', d: 'Glace artisanale', p: 5.5 },
        ],
        up: { t: 'Passez en menu : frites + boisson ?', n: 'Formule menu', p: 4 },
      },
      bar: {
        name: 'Cave Lumière', meta: 'Bar à vins · Retrait dès 18h',
        items: [
          { n: 'Planche mixte', d: 'Comté 24 mois, jambon noir de Bigorre', p: 18 },
          { n: 'Burrata crémeuse', d: 'Tomates anciennes, huile d’olive', p: 12 },
          { n: 'Saint-Joseph rouge', d: 'Bouteille, domaine en biodynamie', p: 32 },
        ],
        up: { t: 'Un verre de Saint-Joseph avec votre planche ?', n: 'Verre de Saint-Joseph', p: 8 },
      },
      epicerie: {
        name: 'Épicerie Odette', meta: 'Épicerie fine · Retrait dès 10h',
        items: [
          { n: 'Panier de fromages affinés', d: 'Trois fromages de la semaine', p: 24 },
          { n: 'Huile d’olive AOP', d: 'Vallée des Baux, 50 cl', p: 16 },
          { n: 'Pain au levain', d: 'Cuit le matin même', p: 5.2 },
        ],
        up: { t: 'Le pain du jour pour vos fromages ?', n: 'Pain au levain', p: 5.2 },
      },
    };
    const cart = { lines: [], upsellDone: false, upsellAmount: 0 };
    const say = (msg) => { live.textContent = msg; };

    function renderMenu() {
      const th = THEMES[state.theme];
      phName.textContent = th.name;
      phMeta.textContent = th.meta;
      phMenu.innerHTML = th.items.map((it, i) => `<li class="ph-item"><div class="ph-item-txt"><p class="ph-item-name">${it.n}</p><p class="ph-item-desc">${it.d}</p></div><p class="ph-price">${euro(it.p)}</p><button class="ph-add" type="button" data-i="${i}" data-qty="0" aria-label="Ajouter ${it.n} au panier">+</button></li>`).join('');
      $('#phUpsellText').textContent = th.up.t;
      $('#phUpsellPrice').textContent = euro(th.up.p);
    }
    function updateCart() {
      const n = cart.lines.length;
      const total = cart.lines.reduce((a, l) => a + l.p, 0);
      $('#phCount').textContent = n;
      $('#phTotal').textContent = euro(total);
      $('#phCartLabel').textContent = n === 0 ? 'Panier vide' : (cart.upsellAmount ? `${n} article${n > 1 ? 's' : ''} · dont suggestion +${euro(cart.upsellAmount)}` : `${n} article${n > 1 ? 's' : ''}`);
      orderBtn.disabled = n === 0;
    }
    function setUpsell(on) {
      upsell.classList.toggle('is-on', on);
      upsell.setAttribute('aria-hidden', String(!on));
      upYes.tabIndex = upNo.tabIndex = on ? 0 : -1;
    }
    function setDone(on) {
      done.classList.toggle('is-on', on);
      done.setAttribute('aria-hidden', String(!on));
      resetBtn.tabIndex = on ? 0 : -1;
    }
    function resetCart() {
      cart.lines = []; cart.upsellDone = false; cart.upsellAmount = 0;
      setUpsell(false); setDone(false);
      $$('.ph-add', phMenu).forEach((b) => { b.dataset.qty = '0'; b.textContent = '+'; });
      updateCart();
    }
    const bump = (el, s = 1.25) => { if (motion) gsap.fromTo(el, { scale: s }, { scale: 1, duration: 0.4, ease: 'back.out(3)', overwrite: true }); };

    phMenu.addEventListener('click', (e) => {
      const b = e.target.closest('.ph-add');
      if (!b) return;
      const it = THEMES[state.theme].items[+b.dataset.i];
      cart.lines.push({ n: it.n, p: it.p });
      const q = (+b.dataset.qty || 0) + 1;
      b.dataset.qty = String(q);
      b.textContent = String(q);
      updateCart();
      bump($('#phCount'));
      say(`${it.n} ajouté au panier.`);
      if (!cart.upsellDone) setUpsell(true);
    });
    upYes.addEventListener('click', () => {
      const up = THEMES[state.theme].up;
      cart.lines.push({ n: up.n, p: up.p });
      cart.upsellDone = true;
      cart.upsellAmount += up.p;
      setUpsell(false);
      updateCart();
      bump($('#phCount'));
      bump($('[data-metric="upsell"]'), 1.04);
      say(`${up.n} ajouté. Le panier moyen augmente de ${euro(up.p)}.`);
    });
    upNo.addEventListener('click', () => { cart.upsellDone = true; setUpsell(false); });
    orderBtn.addEventListener('click', () => {
      if (!cart.lines.length) return;
      const total = cart.lines.reduce((a, l) => a + l.p, 0);
      $('#phDoneText').textContent = `${euro(total)} payés par Apple Pay · retrait à 20h50`;
      setUpsell(false);
      setDone(true);
      resetBtn.focus({ preventScroll: true });
      say('Commande confirmée.');
    });
    resetBtn.addEventListener('click', () => { resetCart(); $('.ph-add', phMenu)?.focus({ preventScroll: true }); });

    /* Onglets Bistrot / Fast-Food / Bar / Épicerie */
    const pTabs = $$('.ph-tab');
    let playTween = null;
    function setTheme(key, focus = false) {
      const i = pTabs.findIndex((t) => t.dataset.theme === key);
      pTabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      $('.ph-tab-ind').style.setProperty('--i', i);
      if (focus) pTabs[i].focus();
      if (key === state.theme) return;
      loadStill(key);
      const swap = () => {
        state.theme = key;
        screen.dataset.themeSite = key;
        renderMenu();
        resetCart();
        const s = key === 'bistrot' ? bistrot : (key === 'bar' && bar.ok ? bar : null);
        playTween?.kill();
        if (s && motion) {
          s.loadAll();
          const o = { f: 0 };
          state.phFrame = 0;
          playTween = gsap.to(o, { f: FRAMES - 1, duration: 2.4, ease: 'none', onUpdate: () => { state.phFrame = o.f; drawPhone(); } });
        } else {
          state.phFrame = FRAMES - 1;
          if (s) s.loadAll();
        }
        drawPhone();
      };
      if (motion) {
        const parts = [phCanvas, phMenu, '.ph-brand'];
        gsap.to(parts, { opacity: 0, duration: 0.12, ease: 'power1.in', overwrite: true, onComplete: () => {
          swap();
          gsap.fromTo(parts, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
          gsap.fromTo($$('.ph-item', phMenu), { y: 10 }, { y: 0, duration: 0.4, ease: 'expo.out', stagger: 0.05 });
        } });
      } else swap();
    }
    pTabs.forEach((t, i) => {
      t.addEventListener('click', () => setTheme(t.dataset.theme));
      t.addEventListener('keydown', (e) => {
        const n = pTabs.length;
        if (e.key === 'ArrowRight') { setTheme(pTabs[(i + 1) % n].dataset.theme, true); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { setTheme(pTabs[(i - 1 + n) % n].dataset.theme, true); e.preventDefault(); }
      });
    });
    renderMenu();
    updateCart();
  })();

  /* ---------- Simulateur ROI ---------- */
  const covers = $('#covers');
  const ticket = $('#ticket');
  const out = {
    covers: $('#coversOut'), ticket: $('#ticketOut'), month: $('#totalMonth'), year: $('#totalYear'),
    noshow: $('#noshowEuro'), calls: $('#callsEuro'), noshowC: $('#noshowCovers'), callsC: $('#callsCovers'),
  };
  const WEEKS = 4.33, RESA = 0.40, NS_BEFORE = 0.18, NS_AFTER = 0.03, CALL_RATE = 0.02;
  const shown = { month: 0, year: 0, noshow: 0, calls: 0 };
  function paintFill(input) {
    const p = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty('--fill', `${p}%`);
  }
  function compute(animate = true) {
    const c = +covers.value, t = +ticket.value;
    const nsCovers = c * RESA * (NS_BEFORE - NS_AFTER);
    const callCovers = Math.min(12, Math.max(4, Math.round(c * CALL_RATE)));
    const ns = nsCovers * t * WEEKS;
    const calls = callCovers * t * WEEKS;
    const month = ns + calls;
    out.covers.textContent = fmt(c);
    out.ticket.textContent = `${fmt(t)} €`;
    out.noshowC.textContent = `${fmt(nsCovers)} couverts / semaine`;
    out.callsC.textContent = `${callCovers} couverts / semaine`;
    const target = { month, year: month * 12, noshow: ns, calls };
    const paint = () => {
      out.month.textContent = `${fmt(shown.month)} €`;
      out.year.textContent = `${fmt(shown.year)} €`;
      out.noshow.textContent = `${fmt(shown.noshow)} €`;
      out.calls.textContent = `${fmt(shown.calls)} €`;
    };
    if (hasGsap && animate && !reduce) {
      gsap.to(shown, { ...target, duration: 0.45, ease: 'power3.out', overwrite: true, onUpdate: paint });
    } else { Object.assign(shown, target); paint(); }
    paintFill(covers); paintFill(ticket);
  }
  if (covers && ticket) {
    covers.addEventListener('input', () => compute());
    ticket.addEventListener('input', () => compute());
    compute(false);
    if (hasGsap && !reduce) {
      // le taux "après" se remplit une fois, quand la carte arrive à l'écran
      gsap.fromTo('#barAfter', { scaleX: 1 }, { scaleX: NS_AFTER / NS_BEFORE, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.sim-card', start: 'top 75%', once: true } });
    }
  }

  /* ---------- Avant / Après ---------- */
  const ba = $('#ba');
  const handle = $('#baHandle');
  if (ba && handle) {
    let p = 50;
    const setW = () => ba.style.setProperty('--ba-w', `${ba.clientWidth}px`);
    const set = (v) => {
      p = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--p', p.toFixed(2));
      handle.setAttribute('aria-valuenow', String(Math.round(p)));
      handle.setAttribute('aria-valuetext', `${Math.round(100 - p)} % de la vue après`);
    };
    setW();
    window.addEventListener('resize', setW);
    const fromEvent = (e) => {
      const r = ba.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    };
    let dragging = false;
    ba.addEventListener('pointerdown', (e) => {
      dragging = true; ba.classList.add('is-drag');
      ba.setPointerCapture(e.pointerId); fromEvent(e);
    });
    ba.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
    const end = () => { dragging = false; ba.classList.remove('is-drag'); };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(p - step); e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(p + step); e.preventDefault(); }
      if (e.key === 'Home') { set(0); e.preventDefault(); }
      if (e.key === 'End') { set(100); e.preventDefault(); }
    });
    // Indice d'interaction joué une fois à l'arrivée
    if (hasGsap && !reduce) {
      const o = { v: 50 };
      ScrollTrigger.create({
        trigger: ba, start: 'top 70%', once: true,
        onEnter: () => {
          if (dragging) return;
          gsap.timeline()
            .to(o, { v: 32, duration: 0.6, ease: 'power2.inOut', onUpdate: () => set(o.v) })
            .to(o, { v: 64, duration: 0.7, ease: 'power2.inOut', onUpdate: () => set(o.v) })
            .to(o, { v: 50, duration: 0.5, ease: 'power2.out', onUpdate: () => set(o.v) });
        },
      });
    }
  }

  /* ---------- Avant / après : le contenu suit le métier choisi (accueil) ---------- */
  const baJson = $('#baData');
  if (baJson) {
    const BA = JSON.parse(baJson.textContent);
    const picks = $$('[data-ba]');
    const parts = () => [$('[data-ba-when]'), $('[data-ba-lead]'), $('[data-ba-before]'), $('[data-ba-after]'), $('[data-ba-mods]'), ...$$('#ba .ba-layer img')];
    const fill = (d) => {
      $('[data-ba-when]').textContent = d.when;
      $('[data-ba-lead]').textContent = d.lead;
      $$('#ba .ba-layer img').forEach((img, i) => {
        img.src = d.img[0]; img.width = d.img[1]; img.height = d.img[2];
        img.alt = i === 0 ? d.alt : '';
      });
      $('[data-ba-before]').innerHTML = d.before.map((t) => `<li class="chip chip-bad">${t}</li>`).join('');
      $('[data-ba-after]').innerHTML = d.after.map((t) => `<li class="chip chip-good">${t}</li>`).join('');
      const mods = $('[data-ba-mods]');
      mods.replaceChildren(...d.mods.map(([n, t]) => {
        const div = document.createElement('div'); div.className = 'mod';
        const a = document.createElement('p'); a.className = 'mod-name'; a.textContent = n;
        const b = document.createElement('p'); b.className = 'mod-txt'; b.textContent = t;
        div.append(a, b); return div;
      }));
    };
    // Précharge les photos des autres métiers au premier survol du sélecteur
    let warmed = false;
    const warm = () => { if (warmed) return; warmed = true; Object.values(BA).forEach((d) => { const i = new Image(); i.src = d.img[0]; }); };
    picks.forEach((btn) => {
      btn.addEventListener('pointerenter', warm, { once: true });
      btn.addEventListener('focus', warm, { once: true });
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        picks.forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
        const d = BA[btn.dataset.ba];
        if (hasGsap && !reduce) {
          gsap.to(parts(), { opacity: 0, duration: 0.18, ease: 'power1.out', overwrite: true, onComplete: () => {
            fill(d);
            gsap.fromTo(parts(), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out', stagger: 0.03 });
          } });
        } else fill(d);
      });
    });
  }

  /* ---------- Onglets tarifs ---------- */
  const tabs = $$('.tab');
  const ind = $('.tab-ind');
  const mq = window.matchMedia('(max-width: 767px)');
  function placeInd(i) {
    ind.style.setProperty('--i', i);
    ind.style.setProperty('--x', i % 2);
    ind.style.setProperty('--y', Math.floor(i / 2));
  }
  function selectTab(i, focus = false) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (on) {
        panel.hidden = false;
        if (hasGsap && !reduce) gsap.fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'expo.out', overwrite: true });
      } else panel.hidden = true;
    });
    placeInd(i);
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', (e) => {
      const n = tabs.length;
      if (e.key === 'ArrowRight') { selectTab((i + 1) % n, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { selectTab((i - 1 + n) % n, true); e.preventDefault(); }
      if (e.key === 'Home') { selectTab(0, true); e.preventDefault(); }
      if (e.key === 'End') { selectTab(n - 1, true); e.preventDefault(); }
    });
  });
  if (ind) mq.addEventListener?.('change', () => placeInd(tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
  if (ind && tabs.length) {
    // état initial sans animation : l'onglet sélectionné dans le HTML (Pack Performance)
    ind.style.transition = 'none';
    placeInd(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));
    void ind.offsetWidth;
    ind.style.transition = '';
  }

  /* ---------- Formulaire audit ---------- */
  const form = $('#auditForm');
  // Pré-sélection du métier depuis une page secteur : index.html?metier=Garage%20ou%20atelier#audit
  const metier = new URLSearchParams(location.search).get('metier');
  const fType = $('#fType');
  if (metier && fType && [...fType.options].some((o) => o.value === metier || o.text === metier)) fType.value = metier;
  const mailLink = $('#mailLink');
  if (mailLink) { mailLink.href = `mailto:${CONTACT_EMAIL}`; mailLink.textContent = CONTACT_EMAIL; }
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const checks = [
      ['fName', (v) => v.trim().length > 1],
      ['fUrl', (v) => v.trim().length > 3],
      ['fMail', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],
    ];
    let firstBad = null;
    checks.forEach(([id, ok]) => {
      const input = document.getElementById(id);
      const err = document.getElementById(`${id}-err`);
      const valid = ok(input.value);
      input.setAttribute('aria-invalid', String(!valid));
      if (valid) { err.hidden = true; input.removeAttribute('aria-describedby'); }
      else { err.hidden = false; input.setAttribute('aria-describedby', err.id); firstBad ||= input; }
    });
    if (firstBad) { firstBad.focus(); return; }
    const d = new FormData(form);
    const body = `Établissement : ${d.get('etablissement')}\nType : ${d.get('type')}\nSite / Instagram : ${d.get('lien')}\nEmail : ${d.get('email')}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Audit Flash Vidéo · ' + d.get('etablissement'))}&body=${encodeURIComponent(body)}`;
    $('#formNote').textContent = 'Votre messagerie s’ouvre avec la demande pré-remplie : il ne reste qu’à l’envoyer.';
  });

  /* ---------- Démos : accordéon (le panneau survolé ou focalisé s'élargit et s'éclaire) ---------- */
  $$('[data-acc]').forEach((acc) => {
    const items = $$('.acc-item', acc);
    const activate = (it) => items.forEach((x) => x.classList.toggle('is-active', x === it));
    items.forEach((it) => {
      it.setAttribute('role', 'listitem');
      it.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(it); });
      it.addEventListener('focus', () => activate(it));
    });
  });

  window.addEventListener('load', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();

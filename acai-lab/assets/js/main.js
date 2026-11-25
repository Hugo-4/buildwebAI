/* ==========================================================================
   Açai Lab Café — interactions
   - FrameSeq: image sequences on <canvas>, pre-decoded, sub-frame blending
   - Smooth scroll: Lenis on pointer devices, native momentum on touch
   - Hero: GSAP ScrollTrigger pin, 2 sequences chained, time-based smoothing
   - La Carta: click & tap morph (café ⇄ matcha), bowl toppings replay
   - Outro: unboxing auto-plays once when it enters the viewport
   ========================================================================== */
(() => {
  'use strict';

  /* ---- Config: the only place to edit links ---- */
  const RAPPI_URL = 'https://www.rappi.com.pe/'; // ← reemplazar por el enlace directo de Açai Lab en Rappi
  const SEQ_BASE = './assets/seq/';
  const FPS = 24;
  const BG = '#F7F5F0';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mqDesktop = window.matchMedia('(min-width: 900px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  $$('.js-rappi').forEach(a => { a.href = RAPPI_URL; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ======================================================================
     Smooth scroll (Lenis) — desktop wheel/trackpad only; touch stays native
     ====================================================================== */
  let lenis = null;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis && finePointer && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  const scrollToY = top => {
    if (lenis) lenis.scrollTo(top, { duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // in-page anchors go through the same smooth scroller
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const top = id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - (id === '#ritual' ? 0 : header.offsetHeight);
    scrollToY(top);
  }));

  /* ======================================================================
     FrameSeq
     ====================================================================== */
  class FrameSeq {
    constructor(canvas, dir, count) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.dir = dir;
      this.count = count;
      this.imgs = new Array(count);
      this.loaded = new Uint8Array(count);
      this.nLoaded = 0;
      this.want = 0;         // fractional frame requested
      this.key = -1;         // what is currently painted
      this.pos = 0;          // fractional frame for play()
      this.raf = 0;
      this.started = false;
      this._allWaiters = [];
      this._resize();
      if ('ResizeObserver' in window) new ResizeObserver(() => this._resize()).observe(canvas);
    }

    _dpr() { return Math.min(window.devicePixelRatio || 1, 2); }

    /** hd = native 1080p master, md = 720p. Chosen from the canvas' physical size. */
    _pickVariant() {
      const w = Math.max(this.cv.clientWidth, this.cv.clientHeight) || 400;
      return w * this._dpr() > 760 ? 'hd' : 'md';
    }

    _resize() {
      const dpr = this._dpr();
      const w = Math.max(1, Math.round(this.cv.clientWidth * dpr));
      const h = Math.max(1, Math.round(this.cv.clientHeight * dpr));
      if (this.cv.width === w && this.cv.height === h) return;
      this.cv.width = w; this.cv.height = h;
      this.key = -1;
      this.draw(this.want);
    }

    src(i) {
      return `${SEQ_BASE}${this.dir}/${this.variant}/${String(i + 1).padStart(4, '0')}.webp`;
    }

    /** Coarse-to-fine order: first + last, then every 16th, 8th, 4th, 2nd, all. */
    _order() {
      const seen = new Uint8Array(this.count);
      const out = [];
      const push = i => { if (!seen[i]) { seen[i] = 1; out.push(i); } };
      push(0); push(this.count - 1);
      [16, 8, 4, 2, 1].forEach(s => { for (let i = 0; i < this.count; i += s) push(i); });
      return out;
    }

    load() {
      if (this.started) return this._ready;
      this.started = true;
      this.variant = (this.shareWith && this.shareWith.variant) || this._pickVariant();
      const queue = this._order();
      let resolveReady;
      this._ready = new Promise(r => { resolveReady = r; });
      let active = 0, settled = 0;
      const next = () => {
        while (active < 6 && queue.length) {
          const i = queue.shift();
          active++;
          const img = new Image();
          img.decoding = 'async';
          img.src = this.src(i);
          // decode off the main thread BEFORE the frame can be painted: no decode hitch while scrubbing
          img.decode().then(() => {
            this.imgs[i] = img; this.loaded[i] = 1; this.nLoaded++;
            if (i === 0) resolveReady();
            this.draw(this.want, true);
          }, () => { if (i === 0) resolveReady(); })
            .finally(() => {
              active--; settled++;
              if (settled === this.count) this._allWaiters.splice(0).forEach(f => f());
              next();
            });
        }
      };
      next();
      return this._ready;
    }

    /** Resolves when every frame is decoded, or after `timeout` ms. */
    whenAll(timeout = 3000) {
      this.load();
      if (this.nLoaded >= this.count) return Promise.resolve();
      return new Promise(r => {
        const t = setTimeout(r, timeout);
        this._allWaiters.push(() => { clearTimeout(t); r(); });
      });
    }

    _nearest(i) {
      if (this.loaded[i]) return i;
      for (let d = 1; d < this.count; d++) {
        if (i - d >= 0 && this.loaded[i - d]) return i - d;
        if (i + d < this.count && this.loaded[i + d]) return i + d;
      }
      return -1;
    }

    _paint(img, alpha) {
      const { width: cw, height: ch } = this.cv;
      const s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);   // contain
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      this.ctx.globalAlpha = alpha;
      this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    /** Draw a (fractional) frame. Between two decoded frames, cross-blends them for sub-frame smoothness. */
    draw(f, force = false) {
      f = clamp(f, 0, this.count - 1);
      this.want = f;
      const i0 = Math.floor(f);
      const i1 = Math.min(i0 + 1, this.count - 1);
      let a = f - i0;
      let base, over = -1;
      if (this.loaded[i0] && this.loaded[i1] && a > 0.04 && a < 0.96) { base = i0; over = i1; }
      else {
        base = this._nearest(Math.round(f));
        a = 0;
        if (base < 0) return;
      }
      const key = over < 0 ? base : base + Math.round(a * 16) / 17;
      if (key === this.key && !force) return;
      const ctx = this.ctx;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, this.cv.width, this.cv.height);
      this._paint(this.imgs[base], 1);
      if (over >= 0) this._paint(this.imgs[over], a);
      ctx.globalAlpha = 1;
      this.key = key;
      if (!this.cv.classList.contains('is-ready')) this.cv.classList.add('is-ready');
    }

    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }

    /** Time-based playback from current position to `to` (forwards or backwards). */
    play(to, fps = FPS, from = this.pos) {
      this.stop();
      to = clamp(to, 0, this.count - 1);
      if (reduceMotion) { this.pos = to; this.draw(to); return Promise.resolve(); }
      const dir = Math.sign(to - from) || 1;
      const start = performance.now();
      return new Promise(resolve => {
        const tick = now => {
          const p = from + dir * ((now - start) / 1000) * fps;
          const done = dir > 0 ? p >= to : p <= to;
          this.pos = done ? to : p;
          this.draw(this.pos);
          if (done) { this.raf = 0; resolve(); } else this.raf = requestAnimationFrame(tick);
        };
        this.raf = requestAnimationFrame(tick);
      });
    }
  }

  /* ======================================================================
     Header
     ====================================================================== */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navLinks = $$('.nav a');
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['ritual', 'carta', 'collabs', 'visitanos'].forEach(id => { const el = document.getElementById(id); if (el) navIO.observe(el); });

  /* ======================================================================
     1. Hero — El Ritual del Lab
     ====================================================================== */
  const hero = $('#ritual');
  const blend = new FrameSeq($('#cv-blend'), 'hero-blend', 145);
  const dispense = new FrameSeq($('#cv-dispense'), 'hero-dispense', 92);
  const toppings = new FrameSeq($('#cv-toppings'), 'hero-toppings', 120);
  const steps = $$('.ritual-step', hero);
  const bar = $('.ritual-progress span', hero);

  // The hero gets the network first; everything else waits for it (or 5 s at most).
  blend.load().then(() => { blend.draw(0, true); dispense.load().then(() => toppings.load()); });
  const heroReady = Promise.race([
    Promise.all([blend.whenAll(8000), dispense.whenAll(8000), toppings.whenAll(8000)]),
    new Promise(r => setTimeout(r, 5000)),
  ]);

  let target = 0, smooth = 0, phase = 1, heroRaf = 0, last = 0;
  const T1 = 1 / 3, T2 = 2 / 3, H = 0.01;   // chapter boundaries (with hysteresis)
  const renderHero = now => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    // frame-rate independent easing (same feel at 60 Hz and 120 Hz)
    smooth += (target - smooth) * (1 - Math.exp(-dt * 11));
    if (Math.abs(target - smooth) < 0.0002) smooth = target;
    const p = smooth;
    blend.draw(clamp(p / T1) * (blend.count - 1));
    dispense.draw(clamp((p - T1) / (T2 - T1)) * (dispense.count - 1));
    toppings.draw(clamp((p - T2) / (1 - T2)) * (toppings.count - 1));
    // hysteresis around each boundary so the crossfades never flicker
    const next = p > T2 + H ? 3 : (p < T2 - H && p > T1 + H) ? 2 : p < T1 - H ? 1 : phase;
    if (next !== phase) { phase = next; hero.dataset.phase = phase; }
    steps.forEach((st, i) => st.classList.toggle('is-active', i === phase - 1));
    bar.style.transform = `scaleX(${p})`;
    if (smooth !== target) heroRaf = requestAnimationFrame(renderHero);
    else { heroRaf = 0; last = 0; }
  };
  const kickHero = () => { if (!heroRaf) heroRaf = requestAnimationFrame(renderHero); };

  if (hasGsap) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=240%',          // 3 chapters: 100vh viewport + 240vh of scroll
      pin: true,
      anticipatePin: 1,
      onUpdate: self => { target = self.progress; kickHero(); },
    });

    if (!reduceMotion) {
      gsap.from('.ritual-head > *', { y: 26, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
      gsap.from('.ritual-steps, .skip-carta', { opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.5 });
    }
  }

  /* ======================================================================
     2. La Carta
     ====================================================================== */
  const carta = $('#carta');
  const drinkSeq = new FrameSeq($('#cv-drink'), 'carta-drink', 239);
  const bowlSeq = new FrameSeq($('#cv-bowl'), 'hero-toppings', 120);
  bowlSeq.shareWith = toppings;
  const cvDrink = $('#cv-drink'), cvBowl = $('#cv-bowl');
  const poster = $('#carta-poster');
  const label = $('#stage-label');
  const replayBtn = $('#replay');
  const stage = $('#carta-stage');
  const visual = $('.carta-visual');
  const tabs = $$('.tab', carta);
  const subtabs = $$('.subtab', carta);
  const items = $$('button.item', carta);
  const panels = { bebidas: $('#panel-bebidas'), comer: $('#panel-comer') };

  const POSTERS = {
    cafe: ['./assets/img/frame-carta-latte.jpg', 'Peanut Butter Latte'],
    matcha: ['./assets/img/frame-carta-matcha.jpg', 'Mango Matcha'],
    bowl: ['./assets/img/frame-carta-bowl.jpg', 'Açai Bowl'],
  };
  const setPoster = key => { poster.src = POSTERS[key][0]; poster.alt = POSTERS[key][1]; };

  // Matcha flavours: Mango is the end of the morph; the others are photos cross-faded on top
  const STILLS = {
    cafe: './assets/img/carta/latte-peanut-butter.jpg',
    bowl: './assets/img/carta/acai-bowl.jpg',
  };
  const FLAVOURS = {
    mango: ['Mango Matcha', './assets/img/carta/matcha-mango.jpg'],
    strawberry: ['Strawberry Matcha', './assets/img/carta/matcha-strawberry.jpg'],
    acai: ['Açai Matcha', './assets/img/carta/matcha-acai.jpg'],
    pistacho: ['Pistacho Matcha', './assets/img/carta/matcha-pistacho.jpg'],
    latte: ['Matcha Latte', './assets/img/carta/matcha-latte.jpg'],
  };
  const layers = $$('.flavour-photo', carta);
  let flavour = 'mango', layerOn = -1, flavourToken = 0;
  const preloadFlavours = () => [...Object.values(FLAVOURS).map(f => f[1]), STILLS.cafe, STILLS.bowl]
    .forEach(src => { if (src) { const i = new Image(); i.src = src; } });

  const hidePhotos = () => { layers.forEach(l => l.classList.remove('is-on')); layerOn = -1; };
  const showFlavour = key => {
    flavour = key;
    label.textContent = FLAVOURS[key][0];
    showPhoto(FLAVOURS[key][1], FLAVOURS[key][0]);
  };
  /** Cross-fade a studio photo over the canvas (two layers, 0.3 s). Missing file: keep the animation. */
  function showPhoto(src, alt) {
    const token = ++flavourToken;
    if (!src) { hidePhotos(); return; }
    const key = alt;
    const nextIdx = layerOn === 0 ? 1 : 0;
    const layer = layers[nextIdx];
    const swap = () => {
      if (token !== flavourToken) return;
      layer.classList.add('is-on');
      if (layerOn >= 0 && layerOn !== nextIdx) layers[layerOn].classList.remove('is-on');
      layerOn = nextIdx;
    };
    layer.alt = key;
    if (layer.getAttribute('src') === src && layer.complete && layer.naturalWidth) { swap(); return; }
    layer.onload = swap;
    layer.onerror = () => { if (token === flavourToken) hidePhotos(); };   // photo missing: keep the animation
    layer.src = src;
  }

  // carta sequences load after the hero, as the user approaches
  let cartaRequested = false;
  const loadCarta = () => {
    if (cartaRequested) return;
    cartaRequested = true;
    if (drink === 'cafe' && carta.dataset.mode === 'bebidas') showPhoto(STILLS.cafe, 'Peanut Butter Latte');
    heroReady.then(() => drinkSeq.load()).then(() => drinkSeq.whenAll(6000)).then(() => bowlSeq.load());
  };
  new IntersectionObserver((entries, io) => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadCarta(); }
  }, { rootMargin: '150% 0px' }).observe(carta);

  // bottom edge of the sticky area once it is stuck (not its current, possibly un-stuck, position)
  const stuckBottom = () => header.offsetHeight + (mqDesktop.matches ? 0 : visual.offsetHeight);

  /** Scroll so `el` sits just under the sticky visual (mobile) or header (desktop). */
  const scrollToInList = el => {
    const offset = stuckBottom() + (mqDesktop.matches ? 24 : 12);
    scrollToY(el.getBoundingClientRect().top + window.scrollY - offset);
  };

  let drink = 'cafe', morph = null;
  const setDrink = kind => {
    if (carta.dataset.mode !== 'bebidas') setMode('bebidas');
    subtabs.forEach(b => {
      const on = b.dataset.drink === kind;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
    if (kind === drink) return morph || Promise.resolve();
    drink = kind;
    carta.dataset.drink = kind;
    flavourToken++;
    flavour = 'mango';
    hidePhotos();
    label.textContent = POSTERS[kind][1];
    setPoster(kind);
    loadCarta();
    if (kind === 'matcha') preloadFlavours();
    // forward (café → matcha) at 1.5× or backwards (matcha → café) from wherever it is
    const token = flavourToken;
    morph = drinkSeq.play(kind === 'matcha' ? drinkSeq.count - 1 : 0, FPS * 1.5)
      .then(() => { if (drink === kind && flavourToken === token && carta.dataset.mode === 'bebidas' && kind === 'cafe') showPhoto(STILLS.cafe, 'Peanut Butter Latte'); });
    return morph;
  };

  let bowlPlayToken = 0;
  const playBowl = async () => {
    const token = ++bowlPlayToken;
    bowlSeq.stop();
    hidePhotos();
    bowlSeq.pos = 0;
    bowlSeq.load();
    bowlSeq.draw(0, true);
    await bowlSeq.whenAll(4000);
    if (token !== bowlPlayToken || carta.dataset.mode !== 'comer') return;
    await bowlSeq.play(bowlSeq.count - 1, FPS / 2, 0);   // 120 frames, blended: 10 s like the original clip
    if (token === bowlPlayToken && carta.dataset.mode === 'comer') showPhoto(STILLS.bowl, 'Açai Bowl');
  };

  const setMode = mode => {
    if (carta.dataset.mode === mode) return;
    carta.dataset.mode = mode;
    tabs.forEach(t => {
      const on = t.dataset.mode === mode;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== mode; });
    const comer = mode === 'comer';
    cvDrink.classList.toggle('is-hidden', comer);
    cvBowl.classList.toggle('is-hidden', !comer);
    replayBtn.hidden = !comer;
    label.textContent = comer ? POSTERS.bowl[1] : drink === 'matcha' ? FLAVOURS[flavour][0] : POSTERS[drink][1];
    setPoster(comer ? 'bowl' : drink);
    hidePhotos();
    if (comer) playBowl();
    else {
      bowlSeq.stop();
      if (drink === 'matcha') showFlavour(flavour); else showPhoto(STILLS.cafe, 'Peanut Butter Latte');
    }
    if (lenis) requestAnimationFrame(() => lenis.resize());
    if (hasGsap) ScrollTrigger.refresh();
    // bring the start of the list back under the visual if the user was deep in it
    const list = $('.carta-list');
    if (list.getBoundingClientRect().top < stuckBottom() - 4) scrollToInList(list);
  };

  tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));
  $('.tabs', carta).addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex(t => t.classList.contains('is-active'));
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); setMode(n.dataset.mode);
  });

  const markCurrent = it => items.forEach(o => o.classList.toggle('is-current', o === it));
  subtabs.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.drink === 'matcha') {   // Matcha opens on Mango, selected by default
      markCurrent($('[data-flavour="mango"]', carta));
      if (drink === 'matcha') showFlavour('mango');
    } else markCurrent(null);
    const wasMatcha = drink === 'matcha';
    const done = setDrink(b.dataset.drink);
    if (b.dataset.drink === 'matcha' && !wasMatcha) {
      const token = flavourToken;
      done.then(() => { if (drink === 'matcha' && flavourToken === token && carta.dataset.mode === 'bebidas') showFlavour('mango'); });
    }
    scrollToInList(document.getElementById(b.dataset.drink === 'matcha' ? 'g-matcha' : 'g-cafes'));
  }));

  items.forEach(it => it.addEventListener('click', () => {
    markCurrent(it);
    const key = it.dataset.flavour;
    if (!key) { setDrink(it.dataset.drink); return; }       // café: back to the latte
    if (drink === 'matcha') { showFlavour(key); return; }
    const done = setDrink('matcha');                         // morph to Mango first, then fade to the flavour
    const token = flavourToken;
    label.textContent = FLAVOURS[key][0];
    done.then(() => { if (drink === 'matcha' && flavourToken === token && carta.dataset.mode === 'bebidas') showFlavour(key); });
  }));

  replayBtn.addEventListener('click', e => { e.stopPropagation(); playBowl(); });
  stage.addEventListener('click', () => {
    if (carta.dataset.mode === 'comer') playBowl();
    else { markCurrent(drink === 'cafe' ? $('[data-flavour="mango"]', carta) : null); setDrink(drink === 'cafe' ? 'matcha' : 'cafe'); }
  });

  /* ======================================================================
     4. Outro — unboxing plays once
     ====================================================================== */
  const box = new FrameSeq($('#cv-box'), 'outro-box', 102);
  const outro = $('#outro-stage');
  const outroStill = $('.outro-still', outro) || document.createElement('img');
  new IntersectionObserver((entries, io) => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    heroReady.then(() => box.load()).then(() => box.draw(0, true));
  }, { rootMargin: '150% 0px' }).observe(outro);

  let boxToken = 0;
  new IntersectionObserver(async entries => {
    const e = entries[entries.length - 1];
    const token = ++boxToken;
    if (!e.isIntersecting) {            // left the viewport: rewind, ready for the next visit
      box.stop(); box.pos = 0; box.draw(0, true);
      outroStill.classList.remove('is-on');
      return;
    }
    await box.load();
    await box.whenAll(4000);
    if (token !== boxToken) return;
    await box.play(box.count - 1, FPS, 0);
    if (token === boxToken && outroStill.complete && outroStill.naturalWidth) outroStill.classList.add('is-on');
  }, { threshold: 0.45 }).observe(outro);

  /* ======================================================================
     Reveals
     ====================================================================== */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; revealIO.observe(el); });

  // Recompute pin positions once fonts/images settle
  window.addEventListener('load', () => { if (hasGsap) ScrollTrigger.refresh(); if (lenis) lenis.resize(); });
})();

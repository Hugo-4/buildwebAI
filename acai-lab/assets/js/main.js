/* ==========================================================================
   Açai Lab Café — interactions
   - FrameSeq: image sequences drawn on <canvas> (scrubbed or played)
   - Hero: GSAP ScrollTrigger pin, 2 sequences chained, smoothed with rAF
   - La Carta: click & tap morph (café ⇄ matcha), bowl toppings replay
   - Outro: unboxing auto-plays once when it enters the viewport
   ========================================================================== */
(() => {
  'use strict';

  /* ---- Config: the only place to edit links ---- */
  const RAPPI_URL = 'https://www.rappi.com.pe/'; // ← reemplazar por el enlace directo de Açai Lab en Rappi
  const SEQ_BASE = './assets/seq/';
  const FPS = 24;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqDesktop = window.matchMedia('(min-width: 900px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  $$('.js-rappi').forEach(a => { a.href = RAPPI_URL; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

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
      this.want = 0;
      this.drawn = -1;
      this.pos = 0;           // fractional frame for play()
      this.raf = 0;
      this.started = false;
      this.variant = null;
      this._allWaiters = [];
      this._resize();
      if ('ResizeObserver' in window) new ResizeObserver(() => this._resize()).observe(canvas);
    }

    _pickVariant() {
      const w = (this.cv.clientWidth || 400) * Math.min(window.devicePixelRatio || 1, 2);
      return w > 640 ? 'lg' : 'sm';
    }

    _resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(this.cv.clientWidth * dpr));
      const h = Math.max(1, Math.round(this.cv.clientHeight * dpr));
      if (this.cv.width === w && this.cv.height === h) return;
      this.cv.width = w; this.cv.height = h;
      this.drawn = -1;
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
      this.variant = this._pickVariant();
      const queue = this._order();
      let resolveReady;
      this._ready = new Promise(r => { resolveReady = r; });
      let active = 0;
      const next = () => {
        while (active < 6 && queue.length) {
          const i = queue.shift();
          active++;
          const img = new Image();
          img.decoding = 'async';
          img.onload = img.onerror = () => {
            active--;
            if (img.naturalWidth) {
              this.imgs[i] = img; this.loaded[i] = 1; this.nLoaded++;
              if (i === 0) resolveReady();
              // redraw if this frame is closer to what we want than what is shown
              if (this.drawn < 0 || Math.abs(i - this.want) < Math.abs(this.drawn - this.want)) this.draw(this.want, true);
            } else if (i === 0) resolveReady();
            if (!queue.length && active === 0) this._allWaiters.splice(0).forEach(f => f());
            next();
          };
          img.src = this.src(i);
        }
      };
      next();
      return this._ready;
    }

    /** Resolves when every frame is loaded, or after `timeout` ms. */
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

    draw(i, force = false) {
      i = Math.round(clamp(i, 0, this.count - 1));
      this.want = i;
      const k = this._nearest(i);
      if (k < 0 || (k === this.drawn && !force)) return;
      const img = this.imgs[k];
      const { width: cw, height: ch } = this.cv;
      const ctx = this.ctx;
      ctx.fillStyle = '#F7F5F0';
      ctx.fillRect(0, 0, cw, ch);
      const s = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);   // contain
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      this.drawn = k;
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
  const steps = $$('.ritual-step', hero);
  const bar = $('.ritual-progress span', hero);

  blend.load().then(() => {
    blend.draw(0, true);
    // second clip starts once the first one has its keyframes in
    setTimeout(() => dispense.load(), 600);
  });

  let target = 0, smooth = 0, phase2 = false, heroRaf = 0;
  const renderHero = () => {
    smooth += (target - smooth) * 0.2;
    if (Math.abs(target - smooth) < 0.0004) smooth = target;
    const p = smooth;
    blend.draw(clamp(p / 0.5) * (blend.count - 1));
    dispense.draw(clamp((p - 0.5) / 0.5) * (dispense.count - 1));
    // hysteresis around 50% so the crossfade never flickers
    if (!phase2 && p > 0.51) phase2 = true;
    else if (phase2 && p < 0.49) phase2 = false;
    hero.classList.toggle('is-phase2', phase2);
    steps[0].classList.toggle('is-active', !phase2);
    steps[1].classList.toggle('is-active', phase2);
    bar.style.transform = `scaleX(${p})`;
    heroRaf = smooth !== target ? requestAnimationFrame(renderHero) : 0;
  };
  const kickHero = () => { if (!heroRaf) heroRaf = requestAnimationFrame(renderHero); };

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=180%',          // 100vh viewport + 180vh of scroll = 280vh total
      pin: true,
      anticipatePin: 1,
      onUpdate: self => { target = self.progress; if (self.progress > 0.02) dispense.load(); kickHero(); },
    });

    // Hero copy entrance
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
  const bowlSeq = new FrameSeq($('#cv-bowl'), 'carta-bowl', 240);
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

  // preload the carta sequences before the user gets there
  new IntersectionObserver((entries, io) => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    drinkSeq.load();
    const idle = window.requestIdleCallback || (f => setTimeout(f, 1200));
    idle(() => bowlSeq.load());
  }, { rootMargin: '1200px 0px' }).observe(carta);

  // bottom edge of the sticky area once it is stuck (not its current, possibly un-stuck, position)
  const stuckBottom = () => header.offsetHeight + (mqDesktop.matches ? 0 : visual.offsetHeight);

  /** Scroll so `el` sits just under the sticky visual (mobile) or header (desktop). */
  const scrollToInList = el => {
    const offset = stuckBottom() + (mqDesktop.matches ? 24 : 12);
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  let drink = 'cafe';
  const setDrink = kind => {
    if (carta.dataset.mode !== 'bebidas') setMode('bebidas');
    subtabs.forEach(b => {
      const on = b.dataset.drink === kind;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
    if (kind === drink) return;
    drink = kind;
    carta.dataset.drink = kind;
    label.textContent = POSTERS[kind][1];
    setPoster(kind);
    // forward (café → matcha) at 1.5× or backwards (matcha → café)
    drinkSeq.play(kind === 'matcha' ? drinkSeq.count - 1 : 0, FPS * 1.5);
  };

  let bowlPlayToken = 0;
  const playBowl = async () => {
    const token = ++bowlPlayToken;
    bowlSeq.stop();
    bowlSeq.pos = 0;
    bowlSeq.draw(0, true);
    await bowlSeq.whenAll(2500);
    if (token !== bowlPlayToken || carta.dataset.mode !== 'comer') return;
    bowlSeq.play(bowlSeq.count - 1, FPS, 0);
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
    label.textContent = comer ? POSTERS.bowl[1] : POSTERS[drink][1];
    setPoster(comer ? 'bowl' : drink);
    if (comer) playBowl(); else bowlSeq.stop();
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

  subtabs.forEach(b => b.addEventListener('click', () => {
    setDrink(b.dataset.drink);
    scrollToInList(document.getElementById(b.dataset.drink === 'matcha' ? 'g-matcha' : 'g-cafes'));
  }));

  items.forEach(it => it.addEventListener('click', () => {
    items.forEach(o => o.classList.toggle('is-current', o === it));
    setDrink(it.dataset.drink);
  }));

  replayBtn.addEventListener('click', e => { e.stopPropagation(); playBowl(); });
  stage.addEventListener('click', () => {
    if (carta.dataset.mode === 'comer') playBowl();
    else setDrink(drink === 'cafe' ? 'matcha' : 'cafe');
  });

  /* ======================================================================
     3. El Universo Lab — photos with designed fallbacks
     ====================================================================== */
  const FALLBACK_LABELS = { collab: 'Curva Studio Pilates', collab2: 'Mugler · The Charming Booth' };
  $$('.tile-media').forEach(m => {
    const img = $('img', m);
    const miss = () => {
      m.classList.add('is-missing');
      if (FALLBACK_LABELS[m.dataset.fallback]) m.dataset.label = FALLBACK_LABELS[m.dataset.fallback];
    };
    if (img.complete && !img.naturalWidth) miss();
    img.addEventListener('error', miss);
  });

  /* ======================================================================
     4. Outro — unboxing plays once
     ====================================================================== */
  const box = new FrameSeq($('#cv-box'), 'outro-box', 102);
  const outro = $('#outro-stage');
  new IntersectionObserver((entries, io) => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); box.load().then(() => box.draw(0, true)); }
  }, { rootMargin: '1000px 0px' }).observe(outro);

  new IntersectionObserver(async (entries, io) => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    await box.load();
    await box.whenAll(3000);
    box.play(box.count - 1, FPS, 0);
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
  }, { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 80}ms`; revealIO.observe(el); });

  // Recompute pin positions once fonts/images settle
  window.addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh());
})();

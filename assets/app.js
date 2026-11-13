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

  /* ---------- Vitrine : plat en rotation au scroll ---------- */
  if (hasGsap && !reduce) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '#vitrine', start: 'top top', end: '+=140%', pin: true, scrub: 0.6, anticipatePin: 1 },
      });
      tl.fromTo('#dish', { rotation: -40, scale: 0.86 }, { rotation: 280, scale: 1, duration: 1 }, 0)
        .fromTo('.dish-tilt', { rotationX: 48 }, { rotationX: 8, duration: 0.6, ease: 'power2.out' }, 0)
        .fromTo('.dish-orbit', { rotation: 0 }, { rotation: -90, duration: 1 }, 0)
        .from('.badge-1', { opacity: 0, x: -24, duration: 0.12, ease: 'power2.out' }, 0.14)
        .from('.badge-2', { opacity: 0, x: 24, duration: 0.12, ease: 'power2.out' }, 0.38)
        .from('.badge-3', { opacity: 0, x: -24, duration: 0.12, ease: 'power2.out' }, 0.62);
    });
    mm.add('(max-width: 1023px)', () => {
      gsap.fromTo('#dish', { rotation: -60, scale: 0.9 }, {
        rotation: 200, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.dish-wrap', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
      });
      gsap.fromTo('.dish-tilt', { rotationX: 40 }, {
        rotationX: 6, ease: 'none',
        scrollTrigger: { trigger: '.dish-wrap', start: 'top bottom', end: 'center center', scrub: 0.5 },
      });
    });
  }

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
  mq.addEventListener?.('change', () => placeInd(tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')));

  /* ---------- Formulaire audit ---------- */
  const form = $('#auditForm');
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

  window.addEventListener('load', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();

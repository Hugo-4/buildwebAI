// L'Épicerie Jaune : statut d'ouverture, horaires du jour et menu du jour (data/menu.json, mis à jour depuis l'ardoise).
(function () {
  'use strict';

  // Horaires en minutes depuis minuit. 0 = dimanche.
  var HORAIRES = {
    0: [9 * 60, 13 * 60],
    1: [8 * 60, 19 * 60 + 30], 2: [8 * 60, 19 * 60 + 30], 3: [8 * 60, 19 * 60 + 30],
    4: [8 * 60, 19 * 60 + 30], 5: [8 * 60, 19 * 60 + 30],
    6: [9 * 60, 19 * 60 + 30]
  };
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function hhmm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + (m ? String(m).padStart(2, '0') : '');
  }

  // Heure de Paris, quel que soit le fuseau du visiteur
  function maintenantParis() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var jour = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { jour: jour, min: parseInt(get('hour'), 10) % 24 * 60 + parseInt(get('minute'), 10) };
  }

  function statut() {
    var el = document.getElementById('status'), txt = document.getElementById('status-txt');
    if (!el || !txt) return;
    var now = maintenantParis(), h = HORAIRES[now.jour];
    document.querySelectorAll('.horaires tr').forEach(function (tr) {
      tr.classList.toggle('is-today', tr.dataset.days.split(',').indexOf(String(now.jour)) !== -1);
    });
    if (now.min >= h[0] && now.min < h[1]) {
      el.className = 'status is-open';
      txt.textContent = 'Ouvert maintenant, jusqu’à ' + hhmm(h[1]);
    } else if (now.min < h[0]) {
      el.className = 'status is-closed';
      txt.textContent = 'Fermé pour l’instant, ouverture à ' + hhmm(h[0]);
    } else {
      var d = (now.jour + 1) % 7;
      el.className = 'status is-closed';
      txt.textContent = 'Fermé, réouverture ' + JOURS[d] + ' à ' + hhmm(HORAIRES[d][0]);
    }
  }

  function li(cls, text) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  }

  var FRUITS = ['poire', 'pomme', 'agrume', 'oignon', 'citron', 'fraise'];

  function afficherMenu(data) {
    var plats = Array.isArray(data.plats) ? data.plats.filter(function (p) { return p && p.nom; }) : [];
    var ul = document.getElementById('menu-plats');
    if (ul && plats.length) {
      ul.textContent = '';
      plats.forEach(function (p) {
        var item = document.createElement('li');
        item.appendChild(li('plat', p.nom));
        if (p.prix) item.appendChild(li('prix', p.prix));
        if (p.detail) item.appendChild(li('detail', p.detail));
        ul.appendChild(item);
      });
    }
    var dateEl = document.getElementById('menu-date');
    if (dateEl && data.date) {
      var d = new Date(data.date + 'T12:00:00');
      if (!isNaN(d)) dateEl.textContent = 'Menu du ' + d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    var note = document.getElementById('menu-note');
    if (note) { note.textContent = data.message || ''; note.hidden = !data.message; }
    var maj = document.getElementById('menu-maj');
    if (maj && data.maj) {
      var m = new Date(data.maj);
      if (!isNaN(m)) maj.textContent = 'Mis à jour le ' + m.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ' à ' + m.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    var arr = Array.isArray(data.arrivages) ? data.arrivages.filter(function (a) { return a && a.nom; }) : [];
    var grid = document.getElementById('arrivages');
    if (grid && arr.length) {
      grid.textContent = '';
      arr.slice(0, 8).forEach(function (a, i) {
        var card = document.createElement('li');
        card.className = 'arr';
        var img = document.createElement('img');
        img.src = 'img/fruit-' + FRUITS[i % FRUITS.length] + '.webp';
        img.alt = '';
        img.loading = 'lazy';
        var h3 = document.createElement('h3');
        h3.textContent = a.nom;
        card.appendChild(img);
        card.appendChild(h3);
        if (a.detail) { var p = document.createElement('p'); p.textContent = a.detail; card.appendChild(p); }
        grid.appendChild(card);
      });
    }
  }

  function chargerMenu() {
    fetch('data/menu.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(afficherMenu)
      .catch(function () { /* le menu statique de la page reste affiché */ });
  }

  statut();
  setInterval(statut, 60000);
  chargerMenu();
  var an = document.getElementById('annee');
  if (an) an.textContent = new Date().getFullYear();
})();

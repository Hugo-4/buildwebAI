// Espace gérant : photo de l'ardoise → lecture par l'IA (api/ardoise.php) → correction → publication dans data/menu.json
(function () {
  'use strict';
  var API = '../api/ardoise.php';
  var mdp = '';
  var $ = function (id) { return document.getElementById(id); };

  function msg(el, text, type) { el.textContent = text; el.className = 'msg' + (type ? ' ' + type : ''); }

  function post(body, isForm) {
    return fetch(API, isForm ? { method: 'POST', body: body } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) throw new Error(data.erreur || 'Erreur ' + r.status);
          return data;
        });
      });
  }

  // ---- Connexion (le mot de passe reste en mémoire le temps de la session de l'onglet)
  try { mdp = sessionStorage.getItem('ej-mdp') || ''; } catch (e) { mdp = ''; }
  function ouvrir() { $('login').hidden = true; $('app').hidden = false; }
  if (mdp) ouvrir();

  $('login').addEventListener('submit', function (e) {
    e.preventDefault();
    var essai = $('mdp').value;
    msg($('login-msg'), 'Vérification…');
    post({ action: 'verifier', mot_de_passe: essai }).then(function () {
      mdp = essai;
      try { sessionStorage.setItem('ej-mdp', mdp); } catch (err) { /* sans stockage, il faudra se reconnecter */ }
      msg($('login-msg'), '');
      ouvrir();
    }).catch(function (err) { msg($('login-msg'), err.message, 'err'); });
  });

  // ---- Lignes éditables
  function ajouterLigne(conteneur, tpl, valeurs) {
    var row = $(tpl).content.firstElementChild.cloneNode(true);
    row.querySelectorAll('input').forEach(function (inp) { inp.value = (valeurs && valeurs[inp.dataset.k]) || ''; });
    row.querySelector('.del').addEventListener('click', function () { row.remove(); });
    $(conteneur).appendChild(row);
  }
  function lire(conteneur) {
    return Array.prototype.map.call($(conteneur).querySelectorAll('.row'), function (row) {
      var o = {};
      row.querySelectorAll('input').forEach(function (inp) { o[inp.dataset.k] = inp.value.trim(); });
      return o;
    }).filter(function (o) { return o.nom; });
  }
  function remplir(menu) {
    $('date').value = menu.date || new Date().toISOString().slice(0, 10);
    $('plats').textContent = '';
    $('arrivages').textContent = '';
    (menu.plats && menu.plats.length ? menu.plats : [{}]).forEach(function (p) { ajouterLigne('plats', 'tpl-plat', p); });
    (menu.arrivages || []).forEach(function (a) { ajouterLigne('arrivages', 'tpl-arr', a); });
    $('message').value = menu.message || '';
    $('edition').hidden = false;
    msg($('pub-msg'), '');
    $('edition').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('add-plat').addEventListener('click', function () { ajouterLigne('plats', 'tpl-plat'); });
  $('add-arr').addEventListener('click', function () { ajouterLigne('arrivages', 'tpl-arr'); });

  // ---- Photo : réduite à 1600 px avant l'envoi (plus rapide en 4G, suffisant pour lire l'ardoise)
  function reduire(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, 1600 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Photo illisible.')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { reject(new Error('Cette photo ne peut pas être ouverte. Réessayez.')); };
      img.src = URL.createObjectURL(file);
    });
  }

  $('photo').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    var out = $('photo-msg');
    msg(out, 'Lecture de l’ardoise… (quelques secondes)');
    reduire(file).then(function (blob) {
      var ap = document.createElement('img');
      ap.className = 'apercu-photo';
      ap.alt = 'Photo de l’ardoise envoyée';
      ap.src = URL.createObjectURL(blob);
      $('apercu-photo').replaceChildren(ap);
      var fd = new FormData();
      fd.append('action', 'analyser');
      fd.append('mot_de_passe', mdp);
      fd.append('photo', blob, 'ardoise.jpg');
      return post(fd, true);
    }).then(function (data) {
      msg(out, 'Ardoise lue. Vérifiez le menu ci-dessous.', 'ok');
      remplir(data.menu);
    }).catch(function (err) {
      msg(out, err.message, 'err');
    }).finally(function () { $('photo').value = ''; });
  });

  $('sans-photo').addEventListener('click', function () {
    fetch('../data/menu.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(remplir)
      .catch(function () { remplir({}); });
  });

  // ---- Publication
  $('edition').addEventListener('submit', function (e) {
    e.preventDefault();
    var plats = lire('plats');
    if (!plats.length) { msg($('pub-msg'), 'Ajoutez au moins un plat avant de publier.', 'err'); return; }
    var btn = $('publier');
    btn.disabled = true;
    msg($('pub-msg'), 'Publication…');
    post({
      action: 'publier',
      mot_de_passe: mdp,
      menu: { date: $('date').value, plats: plats, arrivages: lire('arrivages'), message: $('message').value.trim() }
    }).then(function () {
      msg($('pub-msg'), 'Publié. Le menu est en ligne sur la page d’accueil.', 'ok');
    }).catch(function (err) {
      if (/mot de passe/i.test(err.message)) { try { sessionStorage.removeItem('ej-mdp'); } catch (x) { /* rien */ } }
      msg($('pub-msg'), err.message, 'err');
    }).finally(function () { btn.disabled = false; });
  });
})();

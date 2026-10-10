/* Hub de proyectos de Ulises Bentancor. Todo se arma a partir de projects.json. */
(function () {
  'use strict';

  var CATEGORIES = {
    juego: 'Juegos', web: 'Webs', herramienta: 'Herramientas',
    emprendimiento: 'Emprendimientos', libro: 'Libros', curso: 'De cursada'
  };
  var CATEGORY_SINGULAR = {
    juego: 'Juego', web: 'Web', herramienta: 'Herramienta',
    emprendimiento: 'Emprendimiento', libro: 'Libro', curso: 'Cursada'
  };
  var STATUSES = { online: 'Online', 'en-desarrollo': 'En desarrollo' };

  var state = { q: '', cat: 'todas', status: 'todos' };
  var projects = [];
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Tema ---------- */
  function effectiveTheme() {
    var t = document.documentElement.dataset.theme;
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function updateToggleLabel() {
    var next = effectiveTheme() === 'dark' ? 'claro' : 'oscuro';
    $('themeToggle').setAttribute('aria-label', 'Cambiar a modo ' + next);
    $('themeToggle').title = 'Cambiar a modo ' + next;
  }
  $('themeToggle').addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateToggleLabel();
  });
  updateToggleLabel();

  /* ---------- Utilidades ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function fmtDate(iso) {
    var p = String(iso).split('-').map(Number);
    var d = new Date(Date.UTC(p[0], (p[1] || 1) - 1, p[2] || 1));
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  function safeUrl(u) {
    return /^(https:\/\/|assets\/)/.test(u || '') ? u : null;
  }

  /* Placeholder SVG por categoría (para proyectos sin captura real). */
  var ICONS = {
    juego: '<path d="M22 38h20a10 10 0 0 1 9.6 12.7l-1.4 5a6 6 0 0 1-10 2.6L36 54h-8l-4.2 4.3a6 6 0 0 1-10-2.6l-1.4-5A10 10 0 0 1 22 38z"/><path d="M24 44v8M20 48h8"/><circle cx="40" cy="46" r="1.6"/><circle cx="44" cy="50" r="1.6"/>',
    web: '<rect x="12" y="30" width="40" height="30" rx="4"/><path d="M12 38h40"/><circle cx="17" cy="34" r="1.2"/><circle cx="21" cy="34" r="1.2"/><path d="M19 46h14M19 52h22"/>',
    herramienta: '<path d="M44 30a8 8 0 0 0-10 10L18 56a3 3 0 0 0 4 4l16-16a8 8 0 0 0 10-10l-5 5-4-1-1-4z"/>',
    emprendimiento: '<path d="M14 58V40l9-6v8l9-6v8l9-6v20z"/><path d="M45 58V32h6v26"/><path d="M12 58h42"/>',
    libro: '<path d="M32 36c-5-4-12-4-18-2v24c6-2 13-2 18 2 5-4 12-4 18-2V34c-6-2-13-2-18 2z"/><path d="M32 36v24"/>',
    curso: '<path d="M10 40l22-10 22 10-22 10z"/><path d="M20 45v8c6 5 18 5 24 0v-8"/><path d="M54 40v10"/>'
  };
  var HUES = { juego: [262, 300], web: [200, 230], herramienta: [165, 195], emprendimiento: [28, 350], libro: [40, 15], curso: [220, 260] };
  function placeholder(p) {
    var h = HUES[p.category] || [230, 270];
    var gid = 'g-' + p.id;
    var svg = '<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      (CATEGORY_SINGULAR[p.category] || 'Proyecto') + ' (sin captura todavía)">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + h[0] + ' 70% 46%)"/><stop offset="1" stop-color="hsl(' + h[1] + ' 65% 30%)"/></linearGradient></defs>' +
      '<rect width="160" height="100" fill="url(#' + gid + ')"/>' +
      '<g opacity=".12" fill="#fff"><circle cx="140" cy="10" r="38"/><circle cx="12" cy="96" r="30"/></g>' +
      '<g transform="translate(48 2) scale(1)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[p.category] || ICONS.web) + '</g>' +
      '<text x="80" y="88" text-anchor="middle" fill="#fff" fill-opacity=".85" font-family="system-ui,sans-serif" font-size="8" font-weight="700" letter-spacing="1.2">' +
      (p.status === 'en-desarrollo' ? 'EN DESARROLLO' : (CATEGORY_SINGULAR[p.category] || '').toUpperCase()) + '</text></svg>';
    var wrap = el('div', { class: 'thumb' });
    wrap.innerHTML = svg;
    return wrap;
  }

  /* ---------- Tarjetas ---------- */
  function card(p, headingLevel) {
    var img = safeUrl(p.image);
    var thumb = img
      ? el('div', { class: 'thumb' }, [el('img', {
          src: img, alt: 'Captura de ' + p.title, loading: 'lazy', decoding: 'async', width: '640', height: '400'
        })])
      : placeholder(p);

    var badges = el('div', { class: 'badges' }, [
      el('span', { class: 'badge s-' + p.status, text: STATUSES[p.status] || p.status }),
      el('span', { class: 'badge', text: CATEGORY_SINGULAR[p.category] || p.category })
    ]);

    var tags = el('ul', { class: 'tags', 'aria-label': 'Etiquetas' },
      (p.tags || []).map(function (t) { return el('li', { text: t }); }));

    var foot = el('div', { class: 'card-foot' });
    var live = safeUrl(p.liveUrl), repo = safeUrl(p.repoUrl);
    if (live) foot.appendChild(el('a', {
      class: 'btn btn-primary btn-sm', href: live, rel: 'noopener',
      text: p.category === 'juego' ? 'Jugar' : 'Ver web',
      'aria-label': (p.category === 'juego' ? 'Jugar ' : 'Ver web de ') + p.title
    }));
    if (repo) foot.appendChild(el('a', {
      class: 'btn btn-sm', href: repo, rel: 'noopener', text: 'Código', 'aria-label': 'Código de ' + p.title + ' en GitHub'
    }));
    if (!live && !repo) foot.appendChild(el('span', { class: 'no-links', text: 'Todavía sin link público' }));
    foot.appendChild(el('time', { datetime: p.updated, text: 'Act. ' + fmtDate(p.updated) }));

    return el('article', { class: 'card', id: 'p-' + p.id }, [
      thumb,
      el('div', { class: 'card-body' }, [
        badges,
        el(headingLevel || 'h3', { text: p.title }),
        el('p', { class: 'desc', text: p.description }),
        tags,
        foot
      ])
    ]);
  }

  /* ---------- Filtros ---------- */
  function matches(p) {
    if (state.cat !== 'todas' && p.category !== state.cat) return false;
    if (state.status !== 'todos' && p.status !== state.status) return false;
    if (!state.q) return true;
    var hay = norm([p.title, p.description, (p.tags || []).join(' '), CATEGORY_SINGULAR[p.category]].join(' '));
    return norm(state.q).split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function buildChips(container, options, key) {
    Object.keys(options).forEach(function (val) {
      var b = el('button', { type: 'button', class: 'chip', 'data-value': val, 'aria-pressed': String(state[key] === val) });
      b.appendChild(document.createTextNode(options[val].label));
      if (options[val].n != null) b.appendChild(el('span', { class: 'n', text: '(' + options[val].n + ')', 'aria-hidden': 'true' }));
      b.addEventListener('click', function () {
        state[key] = val;
        Array.prototype.forEach.call(container.querySelectorAll('.chip'), function (c) {
          c.setAttribute('aria-pressed', String(c.getAttribute('data-value') === val));
        });
        render();
      });
      container.appendChild(b);
    });
  }

  function render() {
    var list = projects.filter(matches);
    var main = list.filter(function (p) { return p.category !== 'curso'; });
    var past = list.filter(function (p) { return p.category === 'curso'; });
    var mg = $('mainGrid'), pg = $('pastGrid');
    mg.replaceChildren.apply(mg, main.map(function (p) { return card(p); }));
    pg.replaceChildren.apply(pg, past.map(function (p) { return card(p, 'h4'); }));
    mg.hidden = main.length === 0;
    $('pastBlock').hidden = past.length === 0;
    $('emptyState').hidden = list.length !== 0;
    $('resultCount').textContent = list.length === projects.length
      ? projects.length + ' proyectos'
      : list.length === 1 ? '1 proyecto encontrado' : list.length + ' proyectos encontrados';
  }

  function reset() {
    state.q = ''; state.cat = 'todas'; state.status = 'todos';
    $('q').value = '';
    [['catChips', 'todas'], ['statusChips', 'todos']].forEach(function (pair) {
      Array.prototype.forEach.call($(pair[0]).querySelectorAll('.chip'), function (c) {
        c.setAttribute('aria-pressed', String(c.getAttribute('data-value') === pair[1]));
      });
    });
    render();
    $('q').focus();
  }

  /* status "archivado" = oculto: queda en projects.json pero no se muestra en ningún lado. */
  var HIDDEN_STATUSES = ['archivado'];

  function init(all) {
    var data = all.filter(function (p) { return HIDDEN_STATUSES.indexOf(p.status) === -1; });
    projects = data.slice().sort(function (a, b) {
      return a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : a.title.localeCompare(b.title, 'es');
    });

    var fg = $('featuredGrid');
    var feat = data.filter(function (p) { return p.featured; }); // destacados: en el orden de projects.json
    fg.replaceChildren.apply(fg, feat.map(function (p) { return card(p); }));
    $('destacados').hidden = feat.length === 0;

    var count = function (k, v) { return projects.filter(function (p) { return p[k] === v; }).length; };
    var catOpts = { todas: { label: 'Todas', n: projects.length } };
    Object.keys(CATEGORIES).forEach(function (c) { var n = count('category', c); if (n) catOpts[c] = { label: CATEGORIES[c], n: n }; });
    var stOpts = { todos: { label: 'Todos' } };
    Object.keys(STATUSES).forEach(function (s) { var n = count('status', s); if (n) stOpts[s] = { label: STATUSES[s], n: n }; });
    buildChips($('catChips'), catOpts, 'cat');
    buildChips($('statusChips'), stOpts, 'status');

    var params = new URLSearchParams(location.search);
    if (params.get('q')) { state.q = params.get('q'); $('q').value = state.q; }

    $('q').addEventListener('input', function (e) { state.q = e.target.value.trim(); render(); });
    $('resetBtn').addEventListener('click', reset);

    var last = projects.reduce(function (m, p) { return p.updated > m ? p.updated : m; }, '');
    if (last) { $('lastUpdated').dateTime = last; $('lastUpdated').textContent = fmtDate(last); $('year').textContent = last.slice(0, 4); }
    render();
  }

  fetch('projects.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(init)
    .catch(function (err) {
      $('emptyState').hidden = false;
      $('emptyState').textContent = 'No pude cargar la lista de proyectos (' + err.message + '). Probá recargar la página.';
      $('pastBlock').hidden = true;
    });
})();

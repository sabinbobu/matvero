/* =========================================================================
   MATVERO — Tema personalizata (fisier JS)
   Se lipeste integral in Gomag > Aspect > Editor cod > JS (theme/100.js)
   Functioneaza impreuna cu matvero.css. Vanilla JS, fara dependinte.
   -------------------------------------------------------------------------
   Ce face:
   1. Injecteaza HERO sub header (doar pe homepage)
   2. Injecteaza banda de incredere
   3. Injecteaza grila de categorii (citita din meniul real al site-ului)
   4. Injecteaza blocul "De ce Matvero"
   5. Injecteaza banda de cerere oferta inainte de footer
   6. Header compact la scroll, bara de progres, reveal la scroll
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     CONFIG — singurul loc pe care trebuie sa il editezi
     --------------------------------------------------------------- */
  var CFG = {
    // !! Verifica aceste doua adrese in site-ul tau si pune linkurile reale
    urlProduse:  '/produse',
    urlContact:  '/contact',

    // inaltimea zonei de imagine din cardul de produs (px)
    produsImgH:  250,

    // Bannere: textul din subsolul fiecarui banner, in ordinea din platforma.
    // Lasa gol si se ia din atributul alt/title al imaginii.
    bannerTitluri: ['Silicon și etanșanți', 'Fixaje de acoperiș'],
    bannerCta:     'Vezi produsele',

    // cate caractere pastram din textul unui articol pe cardurile de blog
    blogMaxChars: 165,
    telefon:     '',           // ex. '0722 000 000' — lasa gol si butonul dispare
    email:       '',           // ex. 'comenzi@matvero.ro'

    hero: {
      kicker: 'Materiale · Adevărate',
      titlu:  'Etanșări și fixaje care <em>țin cât construcția</em>.',
      lead:   'Siliconi neutri, etanșanți profesionali și fixaje de acoperiș selectate pentru meseriași. Fișe tehnice complete, stoc real, fără compromisuri de chimie.',
      // ancora spre grila de categorii de mai jos, NU spre /produse: acea
      // pagina se numeste chiar "Toate Produsele" — identic cu butonul de
      // meniu de deasupra, care e oricum doar un declansator de dropdown
      // (href="#mm-2", nu navigheaza). Doua butoane cu acelasi mesaj in
      // acelasi ecran citesc ca o dublura, chiar daca fac lucruri diferite.
      ctaPrimar:    { text: 'Vezi categoriile', url: '#mv-categorii' },
      ctaSecundar:  { text: 'Cere ofertă pentru firmă', url: '/contact' },
      meta: [
        { sus: 'Livrare 24–48h', jos: 'Expediere' },
        { sus: 'Consultanță tehnică', jos: 'Suport' },
        { sus: 'Torggler', jos: 'Brand partener' }
      ],
      panelTitlu: 'Selecție tehnică',
      specs: [
        { nume: 'Reticulare neutră',        val: 'fără miros acid' },
        { nume: 'Temperatură exploatare',   val: '−50°C … +150°C' },
        { nume: 'Rezistență UV',            val: 'EN 15651-1' },
        { nume: 'Aplicare',                 val: 'interior · exterior' }
      ]
    },

    trust: [
      { titlu: 'Livrare 24–48h',        text: 'Comenzile confirmate până la ora 14:00 pleacă în aceeași zi.' },
      { titlu: 'Fișe tehnice complete', text: 'Fiecare produs vine cu specificații și domenii de utilizare.' },
      { titlu: 'Consultanță tehnică',   text: 'Îți spunem ce se aplică pe tablă, faianță sau panou sandwich.' },
      { titlu: 'Condiții pentru firme', text: 'Factură, preț de volum și comenzi recurente pentru echipe.' }
    ],

    categoriiTitlu: 'Ce găsești în stoc',
    categoriiKicker: 'Categorii',
    // Textele scurte pe categorie (potrivite dupa numele din meniu).
    categoriiDescrieri: {
      'Fixaje de acoperiș':   'Șuruburi, șaibe și soluții de prindere pentru tablă și panouri sandwich.',
      'Silicon și Etanșanți': 'Siliconi neutri, acetici și MS polimer pentru rosturi și îmbinări.'
    },
    // Lista de rezerva: se foloseste doar daca meniul nu poate fi citit.
    // Pune aici linkurile reale ale categoriilor tale.
    categoriiFallback: [
      { nume: 'Silicon și Etanșanți', url: '/silicon-si-etansanti' },
      { nume: 'Fixaje de acoperiș',   url: '/fixaje-de-acoperis' }
    ],

    why: {
      kicker: 'De ce Matvero',
      titlu:  'Alegem produsul după chimie, nu după preț de raft.',
      celule: [
        { titlu: 'Verificate de echipele noastre', text: 'Testăm aderența și comportamentul în exterior înainte să listăm un produs. Ce nu ține, nu intră în catalog.' },
        { titlu: 'Potrivit pe suport, nu universal', text: 'Tablă zincată, aluminiu, cupru, faianță sau panou termoizolant — fiecare suport are etanșantul lui.' },
        { titlu: 'Vorbim limba șantierului',        text: 'Consiliere directă, fără marketing: îți spunem ce cantitate ai nevoie și cum se aplică corect.' }
      ]
    },

    quote: {
      kicker: 'Proiecte și cantități mari',
      titlu:  'Ai un proiect? Îți facem ofertă în aceeași zi.',
      text:   'Trimite-ne lista de materiale sau descrie lucrarea. Revenim cu preț, disponibilitate și recomandarea tehnică potrivită.',
      cta:    { text: 'Cere ofertă', url: '/contact' }
    }
  };

  /* --------------------------- utilitare ------------------------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }
  function isHome() {
    return document.body.classList.contains('-g-pagetype-homepage');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  // eticheta tehnica; bara colorata este un span, ca sa nu depinda de "gap"
  function kicker(text, dark) {
    return '<span class="mv-kicker' + (dark ? ' on-dark' : '') + '">' +
           '<span class="mv-kicker__bar"></span>' + esc(text) + '</span>';
  }

  /* --------------------------- 1. HERO -------------------------- */
  function buildHero() {
    var h = CFG.hero;
    var meta = h.meta.map(function (m) {
      return '<div><strong>' + esc(m.sus) + '</strong><span>' + esc(m.jos) + '</span></div>';
    }).join('');
    var specs = h.specs.map(function (s) {
      return '<div class="mv-hero__spec"><b>' + esc(s.nume) + '</b><span>' + esc(s.val) + '</span></div>';
    }).join('');

    return el('section', 'mv-hero',
      '<div class="mv-hero__grid">' +
        '<div class="mv-hero__copy">' +
          kicker(h.kicker, true) +
          '<h1>' + h.titlu + '</h1>' +
          '<p class="mv-hero__lead">' + esc(h.lead) + '</p>' +
          '<div class="mv-hero__cta">' +
            '<a class="mv-btn mv-btn--primary" href="' + esc(h.ctaPrimar.url) + '">' + esc(h.ctaPrimar.text) + ' <i class="fa fa-angle-right"></i></a>' +
            '<a class="mv-btn mv-btn--ghost" href="' + esc(h.ctaSecundar.url) + '">' + esc(h.ctaSecundar.text) + '</a>' +
          '</div>' +
          '<div class="mv-hero__meta">' + meta + '</div>' +
        '</div>' +
        '<aside class="mv-hero__panel mv-reveal" data-mv-delay="2">' +
          '<h3>' + esc(h.panelTitlu) + '</h3>' + specs +
        '</aside>' +
      '</div>');
  }

  /* --------------------------- 2. TRUST ------------------------- */
  function buildTrust() {
    var items = CFG.trust.map(function (t, i) {
      return '<div class="mv-trust__item mv-reveal" data-mv-delay="' + (i % 4) + '">' +
        '<span class="mv-trust__no">' + pad(i + 1) + '</span>' +
        '<div><b>' + esc(t.titlu) + '</b><p>' + esc(t.text) + '</p></div>' +
      '</div>';
    }).join('');
    return el('section', 'mv-trust', '<div class="mv-trust__grid">' + items + '</div>');
  }

  /* --------------------------- 3. CATEGORII --------------------- */
  function readCategories() {
    var out = [];
    // subcategoriile reale din megamenu
    qa('.menu-dd .drop-list a.title').forEach(function (a) {
      var name = (a.textContent || '').trim();
      if (name && a.getAttribute('href')) out.push({ nume: name, url: a.getAttribute('href') });
    });
    // fallback: intrarile de nivel 1
    if (!out.length) {
      qa('.menu-dd .FH > li > a').forEach(function (a) {
        var name = (a.textContent || '').trim();
        if (name && a.getAttribute('href')) out.push({ nume: name, url: a.getAttribute('href') });
      });
    }
    // daca meniul nu e (inca) in DOM, folosim lista din CFG
    if (!out.length) out = (CFG.categoriiFallback || []).slice();
    return out.slice(0, 6);
  }

  function buildCats() {
    var cats = readCategories();
    if (!cats.length) return null;
    var tiles = cats.map(function (c, i) {
      var desc = CFG.categoriiDescrieri[c.nume] || '';
      return '<a class="mv-cat' + (i === 0 ? ' mv-cat--accent' : '') + '" href="' + esc(c.url) + '">' +
        '<span class="mv-cat__no">' + pad(i + 1) + ' / ' + pad(cats.length) + '</span>' +
        '<h3>' + esc(c.nume) + '</h3>' +
        (desc ? '<p>' + esc(desc) + '</p>' : '') +
        '<span class="mv-cat__go">Vezi produsele<i class="fa fa-angle-right"></i></span>' +
      '</a>';
    }).join('');

    var sec = el('section', 'mv-cats mv-sec',
      '<div class="mv-head mv-reveal">' +
        kicker(CFG.categoriiKicker) +
        '<h2>' + esc(CFG.categoriiTitlu) + '</h2>' +
        '<a class="mv-head__link" href="' + esc(CFG.urlProduse) + '">Toate produsele</a>' +
      '</div>' +
      '<div class="mv-cats__grid mv-reveal" data-mv-delay="1">' + tiles + '</div>');
    // id de ancora pentru CTA-ul din hero (CFG.hero.ctaPrimar.url) — vezi
    // nota din CFG despre de ce hero-ul nu duce spre acelasi loc ca
    // "Toate Produsele" din meniu.
    sec.id = 'mv-categorii';
    return sec;
  }

  /* --------------------------- 4. DE CE MATVERO ----------------- */
  function buildWhy() {
    var w = CFG.why;
    var cells = w.celule.map(function (c, i) {
      return '<div class="mv-why__cell mv-reveal" data-mv-delay="' + i + '">' +
        '<div class="mv-why__n">' + pad(i + 1) + '</div>' +
        '<h3>' + esc(c.titlu) + '</h3><p>' + esc(c.text) + '</p></div>';
    }).join('');
    return el('section', 'mv-why',
      '<div class="mv-sec">' +
        '<div class="mv-head mv-reveal">' + kicker(w.kicker) +
        '<h2>' + esc(w.titlu) + '</h2></div>' +
        '<div class="mv-why__grid">' + cells + '</div>' +
      '</div>');
  }

  /* --------------------------- 5. BANDA OFERTA ------------------ */
  function buildQuote() {
    var qc = CFG.quote, extra = '';
    if (CFG.telefon) {
      extra += '<a class="mv-btn mv-btn--ghost" href="tel:' + esc(CFG.telefon.replace(/\s+/g, '')) + '">' + esc(CFG.telefon) + '</a>';
    } else if (CFG.email) {
      extra += '<a class="mv-btn mv-btn--ghost" href="mailto:' + esc(CFG.email) + '">' + esc(CFG.email) + '</a>';
    }
    return el('section', 'mv-quote',
      '<div class="mv-quote__grid">' +
        '<div class="mv-quote__copy mv-reveal">' + kicker(qc.kicker, true) +
          '<h2>' + esc(qc.titlu) + '</h2><p>' + esc(qc.text) + '</p></div>' +
        '<div class="mv-quote__actions mv-reveal" data-mv-delay="1">' +
          '<a class="mv-btn mv-btn--primary" href="' + esc(qc.cta.url) + '">' + esc(qc.cta.text) + ' <i class="fa fa-angle-right"></i></a>' +
          extra +
        '</div>' +
      '</div>');
  }

  /* --------------------------- injectare ------------------------ */
  function insertBefore(node, ref) {
    if (node && ref && ref.parentNode) { ref.parentNode.insertBefore(node, ref); return true; }
    return false;
  }
  function insertAfter(node, ref) {
    if (node && ref && ref.parentNode) { ref.parentNode.insertBefore(node, ref.nextSibling); return true; }
    return false;
  }

  function injectSections() {
    if (!isHome() || document.body.hasAttribute('data-mv-built')) return;
    document.body.setAttribute('data-mv-built', '1');

    var header  = q('header.main-header');
    var banners = q('.bannerCarouselItemsHolder');
    var slider  = q('.default-slider');
    var blog    = q('.wordpress-articles-h');
    var footer  = q('#-g-footer-general') || q('footer');

    // hero + trust imediat sub header
    var hero = buildHero(), trust = buildTrust();
    if (insertAfter(hero, header)) insertAfter(trust, hero);

    // categorii: dupa bannere, altfel inainte de sliderul de produse
    var cats = buildCats();
    if (cats) {
      cats.setAttribute('data-mv-cats', '1');
      if (banners) insertAfter(cats, banners);
      else insertBefore(cats, slider || blog || footer);
    }

    // de ce matvero: intre produse si blog
    insertBefore(buildWhy(), blog || footer);

    // banda de oferta: chiar deasupra footerului
    insertBefore(buildQuote(), footer);

    document.body.classList.add('mv-ready');
  }

  /* ------------- imaginile din cardurile de produs -----------------
     Tema afiseaza miniatura la dimensiunea ei nativa, deci imaginea apare
     minuscula intr-o zona mare. Aici calculam scara reala din dimensiunile
     imaginii si o punem inline (bate orice regula a temei). */
  function fitOneImage(img, boxH) {
    var pad = 18, inner = boxH - pad * 2;
    var box = img.closest ? img.closest('.product-box') : null;
    var holder = img.parentNode, n = img.parentNode;
    while (n && n !== box && n !== document.body) {
      if (n.tagName === 'A' || /image|picture|thumb/i.test(n.className || '')) { holder = n; break; }
      n = n.parentNode;
    }
    if (!holder) return;

    var s = holder.style;
    s.setProperty('display', 'flex', 'important');
    s.setProperty('align-items', 'center', 'important');
    s.setProperty('justify-content', 'center', 'important');
    s.setProperty('height', boxH + 'px', 'important');
    s.setProperty('padding', pad + 'px', 'important');
    s.setProperty('box-sizing', 'border-box', 'important');
    s.setProperty('overflow', 'hidden', 'important');
    s.setProperty('background', '#F6F4F1', 'important');
    s.setProperty('border-bottom', '1px solid #E2E6EA', 'important');

    img.removeAttribute('width');
    img.removeAttribute('height');
    var is = img.style;
    is.setProperty('max-width', '100%', 'important');
    is.setProperty('max-height', inner + 'px', 'important');

    var nw = img.naturalWidth, nh = img.naturalHeight;
    if (nw && nh) {
      var availW = (holder.clientWidth || 240) - pad * 2;
      // incadrare proportionala; upscalare de maxim 2.2x, ca sa nu se pixeleze
      var scale = Math.min(availW / nw, inner / nh, 2.2);
      is.setProperty('width', Math.round(nw * scale) + 'px', 'important');
      is.setProperty('height', Math.round(nh * scale) + 'px', 'important');
    } else {
      is.setProperty('width', 'auto', 'important');
      is.setProperty('height', 'auto', 'important');
    }
  }

  function fitProductImages() {
    qa('.product-box').forEach(function (box) {
      var imgs = qa('img', box), img = null;
      for (var i = 0; i < imgs.length; i++) {
        // sarim peste badge-uri / etichete
        if (imgs[i].closest && imgs[i].closest('.product-icon-box')) continue;
        img = imgs[i]; break;
      }
      if (!img || img.getAttribute('data-mv-fit')) return;
      fitOneImage(img, CFG.produsImgH);
      if (!img.complete || !img.naturalWidth) {
        // imaginile se incarca lazy — recalculam cand ajunge sursa reala
        img.addEventListener('load', function () { fitOneImage(img, CFG.produsImgH); });
      } else {
        img.setAttribute('data-mv-fit', '1');
      }
    });
  }

  /* ------------------- bannerele din platforma ---------------------
     Imaginile ramane cum le incarci tu; adaugam doar structura in jurul lor:
     index in colt, decupare a cadrului decorativ si un subsol de navigare. */
  function enhanceBanners() {
    var holder = q('.bannerCarouselItemsHolder');
    if (!holder) return;
    qa('img', holder).forEach(function (img, i) {
      if (img.getAttribute('data-mv-ban')) return;
      img.setAttribute('data-mv-ban', '1');

      var plate = (img.closest && img.closest('a')) || img.parentNode;
      if (!plate || plate === holder) return;
      plate.className = (plate.className ? plate.className + ' ' : '') + 'mv-ban';

      // cadru in jurul imaginii, ca sa putem decupa marginea din creatie
      var frame = el('span', 'mv-ban__frame');
      img.parentNode.insertBefore(frame, img);
      frame.appendChild(img);

      plate.appendChild(el('span', 'mv-ban__no', pad(i + 1)));

      var titlu = CFG.bannerTitluri[i] || img.getAttribute('alt') ||
                  img.getAttribute('title') || plate.getAttribute('title') || '';
      plate.appendChild(el('span', 'mv-ban__cap',
        (titlu ? '<b>' + esc(titlu) + '</b>' : '') +
        '<span>' + esc(CFG.bannerCta) + '<i class="fa fa-angle-right"></i></span>'));
    });
  }

  /* ----------------- cardurile de blog si footerul -----------------
     Tema pune tot textul articolului in card, iar linkul "citeste mai mult"
     ramane lipit in mijlocul textului. Scurtam textul la o fraza si mutam
     linkul in josul cardului. */
  function tidyBlogCards() {
    qa('.-g-post-slide').forEach(function (card) {
      var holder = q('.-g-post-slide-holder', card) || card;
      var more = q('.-g-post-readMore', card);
      var content = q('.-g-post-slide-content', card);
      // mai intai scoatem linkul, ca sa nu fie sters cand rescriem textul
      if (more && more.parentNode !== holder) holder.appendChild(more);
      if (!content || content.getAttribute('data-mv-trim')) return;
      content.setAttribute('data-mv-trim', '1');
      var t = (content.textContent || '').replace(/\s+/g, ' ').trim();
      t = t.replace(/cite(s|ș)te mai mult\.*$/i, '').trim();
      if (t.length > CFG.blogMaxChars) {
        var cut = t.slice(0, CFG.blogMaxChars);
        var sp = cut.lastIndexOf(' ');
        t = (sp > 60 ? cut.slice(0, sp) : cut).replace(/[\s.,;:–—-]+$/, '') + '…';
      }
      content.textContent = t;
    });
  }

  // coloanele de footer fara niciun link (titlu fara linkuri sau coloana
  // complet goala) lasau un gol mare pe tableta si desktop
  function tidyFooter() {
    var f = q('#-g-footer-general');
    if (!f) return;
    qa('.col', f).forEach(function (col) {
      if (!q('a', col)) col.style.display = 'none';
    });
  }

  /* --------------------------- 6. MISCARE ----------------------- */
  function reveals() {
    var targets = qa('.mv-reveal').concat(
      qa('.product-box-h, .-g-post-slide, .bannerCarouselItemsHolder .pin, .title-carousel')
        .map(function (n) { n.classList.add('mv-reveal'); return n; })
    );
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (n) { n.classList.add('mv-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('mv-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (n) {
      if (n.classList.contains('mv-in')) return;
      // ce e deja in fereastra la incarcare nu trebuie sa astepte observer-ul
      // — altfel apare un gol (hero, categorii) pana se declanseaza reveal-ul
      var r = n.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) n.classList.add('mv-in');
      else io.observe(n);
    });
  }

  // Doar bara de progres. Header-ul lipit la scroll este deja gestionat de
  // platforma — un al doilea mecanism il dubla si acoperea continutul.
  function progressBar() {
    var bar = el('div'); bar.id = 'mv-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var doc = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (doc > 0 ? (y / doc) * 100 : 0) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* --------------------------- start ---------------------------- */
  function init() {
    injectSections();
    reveals();
    progressBar();
    fitProductImages();
    enhanceBanners();
    tidyBlogCards();
    tidyFooter();
    // tema incarca imaginile lazy: mai doua treceri, ieftine
    setTimeout(fitProductImages, 400);
    setTimeout(fitProductImages, 1500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // componentele Gomag se pot incarca prin ajax — re-atasam reveal-urile
  // componentele Gomag se pot incarca prin ajax — reimprospatam grila de
  // categorii (daca a fost construita din lista de rezerva) si reveal-urile
  function refreshCats() {
    var old = q('[data-mv-cats]');
    if (!old) return;
    var fresh = buildCats();
    if (!fresh) return;
    fresh.setAttribute('data-mv-cats', '1');
    old.parentNode.replaceChild(fresh, old);
  }
  document.addEventListener('Gomag.ajaxContentLoaded', function () {
    setTimeout(function () {
      refreshCats(); reveals(); fitProductImages(); enhanceBanners(); tidyBlogCards();
    }, 120);
  });
})();
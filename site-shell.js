/* HealthPlan Moms: shared header behaviour (mobile menu). */
(function () {
    var btn = document.querySelector('.site-menu-btn');
    var menu = document.getElementById('site-menu');
    if (!btn || !menu) return;

    function setOpen(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.classList.toggle('is-open', open);
    }

    btn.addEventListener('click', function () {
        setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
    });

    // The panel sits before the button in source order (desktop reading order),
    // so route Tab from the open button into the panel, and Shift+Tab back out.
    btn.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && !e.shiftKey && btn.getAttribute('aria-expanded') === 'true') {
            var first = menu.querySelector('a');
            if (first) { e.preventDefault(); first.focus(); }
        }
    });
    menu.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && e.shiftKey && btn.getAttribute('aria-expanded') === 'true' && e.target === menu.querySelector('a')) {
            e.preventDefault();
            btn.focus();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            btn.focus();
        }
    });

    document.addEventListener('click', function (e) {
        if (btn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setOpen(false);
    });

    var mq = window.matchMedia('(min-width: 1101px)');
    var onChange = function () { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
})();

/* Team flip cards (Meet Our Team / Nuestro Equipo): keep ARIA state, focus and
   the hidden face in sync with the .flipped class the card toggles on click. */
(function () {
    var cards = document.querySelectorAll('.team-card-wrapper');
    if (!cards.length) return;
    function sync(card, moveFocus) {
        var flipped = card.classList.contains('flipped');
        var front = card.querySelector('.card-front');
        var back = card.querySelector('.card-back');
        card.querySelectorAll('.flip-hint, .back-flip-hint').forEach(function (b) {
            b.setAttribute('aria-pressed', flipped ? 'true' : 'false');
        });
        if (front) front.inert = flipped;
        if (back) back.inert = !flipped;
        if (moveFocus) {
            var target = card.querySelector(flipped ? '.back-flip-hint' : '.flip-hint');
            if (target) target.focus();
        }
    }
    cards.forEach(function (card) {
        sync(card, false);
        card.addEventListener('click', function (e) {
            // the card's own onclick has already toggled .flipped (it runs first)
            var fromButton = !!e.target.closest('.flip-hint, .back-flip-hint');
            setTimeout(function () { sync(card, fromButton); }, 0);
        });
    });
})();

/* Language: remember the visitor's choice, and offer Spanish once to Spanish-language browsers.
   Never auto-redirects first-time visitors, so search engines and bilingual readers see the page they asked for. */
(function () {
    var link = document.querySelector('.site-lang__link');
    if (!link) return;
    var KEY = 'hpm-lang';
    function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
    var pageLang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    var otherLang = pageLang === 'es' ? 'en' : 'es';
    var target = link.getAttribute('href');

    document.querySelectorAll('.site-lang__link').forEach(function (a) {
        a.addEventListener('click', function () { set(otherLang); });
    });

    var saved = get();
    if (saved === pageLang) return;
    if (saved === otherLang) {
        // Only jump when this exact page has a translated twin (declared with hreflang).
        var twin = document.querySelector('link[rel="alternate"][hreflang="' + otherLang + '"]');
        if (twin) {
            var url = new URL(twin.getAttribute('href'), location.href);
            if (url.pathname !== location.pathname) { window.location.replace(url.pathname + location.hash); return; }
        }
        return;
    }

    // No saved choice yet: suggest Spanish once if the browser prefers it.
    if (pageLang !== 'en') return;
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    if (String(langs[0]).toLowerCase().indexOf('es') !== 0) return;

    var bar = document.createElement('div');
    bar.className = 'lang-suggest';
    bar.setAttribute('lang', 'es');
    var hasTwin = !!document.querySelector('link[rel="alternate"][hreflang="es"]');
    bar.innerHTML = '<span>¿Prefieres español?</span> <a href="' + target + '">' +
        (hasTwin ? 'Ver esta página en español' : 'Ver el sitio en español') + '</a>' +
        '<button type="button" class="lang-suggest__close" aria-label="Cerrar">&times;</button>';
    bar.querySelector('a').addEventListener('click', function () { set('es'); });
    bar.querySelector('button').addEventListener('click', function () {
        set('en');
        bar.remove();
    });
    var header = document.querySelector('.site-header');
    if (header) header.parentNode.insertBefore(bar, header); else document.body.insertBefore(bar, document.body.firstChild);
})();

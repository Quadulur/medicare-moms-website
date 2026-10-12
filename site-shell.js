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

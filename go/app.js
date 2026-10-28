(function () {
  'use strict';
  var C = window.HPM_LP || {};
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Variant (domain picks the page; ?v= overrides for previews) ---------- */
  var VARIANTS = {
    plans: {
      eyebrow: C.planYear + ' Open Enrollment',
      headline: 'See how many ' + C.planYear + ' health plans are available where you live',
      subhead: "Enter your ZIP. We'll show you the plan count for your county, then a licensed mom on our team helps you compare. Free, no pressure.",
      cta: 'See plans'
    },
    selfemployed: {
      eyebrow: 'Self-employed, 1099 or between jobs',
      headline: 'No job-based plan? See your ' + C.planYear + ' options in about a minute',
      subhead: 'Business owners, contractors and gig workers buy their own coverage. Enter your ZIP to see how many plans you can choose from, then let a licensed mom walk you through them.',
      cta: 'Check my ZIP',
      whyTitle: 'Built for people who work for themselves'
    },
    family: {
      eyebrow: 'Coverage for the whole family',
      headline: 'Covering your family for ' + C.planYear + '? Start with your ZIP',
      subhead: 'Kids, spouse, everyone on one plan or split the smart way. See the plan count in your county, then compare with a mom who has done this for her own family.',
      cta: 'See family plans',
      whyTitle: 'Why families call the moms'
    },
    talk: {
      eyebrow: 'Talk to a real person',
      headline: 'Questions about your health plan? Ask a mom who does this every day',
      subhead: "No call centers. You'll get one licensed agent from our team who learns your situation and compares the plans in your county with you.",
      cta: 'Start here',
      momsLine: 'Erica, Michelle and Ally are licensed agents on our team. One of them will reach out to you.',
      whyTitle: 'What working with us looks like'
    }
  };
  var LANG = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase() === 'es' ? 'es' : 'en';
  var VARIANTS_ES = {
    plans: {
      eyebrow: 'Inscripción Abierta ' + C.planYear,
      headline: 'Mira cuántos planes de salud ' + C.planYear + ' hay donde vives',
      subhead: 'Escribe tu código postal. Te mostramos cuántos planes hay en tu condado y una mamá con licencia de nuestro equipo te ayuda a compararlos. Gratis y sin compromiso.',
      cta: 'Ver planes'
    },
    selfemployed: {
      eyebrow: 'Trabajas por tu cuenta, 1099 o entre empleos',
      headline: '¿Sin seguro del trabajo? Mira tus opciones para ' + C.planYear + ' en un minuto',
      subhead: 'Dueños de negocio, contratistas y quienes trabajan por app compran su propia cobertura. Escribe tu código postal y una mamá con licencia te explica tus opciones en español.',
      cta: 'Ver opciones',
      whyTitle: 'Pensado para quienes trabajan por su cuenta'
    },
    family: {
      eyebrow: 'Seguro médico para toda la familia',
      headline: '¿Buscas seguro médico para tu familia en ' + C.planYear + '? Empieza con tu código postal',
      subhead: 'Hijos, pareja, todos en un plan o divididos de la forma que más te convenga. Mira cuántos planes hay en tu condado y compáralos en español con una mamá que también lo hizo para su familia.',
      cta: 'Ver planes',
      whyTitle: 'Por qué las familias llaman a las mamás'
    },
    talk: {
      eyebrow: 'Habla con una persona real',
      headline: '¿Preguntas sobre tu seguro médico? Pregúntale a una mamá que hace esto todos los días',
      subhead: 'Sin centros de llamadas. Una agente con licencia de nuestro equipo conoce tu situación y compara contigo los planes de tu condado, en español.',
      cta: 'Empezar',
      whyTitle: 'Cómo es trabajar con nosotras'
    }
  };
  var T = LANG === 'es' ? {
    wait: 'Un momento…', checking: 'Buscando planes…', sending: 'Enviando…',
    zip: 'Escribe un código postal de 5 dígitos.',
    pickCounty: 'Tu código postal cubre más de un condado. Elige el tuyo y vuelve a tocar el botón.',
    name: 'Escribe tu nombre y apellido.', phone: 'Escribe un número de celular válido de 10 dígitos.',
    email: 'Escribe un correo electrónico válido.', consent: 'Marca la casilla para que una agente con licencia pueda contactarte.',
    age: 'Escribe tu edad.', fail: 'Algo salió mal al enviar tu solicitud. Inténtalo de nuevo o llama al ',
    yourArea: 'tu zona',
    countMany: function (n, where) { return '<b>' + n + '</b><span>planes de salud ' + C.planYear + ' disponibles en ' + where + '</span>'; },
    issuers: function (k) { return '<small>de ' + k + ' compañías de seguros. Una mamá con licencia te ayuda a elegir.</small>'; },
    help: '<small>Una mamá con licencia te ayuda a elegir.</small>',
    noCount: function (where) { return '<span>Buenas noticias: hay planes ' + C.planYear + ' disponibles en ' + where + '.</span><small>Dinos cómo contactarte y una mamá con licencia los compara contigo.</small>'; }
  } : {
    wait: 'One moment…', checking: 'Checking plans…', sending: 'Sending…',
    zip: 'Please enter a 5-digit ZIP code.',
    pickCounty: 'Your ZIP covers more than one county. Pick yours, then tap the button again.',
    name: 'Please enter your first and last name.', phone: 'Please enter a valid 10-digit mobile number.',
    email: 'Please enter a valid email address.', consent: 'Please check the box so a licensed agent can contact you.',
    age: 'Please enter your age.', fail: 'Something went wrong sending your request. Please try again or call ',
    yourArea: 'your area',
    countMany: function (n, where) { return '<b>' + n + '</b><span>' + C.planYear + ' health plans available in ' + where + '</span>'; },
    issuers: function (k) { return '<small>from ' + k + ' insurance companies. A licensed mom will help you narrow it down.</small>'; },
    help: '<small>A licensed mom will help you narrow it down.</small>',
    noCount: function (where) { return '<span>Good news: ' + C.planYear + ' plans are available in ' + where + '.</span><small>Tell us where to reach you and a licensed mom will compare them with you.</small>'; }
  };
  if (LANG === 'es') VARIANTS = VARIANTS_ES;
  var params = new URLSearchParams(location.search);
  // Entry domain: ?d=acamoms when the visitor came through a forwarding domain, else this site.
  var d = (params.get('d') || '').toLowerCase().replace(/\.com$/, '');
  var host = (C.entryDomains || {})[d] || location.hostname.replace(/^www\./, '').toLowerCase();
  try { if (d) sessionStorage.setItem('hpm_entry', host); else host = sessionStorage.getItem('hpm_entry') || host; } catch (e) {}
  // Variant from the path: /go/<variant>/  (self-employed maps to selfemployed). ?v= still overrides for previews.
  // Spanish pages live at /go/es/<variant>/ and default to the family angle.
  var seg = (location.pathname.match(LANG === 'es' ? /\/go\/es\/([a-z-]+)/ : /\/go\/([a-z-]+)/) || [])[1] || '';
  var PATHS = { 'plans': 'plans', 'self-employed': 'selfemployed', 'family': 'family', 'talk': 'talk',
    'planes': 'plans', 'independientes': 'selfemployed', 'familia': 'family', 'hablar': 'talk' };
  var fallback = LANG === 'es' ? 'family' : (C.defaultVariant || 'plans');
  var variant = params.get('v') && VARIANTS[params.get('v')] ? params.get('v') : (PATHS[seg] || fallback);
  var V = VARIANTS[variant];
  ['eyebrow', 'headline', 'subhead', 'momsLine', 'whyTitle'].forEach(function (k) { if (V[k] && $(k)) $(k).textContent = V[k]; });
  document.querySelector('#s1 .btn').textContent = V.cta;
  document.title = V.headline + ' | HealthPlan Moms';
  if (C.phone) { $('phoneTop').textContent = C.phone; }

  /* ---------- Tracking params ---------- */
  var TRACK = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ad_id', 'adset_id', 'campaign_id'].forEach(function (k) {
    var v = params.get(k); if (v) TRACK[k] = v.slice(0, 200);
  });
  try {
    var saved = JSON.parse(sessionStorage.getItem('hpm_track') || '{}');
    for (var k in saved) if (!TRACK[k]) TRACK[k] = saved[k];
    sessionStorage.setItem('hpm_track', JSON.stringify(TRACK));
  } catch (e) {}
  var device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'phone' : 'computer';

  /* ---------- Meta pixel (only if an ID is set for this domain) ---------- */
  var pixelId = C.pixel;
  function fbq() { if (window.fbq) window.fbq.apply(null, arguments); }
  if (pixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId); window.fbq('track', 'PageView');
  }

  /* ---------- State ---------- */
  var S = { zip: '', state: '', county: '', fips: '', planCount: null, issuerCount: null, contact: null, leadId: null, sentCrm: false, finished: false, started: Date.now() };

  function show(id) {
    ['s1', 's2', 's3', 'done', 'over65'].forEach(function (s) { $(s).hidden = s !== id; });
    var idx = { s1: 0, s2: 1, s3: 2 }[id];
    var lis = document.querySelectorAll('.steps li');
    for (var i = 0; i < lis.length; i++) lis[i].classList.toggle('on', idx === undefined ? true : i <= idx);
    document.querySelector('.steps').hidden = id === 'done' || id === 'over65';
    var focusEl = id === 'done' || id === 'over65' ? $(id) : $(id).querySelector('input:not([type=checkbox]),select');
    if (focusEl) try { focusEl.focus({ preventScroll: true }); } catch (e) {}
    if (window.innerWidth < 860) $('card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function err(n, msg) { var el = $('e' + n); el.textContent = msg || ''; el.hidden = !msg; }
  function busy(form, on, label) {
    var b = form.querySelector('button[type=submit]');
    if (on) { b.dataset.l = b.textContent; b.textContent = label || T.wait; b.disabled = true; }
    else { b.textContent = b.dataset.l || b.textContent; b.disabled = false; }
  }

  /* ---------- Step 1: ZIP and plan count ---------- */
  function quoter(path, opts) {
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, 7000);
    return fetch(C.quoterUrl.replace(/\/$/, '') + path, Object.assign({ signal: ctrl.signal, headers: { 'Content-Type': 'application/json' } }, opts || {}))
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function pick(o, keys) { for (var i = 0; i < keys.length; i++) if (o && o[keys[i]] != null && o[keys[i]] !== '') return o[keys[i]]; return ''; }
  function countyList(d) { return d.counties || d.data || (Array.isArray(d) ? d : []); }
  function normCounty(c) { return { fips: String(pick(c, ['fips_code', 'fips', 'county_fips'])), name: pick(c, ['name', 'county_name', 'county']), state: String(pick(c, ['state', 'state_code', 'state_abbreviation'])).toUpperCase() }; }

  function countPlans() {
    if (!C.quoterUrl || !S.fips) return Promise.resolve();
    return quoter('/quotes', { method: 'POST', body: JSON.stringify({ zip: S.zip, fips: S.fips, state: S.state, plan_year: C.planYear, household_size: 1, applicants: [{ age: 40, relationship: 'primary' }], page_size: 100 }) })
      .then(function (d) {
        var plans = d.plans || d.data || [];
        var total = pick(d.meta || {}, ['total_count', 'total', 'count']) || pick(d, ['total_count', 'total']) || plans.length;
        var issuers = {};
        plans.forEach(function (p) { var n = pick(p, ['issuer_name', 'carrier_name']) || pick(p.issuer || {}, ['name']); if (n) issuers[n] = 1; });
        S.planCount = Number(total) || null;
        S.issuerCount = Object.keys(issuers).length || null;
      }).catch(function () {});
  }
  function renderCount() {
    var box = $('countBox');
    var where = S.county ? S.county + (S.state ? ', ' + S.state : '') : (S.state || T.yourArea);
    if (S.planCount) {
      var n = S.planCount >= 100 ? '100+' : String(S.planCount);
      box.innerHTML = T.countMany(n, esc(where)) + (S.issuerCount > 1 ? T.issuers(S.issuerCount) : T.help);
    } else {
      box.innerHTML = T.noCount(esc(where));
    }
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  $('zip').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 5); });
  $('county').addEventListener('change', function () { var c = JSON.parse(this.value); S.fips = c.fips; S.county = c.name; S.state = c.state || S.state; });

  $('s1').addEventListener('submit', function (e) {
    e.preventDefault(); err(1);
    var zip = $('zip').value.trim();
    if (!/^\d{5}$/.test(zip)) return err(1, T.zip);
    // New ZIP: forget the old county. Same ZIP with the county picker showing: keep the pick.
    if (zip !== S.zip) {
      S.zip = zip; S.fips = ''; S.county = ''; S.state = ''; S.planCount = null; S.issuerCount = null;
      $('countyWrap').hidden = true;
    }
    var form = this; busy(form, true, T.checking);
    var lookup = (C.quoterUrl && !S.fips) ? quoter('/counties?zip=' + zip).then(function (d) {
      var list = countyList(d).map(normCounty).filter(function (c) { return c.fips; });
      if (list.length > 1 && $('countyWrap').hidden) {
        $('county').innerHTML = list.map(function (c) { return '<option value=\'' + esc(JSON.stringify(c)) + '\'>' + esc(c.name) + '</option>'; }).join('');
        $('countyWrap').hidden = false;
        S.fips = list[0].fips; S.county = list[0].name; S.state = list[0].state;
        throw 'pick';
      }
      if (list[0]) { S.fips = list[0].fips; S.county = list[0].name; S.state = list[0].state; }
    }) : Promise.resolve();
    lookup.then(countPlans).then(function () {
      busy(form, false); renderCount(); show('s2');
      fbq('track', 'ViewContent', { content_name: 'zip_' + variant });
    }).catch(function (x) {
      busy(form, false);
      if (x === 'pick') return err(1, T.pickCounty);
      renderCount(); show('s2');
    });
  });

  /* ---------- Step 2: contact (lead is created here) ---------- */
  function cleanPhone(v) { var d = String(v).replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return d; }
  $('phone').addEventListener('input', function () {
    var d = cleanPhone(this.value).slice(0, 10), o = d;
    if (d.length > 6) o = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    else if (d.length > 3) o = '(' + d.slice(0, 3) + ') ' + d.slice(3);
    this.value = o;
  });

  $('s2').addEventListener('submit', function (e) {
    e.preventDefault(); err(2);
    var f = $('first_name').value.trim(), l = $('last_name').value.trim(), p = cleanPhone($('phone').value), m = $('email').value.trim();
    if (!f || !l) return err(2, T.name);
    if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(p) || /^(\d)\1{9}$/.test(p) || p.slice(3, 6) === '555') return err(2, T.phone);
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(m)) return err(2, T.email);
    if (!$('consent').checked) return err(2, T.consent);
    var bot = $('company_website').value || (Date.now() - S.started) < 4000;
    S.contact = { first_name: f, last_name: l, phone: '+1' + p, email: m, consent_at: new Date().toISOString(), bot: !!bot };
    fbq('track', 'Lead', { content_name: variant });
    show('s3');
    if (bot) return;
    if (C.intakeUrl) {
      sendIntake(true);
    } else {
      // Rocket CRM gets one record. Send it when they finish step 3, or if they stop here.
      S.timer = setTimeout(function () { sendCrm(true); }, 90000);
    }
  });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden' && S.contact && !S.finished && !S.contact.bot) sendCrm(true); });
  window.addEventListener('pagehide', function () { if (S.contact && !S.finished && !S.contact.bot) sendCrm(true); });

  /* ---------- Step 3: household ---------- */
  $('s3').addEventListener('submit', function (e) {
    e.preventDefault(); err(3);
    var age = parseInt($('age').value, 10);
    if (!(age >= 18 && age <= 110)) return err(3, T.age);
    S.details = { age: age, household_size: $('hh').value, covering: $('covering').value, income_band: $('income').value, current_coverage: $('current').value };
    S.finished = true; clearTimeout(S.timer);
    if (age >= 65 && S.details.covering === 'me') { show('over65'); }
    var form = this; busy(form, true, T.sending);
    if (S.contact.bot) { busy(form, false); return show('done'); }
    var p = C.intakeUrl ? sendIntake(false) : sendCrm(false);
    p.then(function () { busy(form, false); if (!(age >= 65 && S.details.covering === 'me')) show('done'); })
     .catch(function () { busy(form, false); err(3, T.fail + (C.phone || '') + '.'); S.finished = false; });
  });

  /* ---------- Payloads ---------- */
  function consentBlock() {
    return { consent: true, consent_text: $('consentText').textContent.trim(), consent_version: LANG === 'es' ? 'hpm-lp-es-2026-10' : 'hpm-lp-2026-10', consent_at: S.contact.consent_at, consent_page: location.href };
  }
  function basePayload(partial) {
    var c = S.contact, d = S.details || {};
    var p = {
      brand: C.brand, product: C.product, site: host || 'preview', page: location.pathname, landing_path: location.pathname, variant: variant, language: LANG,
      first_name: c.first_name, last_name: c.last_name, phone: c.phone, email: c.email,
      zip: S.zip, state: S.state, county: S.county, county_fips: S.fips,
      plans_shown: S.planCount, partial: partial, device: device, user_agent: navigator.userAgent,
      submitted_at: new Date().toISOString()
    };
    Object.assign(p, consentBlock(), TRACK, d);
    if (S.leadId) p.lead_id = S.leadId;
    return p;
  }
  function sendIntake(partial) {
    return fetch(C.intakeUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(basePayload(partial)), keepalive: true })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json().catch(function () { return {}; }); })
      .then(function (j) { if (j && j.lead_id) S.leadId = j.lead_id; });
  }
  var INCOME = { under_25k: 'Under $25k', '25_50k': '$25k to $50k', '50_75k': '$50k to $75k', '75_100k': '$75k to $100k', '100_150k': '$100k to $150k', over_150k: 'Over $150k' };
  function sendCrm(partial) {
    // First send creates the lead (kind "ad"). If a partial already went out, the
    // finished details go as kind "ad_update" so the workflow only adds a note.
    if (partial && S.sentCrm) return Promise.resolve();
    var kind = S.sentCrm ? 'ad_update' : 'ad';
    S.sentCrm = true;
    var p = basePayload(partial), d = S.details || {};
    Object.assign(p, {
      kind: kind, source: 'ad_' + (host || 'preview').replace(/\.com$/, '') + '_' + (LANG === 'es' ? 'es_' : '') + variant,
      firstName: p.first_name, lastName: p.last_name, fullName: p.first_name + ' ' + p.last_name,
      interested: 'ACA / Marketplace', consentGiven: true, consentTimestamp: p.consent_at, consentText: p.consent_text,
      language: LANG, preferredLanguage: LANG === 'es' ? 'Spanish' : 'English', page: location.href,
      summary: [LANG === 'es' ? 'SPANISH SPEAKER (Spanish ad page)' : '', partial ? 'Stopped after contact step' : 'Finished all steps',
        'Plans shown: ' + (S.planCount || 'n/a'),
        d.age ? 'Age ' + d.age : '', d.household_size ? 'Household ' + d.household_size : '', d.covering ? 'Covering: ' + d.covering : '',
        d.income_band ? 'Income: ' + (INCOME[d.income_band] || d.income_band) : '', d.current_coverage ? 'Current: ' + d.current_coverage : '',
        TRACK.utm_campaign ? 'Campaign: ' + TRACK.utm_campaign : '', TRACK.utm_content ? 'Ad: ' + TRACK.utm_content : ''].filter(Boolean).join(' | ')
    });
    return fetch(C.crmWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), keepalive: true })
      .then(function (r) { if (!r.ok) { S.sentCrm = kind === 'ad_update'; throw new Error(r.status); } });
  }
})();

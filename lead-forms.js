/**
 * HealthPlan Moms shared lead form helper.
 *
 * Every lead form on the site (homepage contact, contact modal, join
 * application, newsletter, needs analysis, chat widget) sends through
 * HPM.submitLead so payloads, spam checks and success/error states match.
 *
 * Static forms opt in with data attributes and are bound automatically:
 *   <form data-hpm-lead data-source="homepage" data-kind="client">
 * Optional: data-success-title, data-success-text (override default copy).
 *
 * Scripts that build forms at runtime can call HPM.bind(form, opts) once
 * this file has loaded. To wait for it, push a callback onto
 * window.HPM_READY (it runs immediately if HPM is already available).
 */

// Webhook config. Leave recruit or newsletter empty to send to main.
const HPM_WEBHOOKS = {
  main: 'https://services.leadconnectorhq.com/hooks/LSuIvEciA8JlCaL35rzM/webhook-trigger/642a0837-5bb0-4824-8571-afde058cb752',
  recruit: '', // TODO paste recruiting webhook
  newsletter: '' // optional: separate newsletter webhook
};

(function () {
  'use strict';

  if (window.HPM && window.HPM.submitLead) return; // already loaded

  var PHONE_TEL = 'tel:+14352461548';
  var PHONE_DISPLAY = '(435) 246-1548';
  var MIN_FILL_MS = 3000;
  var HONEYPOT_NAME = 'company_website';

  function resolveWebhook(kind) {
    if (kind === 'recruit' && HPM_WEBHOOKS.recruit) return HPM_WEBHOOKS.recruit;
    if (kind === 'newsletter' && HPM_WEBHOOKS.newsletter) return HPM_WEBHOOKS.newsletter;
    return HPM_WEBHOOKS.main;
  }

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    return l.indexOf('es') === 0 ? 'es' : 'en';
  }

  var STRINGS = {
    en: {
      sending: 'Sending…',
      error: 'Sorry, something went wrong and your information was not sent. Please try again, or call us at',
      errorTail: '.',
      success: {
        client: ['Thank you!', "We'll be in touch within 24 hours. Look for a call from our team!"],
        recruit: ['Thank you for applying!', "We'll be in touch within 24 hours."],
        newsletter: ["You're on the list.", "We'll send new guides when they publish."],
        chat: ['Message sent.', 'Thanks for reaching out. A member of our team will follow up by phone or text during business hours (Monday to Friday, 9am to 5pm MT).']
      },
      callNow: 'Need help sooner? Call'
    },
    es: {
      sending: 'Enviando…',
      error: 'Lo sentimos, algo salió mal y tu información no se envió. Inténtalo de nuevo o llámanos al',
      errorTail: '.',
      success: {
        client: ['¡Gracias!', 'Nos comunicaremos contigo dentro de 24 horas. ¡Espera una llamada de nuestro equipo!'],
        recruit: ['¡Gracias por tu solicitud!', 'Nos comunicaremos contigo dentro de 24 horas.'],
        newsletter: ['¡Ya estás en la lista!', 'Te enviaremos nuevas guías cuando se publiquen.'],
        chat: ['Mensaje enviado.', 'Gracias por escribirnos. Alguien de nuestro equipo te contactará por teléfono o mensaje de texto en horario laboral (lunes a viernes, de 9am a 5pm MT).']
      },
      callNow: '¿Necesitas ayuda antes? Llámanos al'
    }
  };

  function t() { return STRINGS[lang()]; }

  // Shared styles: status panels, honeypot, and 16px inputs on mobile (prevents iOS zoom).
  function injectStyles() {
    if (document.getElementById('hpm-lead-forms-css')) return;
    var css =
      '.hpm-hp{position:absolute!important;left:-10000px!important;top:auto!important;width:1px!important;height:1px!important;overflow:hidden!important}' +
      '.hpm-lead-error{flex-basis:100%;width:100%;box-sizing:border-box;margin-top:12px;padding:12px 14px;background:#FFF5F5;color:#9B1C1C;border-left:4px solid #C53030;border-radius:8px;font-family:"Nunito",sans-serif;font-size:14px;line-height:1.5;text-align:left}' +
      '.hpm-lead-error a{color:#9B1C1C;font-weight:700;text-decoration:underline}' +
      '.hpm-lead-success{box-sizing:border-box;width:100%;max-width:560px;margin-left:auto;margin-right:auto;padding:24px 22px;background:#fff;color:#2C2C2C;border:1.5px solid #A8C5A0;border-radius:12px;text-align:center;font-family:"Nunito",sans-serif;outline:none}' +
      '.hpm-lead-success:focus-visible{box-shadow:0 0 0 3px rgba(91,140,107,.35)}' +
      '.hpm-lead-success svg{display:block;margin:0 auto 10px}' +
      '.hpm-lead-success h3{font-family:"DM Serif Display",serif;font-size:22px;font-weight:400;color:#2C2C2C;margin:0 0 6px;line-height:1.3}' +
      '.hpm-lead-success p{font-size:15px;line-height:1.6;color:#4A5568;margin:0}' +
      '.hpm-lead-success p+p{margin-top:8px}' +
      '.hpm-lead-success a{color:#3D6B4A;font-weight:700}' +
      '@media (max-width:768px){form[data-hpm-lead] input:not([type=checkbox]):not([type=radio]),form[data-hpm-lead] select,form[data-hpm-lead] textarea{font-size:16px!important}}';
    var s = document.createElement('style');
    s.id = 'hpm-lead-forms-css';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  function ensureHoneypot(form) {
    if (form.querySelector('[name="' + HONEYPOT_NAME + '"]')) return;
    var wrap = document.createElement('div');
    wrap.className = 'hpm-hp';
    wrap.setAttribute('aria-hidden', 'true');
    var id = 'hp_' + Math.random().toString(36).slice(2, 9);
    wrap.innerHTML =
      '<label for="' + id + '">Company website</label>' +
      '<input type="text" id="' + id + '" name="' + HONEYPOT_NAME + '" tabindex="-1" autocomplete="off" value="">';
    form.insertBefore(wrap, form.firstChild);
  }

  function markRendered(form) {
    form._hpmStart = Date.now();
  }

  function consentBox(form) {
    return form.querySelector('input[type="checkbox"][name="consent"]');
  }

  function consentTextFor(box) {
    if (!box) return '';
    var explicit = box.getAttribute('data-consent-text');
    if (explicit) return explicit;
    var label = box.closest('label') || (box.id && document.querySelector('label[for="' + box.id + '"]'));
    var text = label ? label.textContent.replace(/\s+/g, ' ').trim() : '';
    var link = label && label.querySelector('a[href]');
    if (link) text += ' (' + link.href + ')';
    return text;
  }

  function collectFields(form) {
    var data = {};
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      if (key === HONEYPOT_NAME || key === 'consent') return;
      if (typeof value !== 'string') return; // ignore files
      value = value.trim();
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });
    // Name normalisation so every lead reaches the CRM with first, last and full name.
    if (!data.fullName && (data.firstName || data.lastName)) {
      data.fullName = ((data.firstName || '') + ' ' + (data.lastName || '')).trim();
    }
    if (data.fullName && !data.firstName && !data.lastName) {
      var parts = data.fullName.split(/\s+/);
      data.firstName = parts[0] || '';
      data.lastName = parts.slice(1).join(' ');
    }
    return data;
  }

  function clearError(form) {
    var old = form.querySelector('.hpm-lead-error');
    if (old) old.parentNode.removeChild(old);
  }

  function showError(form, submitBtn) {
    clearError(form);
    var s = t();
    var div = document.createElement('div');
    div.className = 'hpm-lead-error';
    div.setAttribute('role', 'alert');
    div.innerHTML = s.error + ' <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>' + s.errorTail;
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(div, submitBtn.nextSibling);
    } else {
      form.appendChild(div);
    }
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  function showSuccess(form, opts) {
    var s = t();
    var kind = opts.kind || 'client';
    var defaults = s.success[kind] || s.success.client;
    var title = opts.successTitle || form.getAttribute('data-success-title') || defaults[0];
    var text = opts.successText || form.getAttribute('data-success-text') || defaults[1];
    var panel = document.createElement('div');
    panel.className = 'hpm-lead-success';
    panel.setAttribute('role', 'status');
    panel.setAttribute('tabindex', '-1');
    var html =
      '<svg width="44" height="44" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="30" stroke="#5B8C6B" stroke-width="3"/><polyline points="20,34 28,42 44,24" stroke="#5B8C6B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h3>' + escapeHtml(title) + '</h3>' +
      '<p>' + escapeHtml(text) + '</p>';
    if (kind !== 'newsletter') {
      html += '<p>' + s.callNow + ' <a href="' + PHONE_TEL + '">' + PHONE_DISPLAY + '</a>.</p>';
    }
    panel.innerHTML = html;
    form.hidden = true;
    form.style.display = 'none';
    form.parentNode.insertBefore(panel, form.nextSibling);
    try { panel.focus({ preventScroll: false }); } catch (e) { panel.focus(); }
    return panel;
  }

  /**
   * submitLead(form, {source, kind, successTitle, successText, onSuccess, extra})
   * Returns a promise resolving to true (sent or silently dropped as spam) or false (failed).
   */
  function submitLead(form, opts) {
    opts = opts || {};
    var kind = opts.kind || form.getAttribute('data-kind') || 'client';
    var source = opts.source || form.getAttribute('data-source') || 'website';
    var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');

    if (form._hpmBusy) return Promise.resolve(false);
    clearError(form);

    // Spam checks: filled honeypot or a submit faster than a person can type.
    var hp = form.querySelector('[name="' + HONEYPOT_NAME + '"]');
    var started = form._hpmStart || 0;
    var tooFast = started && (Date.now() - started) < MIN_FILL_MS;
    if ((hp && hp.value) || tooFast) {
      var fakePanel = showSuccess(form, { kind: kind, successTitle: opts.successTitle, successText: opts.successText });
      if (typeof opts.onSuccess === 'function') opts.onSuccess(fakePanel, null);
      return Promise.resolve(true);
    }

    var now = new Date().toISOString();
    var payload = collectFields(form);
    var box = consentBox(form);
    if (box) {
      payload.consentGiven = !!box.checked;
      payload.consentTimestamp = now;
      payload.consentText = consentTextFor(box);
      payload.consentUserAgent = navigator.userAgent;
    }
    if (opts.extra) {
      for (var k in opts.extra) {
        if (Object.prototype.hasOwnProperty.call(opts.extra, k)) payload[k] = opts.extra[k];
      }
    }
    payload.kind = kind;
    payload.source = source;
    payload.page = window.location.href;
    payload.language = lang();
    payload.submittedAt = now;
    payload.timestamp = now;
    payload.userAgent = navigator.userAgent;

    var originalLabel = '';
    if (submitBtn) {
      originalLabel = submitBtn.tagName === 'INPUT' ? submitBtn.value : submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      if (submitBtn.tagName === 'INPUT') submitBtn.value = t().sending;
      else submitBtn.textContent = t().sending;
    }
    form._hpmBusy = true;

    function restoreBtn() {
      form._hpmBusy = false;
      if (!submitBtn) return;
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      if (submitBtn.tagName === 'INPUT') submitBtn.value = originalLabel;
      else submitBtn.innerHTML = originalLabel;
    }

    return fetch(resolveWebhook(kind), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      restoreBtn();
      var panel = showSuccess(form, { kind: kind, successTitle: opts.successTitle, successText: opts.successText });
      if (typeof opts.onSuccess === 'function') opts.onSuccess(panel, payload);
      return true;
    }).catch(function () {
      restoreBtn();
      showError(form, submitBtn);
      if (typeof opts.onError === 'function') opts.onError();
      return false;
    });
  }

  /** bind(form, opts): add honeypot, start the timer, and handle submit. */
  function bind(form, opts) {
    if (!form || form._hpmBound) return;
    form._hpmBound = true;
    form.setAttribute('data-hpm-lead', '');
    opts = opts || {};
    ensureHoneypot(form);
    markRendered(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var o = typeof opts === 'function' ? opts() : opts;
      submitLead(form, o);
    });
  }

  function autoBind() {
    var forms = document.querySelectorAll('form[data-hpm-lead]');
    for (var i = 0; i < forms.length; i++) {
      bind(forms[i], {
        source: forms[i].getAttribute('data-source') || undefined,
        kind: forms[i].getAttribute('data-kind') || undefined
      });
    }
  }

  injectStyles();

  window.HPM = {
    webhooks: HPM_WEBHOOKS,
    resolveWebhook: resolveWebhook,
    submitLead: submitLead,
    bind: bind,
    markRendered: markRendered,
    lang: lang
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBind);
  } else {
    autoBind();
  }

  // Run callbacks queued by scripts that loaded before this one.
  var queue = window.HPM_READY || [];
  window.HPM_READY = { push: function (fn) { try { fn(window.HPM); } catch (e) { setTimeout(function () { throw e; }); } } };
  for (var q = 0; q < queue.length; q++) window.HPM_READY.push(queue[q]);
})();

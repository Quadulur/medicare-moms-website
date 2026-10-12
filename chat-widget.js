/**
 * HealthPlan Moms chat widget (floating bubble, bottom right).
 *
 * Shared by every page: load with <script src="/chat-widget.js" defer></script>.
 * Language follows <html lang>. Messages are sent to the team through the
 * shared lead helper (/lead-forms.js, loaded on demand) as kind "chat".
 * There is no live agent behind this widget, so the copy says honestly that
 * the team follows up by phone or text, and offers call and text links up top.
 */
(function () {
  'use strict';
  if (document.getElementById('chatButton')) return; // never render twice

  var isES = (document.documentElement.getAttribute('lang') || '').toLowerCase().indexOf('es') === 0;

  var L = isES
    ? {
        open: 'Abrir chat',
        close: 'Cerrar chat',
        title: 'Chatea con Nosotros',
        call: 'Llamar al (435) 246-1548',
        text: 'Envíanos un texto',
        greeting: '¡Hola! 👋 Somos el equipo de HealthPlan Moms. Déjanos tu mensaje y tu número, y una agente licenciada te contactará por teléfono o mensaje de texto.',
        quick: ['Preguntas sobre Medicare', 'Preguntas sobre ACA', 'Cotización Gratis'],
        otherLang: { label: 'English?', href: '/' },
        messageLabel: 'Tu mensaje',
        messagePh: 'Escribe tu mensaje...',
        nameLabel: 'Nombre',
        namePh: 'Tu nombre',
        phoneLabel: 'Teléfono',
        phonePh: 'Tu teléfono',
        consent: 'Acepto ser contactado por HealthPlan Moms y sus agentes licenciados por teléfono, mensaje de texto y correo electrónico sobre opciones de seguro, incluyendo mediante mensajes automatizados. El consentimiento no es una condición de compra.',
        consentLink: 'Ver términos',
        consentHref: '/es/consentimiento/',
        consentText: 'Acepto ser contactado por HealthPlan Moms y sus agentes licenciados por teléfono, mensaje de texto y correo electrónico sobre opciones de seguro, incluyendo mediante mensajes automatizados. El consentimiento no es una condición de compra. Términos completos y aviso TPMO en https://healthplanmoms.com/es/consentimiento/',
        send: 'Enviar mensaje',
        sendShort: 'Enviar'
      }
    : {
        open: 'Open chat',
        close: 'Close chat',
        title: 'Chat with Us',
        call: 'Call (435) 246-1548',
        text: 'Text us',
        greeting: "Hi there! 👋 We're the HealthPlan Moms team. Leave a message and your number, and a licensed agent will get back to you by phone or text.",
        quick: ['Medicare Questions', 'ACA Questions', 'Get a Free Quote'],
        otherLang: { label: '¿Habla Español?', href: '/es/' },
        messageLabel: 'Your message',
        messagePh: 'Type your message...',
        nameLabel: 'Name',
        namePh: 'Your name',
        phoneLabel: 'Phone',
        phonePh: 'Your phone',
        consent: 'I agree to be contacted by HealthPlan Moms and its licensed agents by phone, text, and email about insurance options, including via automated messages. Consent is not required to purchase.',
        consentLink: 'View terms',
        consentHref: '/consent-disclosure/',
        consentText: 'I agree to be contacted by HealthPlan Moms and its licensed agents by phone, text, and email about insurance options, including via automated messages. Consent is not required to purchase. Full terms & TPMO disclosure at https://healthplanmoms.com/consent-disclosure/',
        send: 'Send message',
        sendShort: 'Send'
      };

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var GREEN = 'linear-gradient(135deg, #5B8C6B 0%, #3D6B4A 100%)';
  var css =
    '#chatButton{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:' + GREEN + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(91,140,107,.3);z-index:9999;transition:all .3s ease;animation:chatButtonPulse 1.2s ease-in-out 3}' +
    '#chatButton:hover{transform:translateY(-3px);box-shadow:0 6px 16px rgba(91,140,107,.4)}' +
    '#chatButton:focus-visible{outline:3px solid #A8C5A0;outline-offset:3px}' +
    '#chatButton svg{width:28px;height:28px;fill:#fff}' +
    '@keyframes chatButtonPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}' +
    '#chatPanel{position:fixed;bottom:90px;right:20px;width:350px;height:600px;max-height:calc(100vh - 110px);background:#fff;border-radius:12px;box-shadow:0 5px 40px rgba(0,0,0,.16);display:none;flex-direction:column;z-index:9998;animation:slideUp .3s ease;font-family:"Nunito",sans-serif;overflow:hidden}' +
    '#chatPanel.active{display:flex}' +
    '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
    '#chatPanel .chat-header{background:' + GREEN + ';color:#fff;padding:18px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}' +
    '#chatPanel .chat-header h3{font-family:"DM Serif Display",serif;font-size:18px;font-weight:600;color:#fff;margin:0}' +
    '#chatPanel .chat-close-btn{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;transition:transform .2s ease}' +
    '#chatPanel .chat-close-btn:hover{transform:rotate(90deg)}' +
    '#chatPanel .chat-close-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
    '.hpm-chat-contact{display:flex;gap:8px;padding:10px 12px;background:#E8F0E6;border-bottom:1px solid #D5E3D1;flex-shrink:0}' +
    '.hpm-chat-contact a{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:8px;font-family:"Nunito",sans-serif;font-size:14px;font-weight:700;text-decoration:none;text-align:center;line-height:1.2;min-height:44px;box-sizing:border-box}' +
    '.hpm-chat-contact .hpm-call{background:' + GREEN + ';color:#fff}' +
    '.hpm-chat-contact .hpm-text{background:#fff;color:#3D6B4A;border:1.5px solid #A8C5A0}' +
    '.hpm-chat-contact a:focus-visible{outline:3px solid #3D6B4A;outline-offset:2px}' +
    '.hpm-chat-contact svg{width:16px;height:16px;flex-shrink:0}' +
    '#chatMessages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background-color:#FAFAFA;min-height:80px}' +
    '#chatPanel .message{display:flex;margin-bottom:8px;animation:fadeIn .3s ease}' +
    '@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}' +
    '#chatPanel .message.received{justify-content:flex-start}' +
    '#chatPanel .message.sent{justify-content:flex-end}' +
    '#chatPanel .message-bubble{max-width:80%;padding:12px 16px;border-radius:16px;word-wrap:break-word;font-size:14px;line-height:1.4}' +
    '#chatPanel .message.received .message-bubble{background-color:#A8C5A0;color:#fff;border-radius:16px 16px 16px 4px}' +
    '#chatPanel .message.sent .message-bubble{background:' + GREEN + ';color:#fff;border-radius:16px 16px 4px 16px}' +
    '#chatPanel .quick-replies{display:flex;flex-wrap:wrap;gap:8px;padding:12px 0}' +
    '#chatPanel .quick-reply-btn{display:inline-block;padding:8px 14px;background-color:#E8F0E6;border:1.5px solid #A8C5A0;border-radius:20px;cursor:pointer;font-size:12px;color:#3D6B4A;font-weight:500;transition:all .2s ease;font-family:"Nunito",sans-serif;white-space:nowrap;text-decoration:none;line-height:1.4}' +
    '#chatPanel .quick-reply-btn:hover{background-color:#A8C5A0;color:#fff;border-color:#5B8C6B}' +
    '#chatInput{padding:10px 12px 12px;border-top:1px solid #E0E0E0;background-color:#fff;flex-shrink:0;max-height:62%;overflow-y:auto}' +
    '#chatInput form{display:flex;flex-direction:column;gap:8px;margin:0}' +
    '#chatInput .hpm-chat-row{display:flex;gap:8px}' +
    '#chatInput .hpm-chat-row > *{flex:1;min-width:0}' +
    '#chatInput textarea,#chatInput input[type=text],#chatInput input[type=tel]{width:100%;box-sizing:border-box;border:1px solid #D0D0D0;border-radius:10px;padding:9px 12px;font-size:14px;font-family:"Nunito",sans-serif;color:#2C2C2C;background:#fff;transition:border-color .2s ease}' +
    '#chatInput textarea{resize:none;min-height:44px;height:52px}' +
    '#chatInput textarea:focus,#chatInput input:focus{outline:none;border-color:#5B8C6B;box-shadow:0 0 0 2px rgba(91,140,107,.15)}' +
    '#chatInput .hpm-chat-consent{display:flex;align-items:flex-start;gap:8px;font-size:11px;line-height:1.4;color:#4A5568;cursor:pointer}' +
    '#chatInput .hpm-chat-consent input{margin:2px 0 0;width:16px;height:16px;flex-shrink:0;accent-color:#5B8C6B}' +
    '#chatInput .hpm-chat-consent a{color:#3D6B4A;text-decoration:underline}' +
    '#sendBtn{align-self:flex-end;background:' + GREEN + ';color:#fff;border:none;border-radius:20px;min-height:40px;padding:0 18px;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .2s ease;font-size:14px;font-weight:700;font-family:"Nunito",sans-serif}' +
    '#sendBtn:hover{box-shadow:0 2px 8px rgba(91,140,107,.3)}' +
    '#sendBtn:active{transform:scale(.97)}' +
    '#sendBtn:disabled{opacity:.7;cursor:wait}' +
    '#chatInput .hpm-lead-success{padding:14px 12px}' +
    '#chatInput .hpm-lead-success h3{font-size:18px}' +
    '#chatInput .hpm-lead-success p{font-size:13px}' +
    '.hpm-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}' +
    '.hpm-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}' +
    '@media (max-width:480px){.hpm-chat-open #chatButton{display:none}' +
    '#chatPanel{bottom:0;right:0;left:0;width:100%;height:calc(100vh - 60px);max-height:none;border-radius:0;animation:slideUpMobile .3s ease}' +
    '#chatPanel .chat-header{border-radius:0}' +
    '@keyframes slideUpMobile{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '#chatPanel .message-bubble{max-width:85%}' +
    '#chatInput textarea,#chatInput input[type=text],#chatInput input[type=tel]{font-size:16px}}';

  var style = document.createElement('style');
  style.id = 'hpm-chat-widget-css';
  style.textContent = css;
  document.head.appendChild(style);

  var phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  var textIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var quickHtml = '';
  for (var i = 0; i < L.quick.length; i++) {
    quickHtml += '<button type="button" class="quick-reply-btn">' + esc(L.quick[i]) + '</button>';
  }
  quickHtml += '<a class="quick-reply-btn" href="' + L.otherLang.href + '" lang="' + (isES ? 'en' : 'es') + '">' + esc(L.otherLang.label) + '</a>';

  var container = document.createElement('div');
  container.id = 'chatWidgetContainer';
  container.innerHTML =
    '<button type="button" id="chatButton" aria-label="' + esc(L.open) + '" aria-expanded="false" aria-controls="chatPanel">' +
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
    '</button>' +
    '<div id="chatPanel" role="dialog" aria-labelledby="chatPanelTitle">' +
    '<div class="chat-header">' +
    '<h3 id="chatPanelTitle">' + esc(L.title) + '</h3>' +
    '<button type="button" class="chat-close-btn" aria-label="' + esc(L.close) + '">&times;</button>' +
    '</div>' +
    '<div class="hpm-chat-contact">' +
    '<a class="hpm-call" href="tel:+14352461548">' + phoneIcon + '<span>' + esc(L.call) + '</span></a>' +
    '<a class="hpm-text" href="sms:+14352461548">' + textIcon + '<span>' + esc(L.text) + '</span></a>' +
    '</div>' +
    '<div id="chatMessages" aria-live="polite">' +
    '<div class="message received"><div class="message-bubble">' + esc(L.greeting) + '</div></div>' +
    '<div class="quick-replies">' + quickHtml + '</div>' +
    '</div>' +
    '<div id="chatInput">' +
    '<form id="hpmChatForm" data-kind="chat">' +
    '<div class="hpm-hp" aria-hidden="true"><label for="hpmChatHp">Company website</label><input type="text" id="hpmChatHp" name="company_website" tabindex="-1" autocomplete="off" value=""></div>' +
    '<label class="hpm-sr" for="messageInput">' + esc(L.messageLabel) + '</label>' +
    '<textarea id="messageInput" name="message" rows="2" placeholder="' + esc(L.messagePh) + '" required></textarea>' +
    '<div class="hpm-chat-row">' +
    '<div><label class="hpm-sr" for="hpmChatName">' + esc(L.nameLabel) + '</label><input type="text" id="hpmChatName" name="fullName" autocomplete="name" placeholder="' + esc(L.namePh) + '" required></div>' +
    '<div><label class="hpm-sr" for="hpmChatPhone">' + esc(L.phoneLabel) + '</label><input type="tel" id="hpmChatPhone" name="phone" autocomplete="tel" placeholder="' + esc(L.phonePh) + '" required></div>' +
    '</div>' +
    '<label class="hpm-chat-consent" for="hpmChatConsent"><input type="checkbox" id="hpmChatConsent" name="consent" required data-consent-text="' + esc(L.consentText) + '"><span>' + esc(L.consent) + ' <a href="' + L.consentHref + '" target="_blank" rel="noopener">' + esc(L.consentLink) + '</a>.</span></label>' +
    '<button type="submit" id="sendBtn" aria-label="' + esc(L.send) + '">' + esc(L.sendShort) + ' <span aria-hidden="true">➤</span></button>' +
    '</form>' +
    '</div>' +
    '</div>';
  document.body.appendChild(container);

  var chatButton = document.getElementById('chatButton');
  var chatPanel = document.getElementById('chatPanel');
  var closeBtn = chatPanel.querySelector('.chat-close-btn');
  var form = document.getElementById('hpmChatForm');
  var messageInput = document.getElementById('messageInput');
  var chatMessages = document.getElementById('chatMessages');

  // Make sure the shared lead helper is available.
  if (!window.HPM && !document.querySelector('script[src*="lead-forms.js"]')) {
    var lf = document.createElement('script');
    lf.src = '/lead-forms.js';
    lf.defer = true;
    document.head.appendChild(lf);
  }
  window.HPM_READY = window.HPM_READY || [];

  form.addEventListener('submit', function (e) {
    if (!form._hpmBound) e.preventDefault();
  });

  window.HPM_READY.push(function (HPM) {
    HPM.bind(form, {
      kind: 'chat',
      source: 'chat_' + (window.location.pathname.replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '_') || 'home'),
      onSuccess: function (panel, payload) {
        var msg = payload && payload.message;
        if (msg) {
          var q = chatMessages.querySelector('.quick-replies');
          if (q) q.parentNode.removeChild(q);
          var div = document.createElement('div');
          div.className = 'message sent';
          var bubble = document.createElement('div');
          bubble.className = 'message-bubble';
          bubble.textContent = msg;
          div.appendChild(bubble);
          chatMessages.appendChild(div);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
    });
  });

  function openChat() {
    chatPanel.classList.add('active');
    container.classList.add('hpm-chat-open');
    chatButton.setAttribute('aria-expanded', 'true');
    if (window.HPM && window.HPM.markRendered && !form.hidden && !form._hpmOpened) {
      window.HPM.markRendered(form);
      form._hpmOpened = true;
    }
    if (!form.hidden) messageInput.focus();
    else {
      var p = chatPanel.querySelector('.hpm-lead-success');
      if (p) p.focus();
    }
  }

  function closeChat(returnFocus) {
    if (!chatPanel.classList.contains('active')) return;
    chatPanel.classList.remove('active');
    container.classList.remove('hpm-chat-open');
    chatButton.setAttribute('aria-expanded', 'false');
    if (returnFocus !== false) chatButton.focus();
  }

  chatButton.addEventListener('click', function () {
    if (chatPanel.classList.contains('active')) closeChat();
    else openChat();
  });
  closeBtn.addEventListener('click', function () { closeChat(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chatPanel.classList.contains('active')) closeChat();
  });

  // Quick replies fill the message box (the language link navigates normally).
  var quickButtons = chatPanel.querySelectorAll('button.quick-reply-btn');
  for (var j = 0; j < quickButtons.length; j++) {
    quickButtons[j].addEventListener('click', function () {
      messageInput.value = this.textContent;
      messageInput.focus();
    });
  }

  // Enter sends from the message box, Shift+Enter adds a new line.
  messageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else if (form.reportValidity()) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
})();

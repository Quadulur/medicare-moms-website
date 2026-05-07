/**
 * Contact Modal for Medicare Moms
 * Intercepts /#contact links on non-homepage pages and shows an inline modal
 * instead of redirecting users back to the homepage.
 * Detects Spanish pages automatically via URL path.
 */
(function () {
  // Don't run on the homepage (it has its own contact section)
  var isHomepage =
    window.location.pathname === '/' ||
    window.location.pathname === '/index.html' ||
    window.location.pathname === '/es/' ||
    window.location.pathname === '/es/index.html';
  if (isHomepage) return;

  var isSpanish = window.location.pathname.indexOf('/es/') === 0;

  var labels = isSpanish
    ? {
        heading: 'Contactanos',
        subtext:
          'Hablemos de tus opciones. Sin presion, sin jerga, solo respuestas reales.',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electronico',
        phone: 'Telefono',
        lookingFor: 'Que estas buscando?',
        selectOption: 'Selecciona una opcion',
        optMedicareAdv: 'Medicare Advantage',
        optMedicareSup: 'Suplemento de Medicare (Medigap)',
        optACA: 'ACA / Planes del Mercado',
        optDental: 'Dental y Vision',
        optLife: 'Seguro de Vida',
        optNotSure: 'No estoy seguro, ayudenme a decidir',
        consent:
          'Acepto ser contactado por Medicare Moms y sus agentes licenciados por telefono, texto y correo electronico sobre opciones de seguros, incluyendo mensajes automatizados. El consentimiento no es obligatorio para comprar.',
        consentLink: 'Ver terminos completos y divulgacion TPMO',
        submit: 'Solicitar Consulta Gratis',
        free: 'Nuestros servicios siempre son gratis para ti.',
        successHeading: 'Gracias!',
        successMsg:
          'Nos pondremos en contacto contigo pronto. Mientras tanto, puedes llamarnos al (435) 246-1548.',
        close: 'Cerrar',
      }
    : {
        heading: 'Get in Touch',
        subtext:
          "Let's talk through your options. No pressure, no jargon, just real answers.",
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        lookingFor: 'What are you looking for?',
        selectOption: 'Select an option',
        optMedicareAdv: 'Medicare Advantage',
        optMedicareSup: 'Medicare Supplement (Medigap)',
        optACA: 'ACA / Marketplace Plans',
        optDental: 'Dental & Vision',
        optLife: 'Life Insurance',
        optNotSure: 'Not Sure, Help Me Decide',
        consent:
          'I agree to be contacted by Medicare Moms and its licensed agents by phone, text, and email about insurance options, including via automated messages. Consent is not required to purchase.',
        consentLink: 'View full terms & TPMO disclosure',
        submit: 'Get a Free Consultation',
        free: 'Our services are always free to you.',
        successHeading: 'Thank You!',
        successMsg:
          "We'll be in touch soon. In the meantime, feel free to call us at (435) 246-1548.",
        close: 'Close',
      };

  // Inject CSS
  var style = document.createElement('style');
  style.textContent =
    '#contactModalOverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;align-items:center;justify-content:center;padding:20px;animation:cmFadeIn .25s ease}' +
    '#contactModalOverlay.active{display:flex}' +
    '@keyframes cmFadeIn{from{opacity:0}to{opacity:1}}' +
    '@keyframes cmSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}' +
    '#contactModal{background:#fff;border-radius:16px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;padding:0;position:relative;animation:cmSlideUp .3s ease}' +
    '.cm-header{background:linear-gradient(135deg,#3D6B4A 0%,#2C5038 100%);color:#fff;padding:28px 30px 22px;border-radius:16px 16px 0 0;position:relative}' +
    '.cm-header h2{font-family:"DM Serif Display",serif;font-size:26px;color:#fff;margin:0 0 6px;line-height:1.3}' +
    '.cm-header p{color:rgba(255,255,255,.85);font-size:15px;margin:0;line-height:1.5}' +
    '.cm-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;transition:background .2s}' +
    '.cm-close:hover{background:rgba(255,255,255,.3)}' +
    '.cm-body{padding:24px 30px 28px}' +
    '.cm-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.cm-form-group{margin-bottom:16px}' +
    '.cm-form-group label{display:block;font-family:"Nunito",sans-serif;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:5px}' +
    '.cm-form-group input,.cm-form-group select{width:100%;padding:11px 14px;border:1.5px solid #D0D0D0;border-radius:8px;font-family:"Nunito",sans-serif;font-size:14px;color:#2C2C2C;transition:border-color .2s;background:#fff;box-sizing:border-box}' +
    '.cm-form-group input:focus,.cm-form-group select:focus{outline:none;border-color:#5B8C6B;box-shadow:0 0 0 3px rgba(91,140,107,.1)}' +
    '.cm-consent{display:flex;align-items:flex-start;gap:10px;margin:18px 0 20px}' +
    '.cm-consent input[type=checkbox]{margin-top:3px;flex-shrink:0;width:16px;height:16px;accent-color:#5B8C6B;cursor:pointer}' +
    '.cm-consent span{font-size:12px;line-height:1.5;color:#4A5568}' +
    '.cm-consent a{color:#5B8C6B;text-decoration:underline}' +
    '.cm-submit{display:block;width:100%;padding:14px;background:linear-gradient(135deg,#5B8C6B 0%,#3D6B4A 100%);color:#fff;border:none;border-radius:8px;font-family:"Nunito",sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .3s ease}' +
    '.cm-submit:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(91,140,107,.3)}' +
    '.cm-free{text-align:center;font-size:13px;color:#4A5568;margin-top:14px}' +
    '.cm-success{text-align:center;padding:50px 30px}' +
    '.cm-success svg{margin-bottom:16px}' +
    '.cm-success h2{font-family:"DM Serif Display",serif;font-size:26px;color:#2C2C2C;margin-bottom:10px}' +
    '.cm-success p{font-size:15px;color:#4A5568;margin-bottom:24px;line-height:1.6}' +
    '.cm-success-btn{display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#5B8C6B 0%,#3D6B4A 100%);color:#fff;border:none;border-radius:8px;font-family:"Nunito",sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .3s}' +
    '.cm-success-btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(91,140,107,.3)}' +
    '@media(max-width:540px){#contactModal{max-width:100%;border-radius:12px}.cm-header{padding:22px 20px 18px}.cm-body{padding:20px}.cm-form-row{grid-template-columns:1fr}}';
  document.head.appendChild(style);

  // Inject HTML
  var overlay = document.createElement('div');
  overlay.id = 'contactModalOverlay';
  overlay.innerHTML =
    '<div id="contactModal">' +
    '<div class="cm-header">' +
    '<button class="cm-close" aria-label="Close">&times;</button>' +
    '<h2>' + labels.heading + '</h2>' +
    '<p>' + labels.subtext + '</p>' +
    '</div>' +
    '<div class="cm-body">' +
    '<form id="contactModalForm">' +
    '<div class="cm-form-row">' +
    '<div class="cm-form-group"><label for="cmFirstName">' + labels.firstName + '</label><input type="text" id="cmFirstName" name="firstName" required></div>' +
    '<div class="cm-form-group"><label for="cmLastName">' + labels.lastName + '</label><input type="text" id="cmLastName" name="lastName" required></div>' +
    '</div>' +
    '<div class="cm-form-group"><label for="cmEmail">' + labels.email + '</label><input type="email" id="cmEmail" name="email" required></div>' +
    '<div class="cm-form-group"><label for="cmPhone">' + labels.phone + '</label><input type="tel" id="cmPhone" name="phone" required></div>' +
    '<div class="cm-form-group"><label for="cmInterested">' + labels.lookingFor + '</label>' +
    '<select id="cmInterested" name="interested" required>' +
    '<option value="">' + labels.selectOption + '</option>' +
    '<option value="Medicare Advantage">' + labels.optMedicareAdv + '</option>' +
    '<option value="Medicare Supplement">' + labels.optMedicareSup + '</option>' +
    '<option value="ACA/Marketplace">' + labels.optACA + '</option>' +
    '<option value="Dental & Vision">' + labels.optDental + '</option>' +
    '<option value="Life Insurance">' + labels.optLife + '</option>' +
    '<option value="Not Sure">' + labels.optNotSure + '</option>' +
    '</select></div>' +
    '<label class="cm-consent"><input type="checkbox" name="consent" required><span>' + labels.consent + ' <a href="/consent-disclosure/" target="_blank" rel="noopener">' + labels.consentLink + '</a>.</span></label>' +
    '<button type="submit" class="cm-submit">' + labels.submit + '</button>' +
    '<p class="cm-free">' + labels.free + '</p>' +
    '</form>' +
    '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // Functions
  function openModal(preselect) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Pre-select dropdown if we know the service
    if (preselect) {
      var sel = document.getElementById('cmInterested');
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === preselect) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Close button
  overlay.querySelector('.cm-close').addEventListener('click', closeModal);

  // Click overlay background to close
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Escape key to close
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // Form submission
  document.getElementById('contactModalForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var modal = document.getElementById('contactModal');
    modal.innerHTML =
      '<div class="cm-success">' +
      '<svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" stroke="#5B8C6B" stroke-width="3"/><polyline points="20,34 28,42 44,24" stroke="#5B8C6B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h2>' + labels.successHeading + '</h2>' +
      '<p>' + labels.successMsg + '</p>' +
      '<button class="cm-success-btn" onclick="document.getElementById(\'contactModalOverlay\').classList.remove(\'active\');document.body.style.overflow=\'\'">' + labels.close + '</button>' +
      '</div>';
  });

  // Intercept all /#contact links
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href="/#contact"], a[href="/es/#contact"]');
    if (!link) return;
    e.preventDefault();

    // Try to detect which service based on nearby context
    var section = link.closest('.service-detail, .service-text');
    var preselect = null;
    if (section) {
      var heading = section.querySelector('h2');
      if (heading) {
        var text = heading.textContent.toLowerCase();
        if (text.indexOf('advantage') !== -1) preselect = 'Medicare Advantage';
        else if (text.indexOf('supplement') !== -1 || text.indexOf('medigap') !== -1 || text.indexOf('suplemento') !== -1)
          preselect = 'Medicare Supplement';
        else if (text.indexOf('aca') !== -1 || text.indexOf('marketplace') !== -1 || text.indexOf('mercado') !== -1)
          preselect = 'ACA/Marketplace';
        else if (text.indexOf('dental') !== -1 || text.indexOf('vision') !== -1)
          preselect = 'Dental & Vision';
        else if (text.indexOf('life') !== -1 || text.indexOf('vida') !== -1)
          preselect = 'Life Insurance';
        else if (text.indexOf('accident') !== -1 || text.indexOf('accidente') !== -1 || text.indexOf('critical') !== -1)
          preselect = 'Not Sure';
      }
    }
    openModal(preselect);
  });
})();

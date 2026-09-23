/*
 * Consentimiento de cookies + Meta Pixel
 * ─────────────────────────────────────────────────────────────
 * Cumple la LSSI-CE (art. 22.2), el RGPD y la Guía de cookies de la AEPD (2023):
 *   · Nada de terceros se carga hasta que la persona acepta.
 *   · "Aceptar" y "Rechazar" están en la primera capa, con el mismo peso visual.
 *   · Se puede configurar por categorías y retirar el consentimiento en cualquier
 *     momento (enlace "Configurar cookies" → window.lgCookies.open()).
 *   · La decisión caduca a los 12 meses y se vuelve a preguntar.
 *
 * Se carga en el <head> de cada página pública, SIN defer, para que `fbq`
 * exista antes de que el resto de scripts de la página registren eventos.
 */
(function () {
  'use strict';

  var PIXEL_ID = '1839483573707245';
  var STORAGE_KEY = 'lg-cookie-consent';
  var CONSENT_VERSION = 1;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

  // ─── Meta Pixel Code (stub) ───
  // Mismo código que da Meta, pero sin inyectar fbevents.js: las llamadas a
  // fbq() quedan en cola en memoria y solo se envían si hay consentimiento.
  // Se omite el <noscript> de Meta porque dispararía el píxel sin consentimiento.
  !function (f) {
    if (f.fbq) return;
    var n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
  }(window);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  var pixelLoaded = false;
  function loadPixel() {
    if (pixelLoaded) { fbq('consent', 'grant'); return; }
    pixelLoaded = true;
    var t = document.createElement('script');
    t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(t, s);
  }

  function stopPixel() {
    if (pixelLoaded) fbq('consent', 'revoke');
    // Borra las cookies propias que haya dejado Meta en este dominio.
    ['_fbp', '_fbc'].forEach(function (name) {
      var host = location.hostname;
      var domains = ['', host, '.' + host.replace(/^www\./, '')];
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  // ─── Almacenamiento de la decisión ───
  function readConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!c || c.v !== CONSENT_VERSION) return null;
      if (Date.now() - c.ts > MAX_AGE_MS) return null;
      return c;
    } catch (e) { return null; }
  }

  function saveConsent(ads) {
    var c = { v: CONSENT_VERSION, ads: !!ads, ts: Date.now() };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }

  function apply(c) {
    if (c && c.ads) loadPixel(); else stopPixel();
  }

  // ─── Eventos de conversión comunes ───
  // Clic en cualquier botón de compra del curso → InitiateCheckout.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="/api/comprar-curso"]');
    if (a) fbq('track', 'InitiateCheckout', { currency: 'EUR', content_name: 'Curso de Productividad Personal' });
  });

  // ─── Interfaz ───
  var CSS = '' +
    '.lgc{position:fixed;z-index:9999;left:1.5rem;bottom:1.5rem;width:min(26rem,calc(100vw - 3rem));' +
      'background:#FDFCFA;color:#545454;border-radius:1rem;padding:1.5rem 1.5rem 1.25rem;' +
      'font-family:"Jost",system-ui,sans-serif;font-size:0.875rem;line-height:1.6;letter-spacing:-0.005em;' +
      'box-shadow:0 1px 2px rgba(58,51,44,0.06),0 8px 24px rgba(58,51,44,0.10),0 24px 64px rgba(105,119,92,0.14);' +
      'border:1px solid rgba(105,119,92,0.14);' +
      'opacity:0;transform:translateY(12px);transition:opacity .35s ease,transform .45s cubic-bezier(0.34,1.56,0.64,1);}' +
    '.lgc.lgc-in{opacity:1;transform:none;}' +
    '.lgc h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:1.5rem;line-height:1.1;' +
      'letter-spacing:-0.02em;color:#69775c;margin:0 0 0.5rem;}' +
    '.lgc p{margin:0 0 1rem;}' +
    '.lgc a{color:#B08060;text-underline-offset:2px;}' +
    '.lgc a:hover{color:#69775c;}' +
    '.lgc-row{display:flex;gap:0.5rem;}' +
    '.lgc-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;min-height:2.75rem;padding:0.6rem 1rem;' +
      'border-radius:100px;font:500 0.875rem/1 "Jost",sans-serif;letter-spacing:0.02em;cursor:pointer;' +
      'border:1.5px solid #69775c;background:#69775c;color:#FDFCFA;' +
      'transition:transform .18s cubic-bezier(0.34,1.56,0.64,1),background-color .18s ease,border-color .18s ease;}' +
    '.lgc-btn:hover{background:#B08060;border-color:#B08060;transform:translateY(-1px);}' +
    '.lgc-btn:active{transform:translateY(0);}' +
    '.lgc-btn:focus-visible,.lgc-link:focus-visible,.lgc-switch input:focus-visible+span{outline:2px solid #CDA085;outline-offset:3px;}' +
    '.lgc-link{display:block;margin:0.75rem auto 0;background:none;border:0;padding:0.25rem;cursor:pointer;' +
      'font:500 0.8125rem "Jost",sans-serif;color:#69775c;text-decoration:underline;text-underline-offset:3px;}' +
    '.lgc-link:hover{color:#B08060;}' +
    '.lgc-link:active{opacity:0.7;}' +
    '.lgc-cat{display:flex;gap:1rem;align-items:flex-start;justify-content:space-between;padding:0.875rem 0;' +
      'border-top:1px solid rgba(189,192,181,0.5);}' +
    '.lgc-cat:last-of-type{margin-bottom:1rem;border-bottom:1px solid rgba(189,192,181,0.5);}' +
    '.lgc-cat strong{display:block;font-weight:600;color:#545454;}' +
    '.lgc-cat small{display:block;font-size:0.8125rem;color:#888;line-height:1.5;margin-top:0.125rem;}' +
    '.lgc-fixed{font-size:0.75rem;color:#8A9087;white-space:nowrap;padding-top:0.125rem;}' +
    '.lgc-switch{position:relative;flex-shrink:0;width:2.75rem;height:1.5rem;margin-top:0.125rem;}' +
    '.lgc-switch input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer;z-index:1;}' +
    '.lgc-switch span{position:absolute;inset:0;border-radius:100px;background:#D6D9D2;transition:background-color .2s ease;}' +
    '.lgc-switch span::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;' +
      'background:#FDFCFA;box-shadow:0 1px 3px rgba(58,51,44,0.2);transition:transform .22s cubic-bezier(0.34,1.56,0.64,1);}' +
    '.lgc-switch input:checked+span{background:#69775c;}' +
    '.lgc-switch input:checked+span::after{transform:translateX(1.25rem);}' +
    '@media (max-width:640px){.lgc{left:0.75rem;right:0.75rem;bottom:0.75rem;width:auto;padding:1.25rem 1.25rem 1rem;}}' +
    '@media (prefers-reduced-motion:reduce){.lgc,.lgc-btn,.lgc-switch span::after{transition:none;}}';

  var root = null;

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }

  function close() {
    if (!root) return;
    var r = root; root = null;
    r.classList.remove('lgc-in');
    setTimeout(function () { r.remove(); }, 350);
  }

  function decide(ads) {
    apply(saveConsent(ads));
    close();
  }

  function render(view) {
    if (!document.getElementById('lgc-style')) {
      var st = document.createElement('style');
      st.id = 'lgc-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    var current = readConsent();
    var html;
    if (view === 'settings') {
      html =
        '<section class="lgc" role="dialog" aria-labelledby="lgc-title" aria-live="polite">' +
          '<h2 id="lgc-title">Configurar cookies</h2>' +
          '<p>Elige qué cookies aceptas. Puedes cambiarlo cuando quieras desde el enlace “Configurar cookies” al pie de cada página.</p>' +
          '<div class="lgc-cat"><div><strong>Técnicas</strong><small>Necesarias para que la web funcione, por ejemplo para mantener tu acceso al curso.</small></div>' +
            '<span class="lgc-fixed">Siempre activas</span></div>' +
          '<div class="lgc-cat"><div><strong>Publicidad</strong><small>Meta (Facebook e Instagram) mide qué páginas visitas para mostrarte anuncios de Laura.</small></div>' +
            '<label class="lgc-switch"><input type="checkbox" id="lgc-ads" aria-label="Cookies de publicidad"' + (current && current.ads ? ' checked' : '') + '><span></span></label></div>' +
          '<div class="lgc-row"><button type="button" class="lgc-btn" data-lgc="save">Guardar mi elección</button></div>' +
          '<button type="button" class="lgc-link" data-lgc="back">Volver</button>' +
        '</section>';
    } else {
      html =
        '<section class="lgc" role="dialog" aria-labelledby="lgc-title" aria-live="polite">' +
          '<h2 id="lgc-title">¿Aceptas las cookies?</h2>' +
          '<p>Usamos cookies técnicas para que la web funcione y, si nos dejas, cookies de Meta para mostrarte anuncios relacionados con lo que has visto aquí. ' +
          '<a href="/cookies.html">Más información</a></p>' +
          '<div class="lgc-row">' +
            '<button type="button" class="lgc-btn" data-lgc="reject">Rechazar</button>' +
            '<button type="button" class="lgc-btn" data-lgc="accept">Aceptar</button>' +
          '</div>' +
          '<button type="button" class="lgc-link" data-lgc="settings">Configurar</button>' +
        '</section>';
    }

    var next = el(html);
    next.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lgc]');
      if (!b) return;
      var action = b.getAttribute('data-lgc');
      if (action === 'accept') decide(true);
      else if (action === 'reject') decide(false);
      else if (action === 'save') decide(document.getElementById('lgc-ads').checked);
      else if (action === 'settings') swap('settings');
      else if (action === 'back') swap('main');
    });

    return next;
  }

  // Si la página es más ancha que la pantalla, el móvil la reduce y el borde
  // inferior "fijo" queda fuera de la vista. Anclamos el aviso a la zona visible.
  function fitToViewport() {
    var vv = window.visualViewport;
    if (!root || !vv) return;
    var hidden = window.innerHeight - (vv.height + vv.offsetTop);
    root.style.marginBottom = hidden > 1 ? hidden + 'px' : '';
  }
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', fitToViewport);
    visualViewport.addEventListener('scroll', fitToViewport);
  }

  function swap(view) {
    var next = render(view);
    if (root) root.replaceWith(next); else document.body.appendChild(next);
    root = next;
    fitToViewport();
    requestAnimationFrame(function () { next.classList.add('lgc-in'); });
    var first = next.querySelector('button, input');
    if (first) first.focus({ preventScroll: true });
  }

  function open(view) {
    swap(view || 'settings');
  }

  // API pública para el enlace "Configurar cookies" del pie.
  window.lgCookies = { open: open };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (!a) return;
    e.preventDefault();
    open('settings');
  });

  // ─── Arranque ───
  var consent = readConsent();
  if (consent) apply(consent);

  function boot() {
    if (!readConsent()) {
      var next = render('main');
      document.body.appendChild(next);
      root = next;
      fitToViewport();
      requestAnimationFrame(function () { requestAnimationFrame(function () { next.classList.add('lgc-in'); }); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

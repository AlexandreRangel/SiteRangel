/* alexandrerangel.art.br - analytics.js
   GA4 (gtag) com Google Consent Mode v2.
   Nenhuma requisicao ao Google e feita antes do consentimento (nem cookie algum).
   Enquanto GA4_ID estiver vazio, nada e carregado e o aviso nao aparece. */
(function () {
  'use strict';

  if (window.__siteGaInitialized) {
    return;
  }
  window.__siteGaInitialized = true;

  var GA4_ID = 'G-W48Q28Q9BE'; // fluxo "AlexandreRangel.art.br - GA4"
  var CONSENT_KEY = 'ar-ana...sent';
  var root = document.documentElement;

  function detectLang() {
    try {
      if (/[?&]lang=en(&|$)/.test(window.location.search)) {
        return 'en';
      }
      if (localStorage.getItem('currentLanguage') === 'en') {
        return 'en';
      }
    } catch (e) { /* modo privado */ }
    return root.lang === 'en' ? 'en' : 'pt';
  }

  var lang = detectLang();

  var TEXT = {
    pt: {
      message: 'Usamos o Google Analytics para medir audiência, sem publicidade. Podemos medir?',
      accept: 'Aceitar',
      decline: 'Recusar',
      policy: 'Pol\u00edtica de Privacidade',
      label: 'Consentimento para an\u00e1lise de audi\u00eancia'
    },
    en: {
      message: 'We use Google Analytics to measure audience, with no advertising. May we measure?',
      accept: 'Accept',
      decline: 'Decline',
      policy: 'Privacy Policy',
      label: 'Analytics consent'
    }
  };

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function saveConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* modo privado */ }
  }

  function loadTag() {
    if (window.__siteGaLoaded) {
      return;
    }
    window.__siteGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    window.gtag('config', GA4_ID, { page_language: lang });

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
  }

  function syncOffset(box) {
    if (!box || !document.body) {
      return;
    }
    document.body.style.paddingBottom = box.offsetHeight + "px";
  }

  function clearOffset() {
    if (document.body) {
      document.body.style.paddingBottom = "";
    }
  }

  function showBanner() {
    var t = TEXT[lang];
    var box = document.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', t.label);
    box.innerHTML =
      '<p class="consent-text">' + t.message + '</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn primary consent-accept">' + t.accept + '</button>' +
      '<button type="button" class="btn consent-decline">' + t.decline + '</button>' +
      '<a class="consent-policy" href="' +
      (lang === 'en' ? 'privacidade.html?lang=en' : 'privacidade.html') +
      '">' + t.policy + '</a>' +
      '</div>';

    box.querySelector('.consent-accept').addEventListener('click', function () {
      saveConsent('granted');
      loadTag();
      box.remove();
      clearOffset();
    });
    box.querySelector('.consent-decline').addEventListener('click', function () {
      saveConsent('denied');
      box.remove();
      clearOffset();
    });

    if (document.body) {
      document.body.appendChild(box);
      syncOffset(box);
      window.addEventListener('resize', function () { syncOffset(box); });
    }
  }

  if (!GA4_ID) {
    return;
  }
  if (readConsent() === 'granted') {
    loadTag();
  } else if (readConsent() === null) {
    showBanner();
  }
})();

/**
 * Static quotes oracle — replaces quotes.php iframe for GitHub Pages.
 * Exposes window.updateQuotesBlock(lang) for footer / language switcher.
 */
(function () {
  'use strict';

  var CACHE = null; // Promise → { pt: [...], en: [...] }
  var lastKey = { pt: null, en: null };

  function resolveJsonUrl() {
    if (typeof window.QUOTES_JSON_URL === 'string' && window.QUOTES_JSON_URL) {
      return window.QUOTES_JSON_URL;
    }
    var script = document.currentScript;
    if (!script) {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && /quotes-oracle\.js/i.test(scripts[i].src)) {
          script = scripts[i];
          break;
        }
      }
    }
    if (script && script.src) {
      try {
        return new URL('../data/quotes.json', script.src).href;
      } catch (e) { /* fall through */ }
    }
    var root = '';
    if (/\/SiteRangel/i.test(location.pathname)) root = '/SiteRangel';
    return root + '/assets/data/quotes.json';
  }

  function resolveIconUrl() {
    if (typeof window.QUOTES_CLICK_ICON_URL === 'string' && window.QUOTES_CLICK_ICON_URL) {
      return window.QUOTES_CLICK_ICON_URL;
    }
    var script = document.currentScript;
    if (!script) {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && /quotes-oracle\.js/i.test(scripts[i].src)) {
          script = scripts[i];
          break;
        }
      }
    }
    if (script && script.src) {
      try {
        return new URL('../images/click-icon.png', script.src).href;
      } catch (e) { /* fall through */ }
    }
    var root = '';
    if (/\/SiteRangel/i.test(location.pathname)) root = '/SiteRangel';
    return root + '/assets/images/click-icon.png';
  }

  function normalizeLang(lang) {
    var language = (lang || document.documentElement.lang || navigator.language || 'pt').toLowerCase();
    return language.indexOf('en') === 0 ? 'en' : 'pt';
  }

  function loadQuotes() {
    if (CACHE) return CACHE;
    CACHE = fetch(resolveJsonUrl())
      .then(function (res) {
        if (!res.ok) throw new Error('quotes.json HTTP ' + res.status);
        return res.json();
      })
      .catch(function (err) {
        CACHE = null;
        console.error('[quotes-oracle]', err);
        return { pt: [], en: [] };
      });
    return CACHE;
  }

  function pickRandom(pool, lang) {
    if (!pool || !pool.length) return null;
    if (pool.length === 1) return pool[0];
    var idx, key, guard = 0;
    do {
      idx = Math.floor(Math.random() * pool.length);
      key = pool[idx].t + '\0' + pool[idx].a;
      guard++;
    } while (key === lastKey[lang] && guard < 20);
    lastKey[lang] = key;
    return pool[idx];
  }

  function renderQuote(block, quote, lang) {
    var aria = lang === 'en' ? 'New quote (oracle)' : 'Nova citação (oráculo)';
    var author = quote && quote.a ? quote.a : '';
    var text = quote && quote.t ? quote.t : '';
    var icon = resolveIconUrl();
    block.innerHTML =
      '<div id="quotes-oracle" role="button" tabindex="0" aria-label="' + aria + '"' +
      ' style="font:18px/32px Arial,Tahoma,sans-serif;color:#d60865;cursor:pointer">' +
      '<span class="quotes-oracle-text">' + text + '</span><br>' +
      '<span class="quotes-oracle-author">- ' + author + '</span><br>' +
      '<img src="' + icon + '" alt="" width="17" height="22">' +
      '</div>';

    var el = document.getElementById('quotes-oracle');
    if (!el) return;

    function next() {
      loadQuotes().then(function (data) {
        var pool = data[lang] || [];
        var q = pickRandom(pool, lang);
        if (!q) return;
        var textEl = el.querySelector('.quotes-oracle-text');
        var authorEl = el.querySelector('.quotes-oracle-author');
        if (textEl) textEl.innerHTML = q.t;
        if (authorEl) authorEl.textContent = '- ' + (q.a || '');
      });
    }

    el.addEventListener('click', function (e) {
      e.preventDefault();
      next();
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        next();
      }
    });
  }

  window.updateQuotesBlock = function (lang) {
    var language = normalizeLang(lang);
    var block = document.getElementById('quotes-block');
    if (!block) return;
    loadQuotes().then(function (data) {
      var pool = data[language] || [];
      var quote = pickRandom(pool, language);
      if (!quote) {
        block.innerHTML = '';
        return;
      }
      renderQuote(block, quote, language);
    });
  };
})();

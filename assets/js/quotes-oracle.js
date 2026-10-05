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

  var currentLang = 'pt';
  var isBlockBound = false;

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

  /** Replace the visible quote/author with another random entry. */
  function advanceQuote(block) {
    loadQuotes().then(function (data) {
      var pool = data[currentLang] || [];
      var q = pickRandom(pool, currentLang);
      if (!q) return;
      var textEl = block.querySelector('.quotes-oracle-text');
      var authorEl = block.querySelector('.quotes-oracle-author');
      if (textEl) textEl.innerHTML = q.t;
      if (authorEl) authorEl.textContent = '- ' + (q.a || '');
    });
  }

  /** True when the event landed on the quote text, author, icon, or the button. */
  function isQuotesSurface(target) {
    return !!(target && target.closest && target.closest('#quotes-oracle, .quotes-oracle, .quotes-oracle-surface'));
  }

  /** Bind once on #quotes-block so text, author, and icon all advance the quote. */
  function bindQuotesBlock(block) {
    if (isBlockBound || !block) return;
    isBlockBound = true;
    block.addEventListener('click', function (e) {
      if (!isQuotesSurface(e.target)) return;
      e.preventDefault();
      advanceQuote(block);
    });
  }

  function renderQuote(block, quote, lang) {
    currentLang = lang;
    var aria = lang === 'en' ? 'New quote (oracle)' : 'Nova citação (oráculo)';
    var author = quote && quote.a ? quote.a : '';
    var text = quote && quote.t ? quote.t : '';
    var icon = resolveIconUrl();
    block.innerHTML =
      '<button type="button" id="quotes-oracle" class="quotes-oracle" aria-label="' + aria + '">' +
        '<span class="quotes-oracle-surface">' +
          '<span class="quotes-oracle-text">' + text + '</span>' +
          '<span class="quotes-oracle-author">- ' + author + '</span>' +
          '<span class="quotes-oracle-icon" aria-hidden="true">' +
            '<img class="quotes-oracle-icon-img" src="' + icon + '" alt="" width="17" height="22">' +
            '<svg class="quotes-oracle-icon-fallback" hidden xmlns="http://www.w3.org/2000/svg" width="17" height="22" viewBox="0 0 24 24" focusable="false">' +
              '<path fill="currentColor" d="M11 2a1.5 1.5 0 0 0-1.5 1.5V11l-.7-.7a1.8 1.8 0 0 0-2.6 2.5l5.1 5.4c.6.6 1.4 1 2.3 1h3.9c1.6 0 2.9-1.2 3.1-2.8l.7-5.2A2.3 2.3 0 0 0 19 8.6h-3.2l.3-2.2A2.5 2.5 0 0 0 13.6 4H12.5V3.5A1.5 1.5 0 0 0 11 2z"/>' +
            '</svg>' +
          '</span>' +
        '</span>' +
      '</button>';
    var img = block.querySelector('.quotes-oracle-icon-img');
    if (img) {
      img.hidden = true;
      img.addEventListener('load', function () {
        img.hidden = false;
      });
      img.addEventListener('error', function () {
        img.hidden = true;
        var fallback = block.querySelector('.quotes-oracle-icon-fallback');
        if (fallback) fallback.hidden = false;
      });
    }
    bindQuotesBlock(block);
  }

  window.updateQuotesBlock = function (lang) {
    var language = normalizeLang(lang);
    var block = document.getElementById('quotes-block');
    if (!block) return;
    bindQuotesBlock(block);
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

/**
 * Click-to-load YouTube facade.
 * Shows a hosted poster until activation, then injects a youtube-nocookie iframe.
 */
(function () {
  'use strict';

  var ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

  /**
   * Replace a facade node with an autoplaying YouTube iframe.
   * @param {Element} facade
   */
  function injectYouTubeIframe(facade) {
    var id = facade.getAttribute('data-yt-id');
    if (!id || facade.getAttribute('data-yt-loaded') === '1') {
      return;
    }
    facade.setAttribute('data-yt-loaded', '1');
    var title = facade.getAttribute('data-yt-title') || '';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    iframe.setAttribute('allow', ALLOW);
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('frameborder', '0');
    if (title) {
      iframe.title = title;
    }
    facade.parentNode.replaceChild(iframe, facade);
    iframe.focus();
  }

  /**
   * Bind click-to-load on one facade node.
   * @param {Element} facade
   */
  function bindFacade(facade) {
    facade.addEventListener('click', function (event) {
      event.preventDefault();
      injectYouTubeIframe(facade);
    });
  }

  /**
   * Bind all .yt-facade nodes on the page.
   */
  function bindFacades() {
    var facades = document.querySelectorAll('.yt-facade');
    for (var i = 0; i < facades.length; i++) {
      bindFacade(facades[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindFacades);
  } else {
    bindFacades();
  }
})();

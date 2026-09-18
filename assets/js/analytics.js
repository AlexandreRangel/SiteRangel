/**
 * Google Analytics 4 (gtag) for alexandrerangel.art.br
 *
 * GA4 property: AlexandreRangel.art.br - GA4 (property ID 371310706)
 * Set GA_MEASUREMENT_ID to the web stream Measurement ID (Admin → Data streams → Web → Measurement ID).
 */
(function () {
    if (window.__siteGaInitialized) {
        return;
    }

    var GA_MEASUREMENT_ID = "G-W48Q28Q9BE";

    window.__siteGaInitialized = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;

    var loader = document.createElement("script");
    loader.async = true;
    loader.src =
        "https://www.googletagmanager.com/gtag/js?id=" +
        encodeURIComponent(GA_MEASUREMENT_ID);
    loader.onload = function () {
        gtag("js", new Date());
        gtag("config", GA_MEASUREMENT_ID);
    };
    (document.head || document.documentElement).appendChild(loader);
})();

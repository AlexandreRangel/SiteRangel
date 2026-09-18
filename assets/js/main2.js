function selectPT(reload) {
    document.documentElement.lang = 'pt-BR';
    $('[lang="en"]').hide();
    $('[lang="pt-BR"]').show();
    $('.flag-en').removeClass('flag-active');
    $('.flag-pt').addClass('flag-active');
    localStorage.setItem("currentLanguage", "pt-BR");
    if (typeof window.updateQuotesBlock === 'function') window.updateQuotesBlock('pt');
    if (reload) location.reload();
}
function selectEN(reload) {
    document.documentElement.lang = 'en';
    $('[lang="pt-BR"]').hide();
    $('[lang="en"]').show();
    $('.flag-pt').removeClass('flag-active');
    $('.flag-en').addClass('flag-active');
    localStorage.setItem("currentLanguage", "en");
    if (typeof window.updateQuotesBlock === 'function') window.updateQuotesBlock('en');
    if (reload) location.reload();
}

$(document).ready(function() {
    var $window = $(window),
        $body = $("body");

    // Breakpoints.
    breakpoints({
        normal: ["1081px", "1280px"],
        narrow: ["821px", "1080px"],
        narrower: ["737px", "820px"],
        mobile: ["481px", "736px"],
        mobilep: [null, "480px"],
    });

    // Play initial animations on page load.
    $window.on("load", function () {
        window.setTimeout(function () {

            console.log(localStorage.getItem("currentLanguage"));

            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const lang = urlParams.get('lang') ? urlParams.get('lang') : "";

            if (lang) {
                localStorage.setItem("currentLanguage", lang);
            }

            if (localStorage.getItem("currentLanguage") == null) {
                selectPT(false);
            }
            else if (localStorage.getItem("currentLanguage") == "pt-BR") {
                selectPT(false);
            }
            else if (localStorage.getItem("currentLanguage") == "en") {
                selectEN(false);
            }

            $body.removeClass("is-preload");

        }, 200);
    });

    // Dropdowns.
    $("#nav > ul").dropotron({
        mode: "fade",
        speed: 300,
        alignment: "center",
        noOpenerFade: true,
    });

    // Nav.

    // Button.
    $('<div id="navButton">' + '<a href="#navPanel" class="toggle"></a>' + "</div>").appendTo($body);

    // Panel.
    $('<div id="navPanel">' + "<nav>" + '<a href="index.html" class="link depth-0">Home</a>' + $("#nav").navList() + "</nav>" + "</div>")
        .appendTo($body)
        .panel({
            delay: 500,
            hideOnClick: true,
            resetScroll: true,
            resetForms: true,
            side: "top",
            target: $body,
            visibleClass: "navPanel-visible",
        });    

});

// Google Analytics — single config in assets/js/analytics.js (edit GA ID there only).
(function ensureSiteAnalytics() {
    if (window.__siteGaInitialized || document.querySelector('script[src*="analytics.js"]')) {
        return;
    }
    var el = document.createElement("script");
    el.src = "assets/js/analytics.js";
    el.async = true;
    (document.head || document.documentElement).appendChild(el);
})();
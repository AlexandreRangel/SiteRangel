$(document).ready(function () {
    changeLanguage();
})

function changeLanguage() {

    console.log("changeLanguage");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var lang = urlParams.get("lang") ? urlParams.get("lang").toLowerCase() : "";

    if (!lang) {
        lang = "pt-br";
    }

    if (lang == "en") {
        document.body.querySelectorAll('[lang="en"]').forEach(function (el) {
            el.style.display = "block";
        });
        document.body.querySelectorAll('[lang="pt-BR"]').forEach(function (el) {
            el.style.display = "none";
        });
    } else if (lang == "pt-br") {
        document.body.querySelectorAll('[lang="en"]').forEach(function (el) {
            el.style.display = "none";
        });
        document.body.querySelectorAll('[lang="pt-BR"]').forEach(function (el) {
            el.style.display = "block";
        });
    }
}
/*
	Telephasic by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

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
            $body.removeClass("is-preload");
        }, 100);
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
})(jQuery);
function selectPT(reload) {
    document.documentElement.lang = 'pt-BR';
    $('[lang="en"]').hide();
    $('[lang="pt-BR"]').show();
    $('.flag-en').removeClass('flag-active');
    $('.flag-pt').addClass('flag-active');
    localStorage.setItem("currentLanguage", "pt-BR");
    if (typeof window.updateQuotesBlock === 'function') window.updateQuotesBlock('pt');
    renderHashtagMenu();
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
    renderHashtagMenu();
    if (reload) location.reload();
}

/** Dedicated work pages mixed into the top hashtag bar (content.xml locs). */
var WORK_PAGE_NAV = [
    { href: "earth-affection.html", labelPt: "Earth Affection", labelEn: "Earth Affection" },
    { href: "esculturas-quanticas.html", labelPt: "Esculturas Quânticas", labelEn: "Quantum Sculptures" },
    { href: "pesadelo-colonial.html", labelPt: "Pesadelo Colonial", labelEn: "Colonial Nightmare" }
];
var hashtagFilterSnapshot = null;

/** True when the active site language is English (?lang=en or stored en). */
function isSiteEnglish() {
    var htmlLang = document.documentElement.lang;
    if (htmlLang === "en") return true;
    if (htmlLang === "pt-BR") return false;
    var queryLang = new URLSearchParams(window.location.search).get("lang");
    if (queryLang) return queryLang.toLowerCase() === "en";
    return localStorage.getItem("currentLanguage") === "en";
}

/** Sort key for hashtags and work-page labels, ignoring a leading '#'. */
function hashtagSortKey(label) {
    return String(label || "").replace(/^#/, "").trim();
}

/** Keep the original hashtag links so rebuilds do not change filter behavior. */
function snapshotHashtagFilters(menu) {
    if (hashtagFilterSnapshot) return hashtagFilterSnapshot;
    var items = [];
    var links = menu.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.classList.contains("work-page-nav")) continue;
        items.push({
            href: link.getAttribute("href"),
            label: (link.textContent || "").replace(/\s+/g, " ").trim()
        });
    }
    hashtagFilterSnapshot = items;
    return items;
}

/** Merge work-page entries with hashtags, sort A-Z by current language, and render. */
function renderHashtagMenu() {
    var menu = document.querySelector(".hashtag-menu");
    if (!menu || !menu.querySelector("a")) return;
    var isEnglish = isSiteEnglish();
    var locale = isEnglish ? "en" : "pt";
    var items = snapshotHashtagFilters(menu).map(function (item) {
        return { href: item.href, label: item.label, isWorkPage: false };
    });
    for (var i = 0; i < WORK_PAGE_NAV.length; i++) {
        var work = WORK_PAGE_NAV[i];
        items.push({
            href: isEnglish ? work.href + "?lang=en" : work.href,
            label: isEnglish ? work.labelEn : work.labelPt,
            isWorkPage: true
        });
    }
    items.sort(function (a, b) {
        return hashtagSortKey(a.label).localeCompare(hashtagSortKey(b.label), locale, { sensitivity: "base" });
    });
    menu.textContent = "";
    for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var anchor = document.createElement("a");
        anchor.href = item.href;
        if (item.isWorkPage) {
            anchor.className = "work-page-nav";
            var icon = document.createElement("span");
            icon.className = "work-page-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "\u25C6";
            anchor.appendChild(icon);
            anchor.appendChild(document.createTextNode(item.label));
        } else {
            anchor.textContent = item.label;
        }
        menu.appendChild(anchor);
    }
}

/** Render the hashtag bar once header.html has been injected. */
function initHashtagMenu() {
    if (document.querySelector(".hashtag-menu a")) {
        renderHashtagMenu();
        return;
    }
    var host = document.getElementById("include-header");
    if (!host) return;
    var observer = new MutationObserver(function () {
        if (document.querySelector(".hashtag-menu a")) {
            observer.disconnect();
            renderHashtagMenu();
        }
    });
    observer.observe(host, { childList: true, subtree: true });
}

var CAPSULE_SKIP = "#footer2, #include-footer, #nav, #header, #header-wrapper, #copyright, #quotes-block, #quotes-oracle";
var CAPSULE_MEDIA = ".player, .player-vertical, .player1x1, .yt-facade, iframe[src*='youtube'], iframe[src*='vimeo'], video";

/** True when a node has visible copy worth putting in a capsule. */
function hasCapsuleText(el) {
    return !!(el && (el.textContent || "").replace(/\s+/g, " ").trim());
}

/** True when a column holds a video, embed, or image. */
function columnHasMedia(col) {
    return !!(col.querySelector(CAPSULE_MEDIA) || col.querySelector("img"));
}

/** True when an element is chrome we must not wrap. */
function isCapsuleSkip(el) {
    return !!(el && el.closest && el.closest(CAPSULE_SKIP + ", .text-capsule, .card"));
}

/** Wrap an element's children in the shared gray text-capsule. */
function wrapElementInCapsule(el) {
    if (!el || isCapsuleSkip(el) || el.querySelector(":scope > .text-capsule, :scope > .card")) return;
    if (!hasCapsuleText(el)) return;
    var wrap = document.createElement("div");
    wrap.className = "text-capsule";
    while (el.firstChild) {
        wrap.appendChild(el.firstChild);
    }
    el.appendChild(wrap);
}

/** Wrap a consecutive sibling run in a text-capsule. */
function wrapSiblingRange(parent, nodes) {
    if (!parent || !nodes || !nodes.length) return;
    if (nodes.some(function (el) { return isCapsuleSkip(el); })) return;
    if (!nodes.some(hasCapsuleText)) return;
    var wrap = document.createElement("div");
    wrap.className = "text-capsule";
    parent.insertBefore(wrap, nodes[0]);
    nodes.forEach(function (el) {
        wrap.appendChild(el);
    });
}

/** Capsule text columns beside media, and full-width essay rows. */
function wrapRowTextCapsules() {
    var rows = document.querySelectorAll(".row");
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (isCapsuleSkip(row) || row.closest("#dynamic-content .card, section#cards .card")) continue;
        var cols = [];
        for (var j = 0; j < row.children.length; j++) {
            var col = row.children[j];
            if (col.className && col.className.indexOf("col-") !== -1) cols.push(col);
        }
        if (!cols.length) continue;
        var textCols = [];
        var mediaCount = 0;
        for (var k = 0; k < cols.length; k++) {
            if (columnHasMedia(cols[k])) mediaCount++;
            else if (hasCapsuleText(cols[k])) textCols.push(cols[k]);
        }
        if (textCols.length) {
            textCols.forEach(wrapElementInCapsule);
        }
    }
}

/** Capsule captions that sit under a player in the same column (home features). */
function wrapMediaCaptions() {
    var cols = document.querySelectorAll(".row > [class*='col-']");
    for (var i = 0; i < cols.length; i++) {
        var col = cols[i];
        if (isCapsuleSkip(col) || !col.querySelector(CAPSULE_MEDIA)) continue;
        if (col.querySelector(".text-capsule, .card")) continue;
        var kids = Array.from(col.children);
        var start = -1;
        for (var j = 0; j < kids.length; j++) {
            var el = kids[j];
            if (el.matches(CAPSULE_MEDIA) || el.querySelector(CAPSULE_MEDIA)) continue;
            if (el.tagName === "SCRIPT") continue;
            if (hasCapsuleText(el) || el.tagName === "BR") {
                if (start < 0 && el.tagName !== "BR") start = j;
            }
        }
        if (start < 0) continue;
        wrapSiblingRange(col, kids.slice(start));
    }
}

/** True when a #main child is loose essay/blurb copy (not a layout row). */
function isMainProse(el) {
    if (!el || el.nodeType !== 1) return false;
    if (isCapsuleSkip(el)) return false;
    if (el.id === "dynamic-content" || el.id === "cards") return false;
    if (el.classList.contains("row") || el.classList.contains("cards") || el.classList.contains("card") || el.classList.contains("player") || el.classList.contains("text-capsule")) return false;
    var tag = el.tagName;
    if (/^(SCRIPT|STYLE|CANVAS|IFRAME|IMG|VIDEO|NAV|FORM|BR|HR)$/.test(tag)) return false;
    if (/^(H2|H3|H4|H5|H6|P|SPAN|I|EM|BLOCKQUOTE|A|STRONG|B|UL|OL|SMALL)$/.test(tag)) return true;
    if (tag === "DIV" && !el.querySelector(".row, .player, .card, .text-capsule, img, iframe")) return true;
    return false;
}

/** Capsule the home hero subtitle under the name. */
function wrapHeroBlurb() {
    var hero = document.getElementById("hero");
    if (!hero || isCapsuleSkip(hero)) return;
    var group = [];
    var kids = Array.from(hero.children);
    for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        if (el.tagName === "HEADER") continue;
        if (el.tagName === "H3" || el.tagName === "P" || el.tagName === "SPAN" || el.tagName === "H5") {
            group.push(el);
        }
    }
    wrapSiblingRange(hero, group);
}

/** Capsule intro blurbs and essays that sit as direct children of #main. */
function wrapMainProseCapsules() {
    var main = document.getElementById("main");
    if (!main) return;
    var kids = Array.from(main.children);
    var group = [];
    function flush() {
        var meaningful = group.filter(function (el) {
            return el.tagName !== "BR" && el.tagName !== "HR";
        });
        var onlyTitles = meaningful.length && meaningful.every(function (el) {
            return /^H[12]$/.test(el.tagName);
        });
        if (meaningful.length && !onlyTitles) {
            wrapSiblingRange(main, group);
        }
        group = [];
    }
    for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        if (el.tagName === "BR" || el.tagName === "HR") {
            if (group.length) group.push(el);
            continue;
        }
        if (isMainProse(el)) {
            group.push(el);
            continue;
        }
        flush();
    }
    flush();
}

/**
 * Apply the catalog gray capsule to bare text blocks site-wide:
 * video/image side-panels, full-width essays, and page blurbs.
 */
function wrapSiteTextCapsules() {
    wrapRowTextCapsules();
    wrapMediaCaptions();
    wrapMainProseCapsules();
    wrapHeroBlurb();
}

$(document).ready(function() {
    initHashtagMenu();
    wrapSiteTextCapsules();
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
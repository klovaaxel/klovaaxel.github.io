/**
 * Early theme boot — runs synchronously in <head> before first paint.
 * Picks a random theme and sets data-theme + browser chrome meta tags.
 *
 * Pool logic must stay aligned with pickRandomTheme() in js/theme.js.
 */
(function () {
    var dataElement = document.getElementById("portfolio-theme-data");
    if (!dataElement) return;

    var data = JSON.parse(dataElement.textContent);
    var themeById = {};
    data.themes.forEach(function (theme) {
        themeById[theme.id] = theme;
    });

    var supportsSketch = typeof CSS !== "undefined" && CSS.supports && CSS.supports("border-shape", "circle(50%)");

    var themeIds = data.themes
        .map(function (theme) {
            return theme.id;
        })
        .filter(function (id) {
            return id !== "sketch" || supportsSketch;
        });

    var theme = themeIds[Math.floor(Math.random() * themeIds.length)] || data.defaultTheme;
    document.documentElement.dataset.theme = theme;

    var chrome = themeById[theme] || themeById[data.defaultTheme];
    if (!chrome) return;

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", chrome.themeColor);

    var statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBar) statusBar.setAttribute("content", chrome.statusBarStyle);
})();

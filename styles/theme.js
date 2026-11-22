(() => {
  "use strict";

  function readTheme(value) {
    if (value === undefined) {
      try { value = window.localStorage.getItem("theme"); }
      catch (_) { value = "light"; }
    }
    return value === "dark" ? "dark" : "light";
  }

  function applyTheme(value) {
    const theme = readTheme(value);
    document.documentElement.dataset.theme = theme;
    if (document.body) document.body.dataset.theme = theme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === "light" ? "#f3f5f8" : "#0b1220";
  }

  applyTheme();
  if (!document.body) document.addEventListener("DOMContentLoaded", () => applyTheme(), { once: true });
  window.addEventListener("storage", (event) => {
    if (event.key === "theme" || event.key === null) applyTheme(event.newValue);
  });
})();

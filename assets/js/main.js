/* A single document; only text and language metadata change. No framework. */
(function () {
  "use strict";

  function chooseLanguage(saved, languages, language) {
    if (saved === "en" || saved === "zh") return saved;
    const preferred = (Array.isArray(languages) && languages.find(Boolean)) || language || "en";
    return String(preferred).toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  // The pure chooser can also be checked with Node's built-in test runner.
  if (typeof module !== "undefined" && module.exports) module.exports = { chooseLanguage };
  if (typeof document === "undefined") return;
  const source = document.getElementById("site-data");
  if (!source) return;
  const data = JSON.parse(source.textContent);
  const storageKey = "hao-gao-language";

  function translated(path, language) {
    const value = path.split(".").reduce((item, key) => item && item[key], data);
    return value && (value[language] || value.en);
  }

  function applyLanguage(language) {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = translated(element.dataset.i18n, language);
      if (typeof value !== "string") return;
      const attribute = element.dataset.i18nAttr;
      if (attribute) element.setAttribute(attribute, value);
      else element.textContent = value;
    });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    const locale = document.querySelector('meta[property="og:locale"]');
    const alternate = document.querySelector('meta[property="og:locale:alternate"]');
    if (locale) locale.content = language === "zh" ? "zh_CN" : "en_US";
    if (alternate) alternate.content = language === "zh" ? "en_US" : "zh_CN";
  }

  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (_) { /* Storage is optional. */ }
  applyLanguage(chooseLanguage(saved, navigator.languages, navigator.language));

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.dataset.language;
      applyLanguage(language);
      try { localStorage.setItem(storageKey, language); } catch (_) { /* Keep the current selection. */ }
    });
  });
  document.querySelectorAll(".language-control").forEach((control) => { control.hidden = false; });
}());

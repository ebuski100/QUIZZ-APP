(() => {
  "use strict";

  const storageValue = (key) => {
    try { return window.localStorage ? localStorage.getItem(key) : null; }
    catch { return null; }
  };
  const setStorageValue = (key, value) => {
    try { if (window.localStorage) localStorage.setItem(key, value); }
    catch { /* Routing must still complete if storage is unavailable. */ }
  };
  const base = window.location.hostname.includes("github.io") ? "/QUIZZ-APP/" : "../";
  const hasProfile = Boolean(storageValue("username") && storageValue("age"));
  const destination = hasProfile ? `${base}homepage/home.html` : `${base}RegisterPage/register.html`;
  const loader = document.getElementById("loader-overlay");
  const progress = document.querySelector(".loader-progress");

  // The original launch screen waits five seconds; preserve that duration and
  // the welcome flag while ensuring navigation always has a finite deadline.
  window.setTimeout(() => loader?.classList.add("is-departing"), 4650);
  window.setTimeout(() => {
    if (hasProfile) setStorageValue("showWelcome", "true");
    window.location.href = destination;
  }, 5000);

  // Retain a clear wait state if the progress element is absent in a partial
  // load; the redirect timer remains independent of visual assets.
  if (progress) progress.setAttribute("aria-valuetext", "Launching QuizVilla");
})();

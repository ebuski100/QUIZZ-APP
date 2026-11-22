(() => {
  "use strict";

  if (!("serviceWorker" in navigator)) return;
  const scriptUrl = document.currentScript?.src;
  if (!scriptUrl) return;
  const appRoot = new URL("../", scriptUrl);
  const secureLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
  if (!window.isSecureContext && !secureLocalhost) return;

  navigator.serviceWorker.register(new URL("sw.js", appRoot), {
    scope: appRoot.pathname,
    updateViaCache: "none"
  })
    .catch((error) => console.warn("QuizVilla offline support could not start.", error));
})();

(() => {
  "use strict";

  const installButtons = [...document.querySelectorAll(".pwa-install-button")];
  const installStatuses = [...document.querySelectorAll(".pwa-install-status")];
  if (!installButtons.length) return;

  let installDialog = document.getElementById("pwa-install-dialog");
  if (!installDialog) {
    installDialog = document.createElement("dialog");
    installDialog.id = "pwa-install-dialog";
    installDialog.className = "pwa-install-dialog";
    installDialog.setAttribute("aria-labelledby", "pwa-install-title");
    installDialog.innerHTML = '<div class="pwa-install-dialog-content"><button class="pwa-install-close" type="button" data-install-close aria-label="Close installation help">&times;</button><h2 id="pwa-install-title" data-install-title>Install QuizVilla</h2><p data-install-intro></p><ol data-install-steps></ol></div>';
    document.body.append(installDialog);
  }

  let deferredPrompt = null;
  const dialogTitle = installDialog.querySelector("[data-install-title]");
  const dialogIntro = installDialog.querySelector("[data-install-intro]");
  const steps = installDialog.querySelector("[data-install-steps]");
  const closeButton = installDialog.querySelector("[data-install-close]");

  function isInstalled() {
    return window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
  }

  function updateVisibility() {
    const installed = isInstalled();
    installButtons.forEach((button) => { button.hidden = installed; });
    if (installed) setStatus("QuizVilla is installed on this device.");
  }

  function setStatus(message) {
    installStatuses.forEach((status) => { status.textContent = message; });
  }

  function platformInstructions() {
    const ua = navigator.userAgent || "";
    const isAppleMobile = /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMac = /Macintosh|Mac OS X/i.test(ua) && !isAppleMobile;
    const isAndroid = /Android/i.test(ua);

    if (isAppleMobile) {
      return {
        title: "Add QuizVilla to your Home Screen",
        intro: "On iPhone or iPad, open QuizVilla in a supported browser, then use its Share menu.",
        steps: ["Tap Share.", "Choose Add to Home Screen (you may need to scroll the menu).", "Tap Add to finish."]
      };
    }
    if (isAndroid) {
      return {
        title: "Install QuizVilla",
        intro: "If your browser does not show its install prompt, use the browser menu.",
        steps: ["Open the browser menu.", "Choose Install app or Add to Home screen.", "Confirm the prompt."]
      };
    }
    if (isMac) {
      return {
        title: "Install QuizVilla on Mac",
        intro: "Use the install action offered by your browser.",
        steps: ["In Chrome or Edge, choose the install icon or Install QuizVilla from the menu.", "In Safari on macOS Sonoma or later, choose File, then Add to Dock."]
      };
    }
    return {
      title: "Install QuizVilla on desktop",
      intro: "Use a browser that supports installing websites as apps.",
      steps: ["In Chrome or Edge, select the install icon in the address bar or choose Install QuizVilla from the browser menu.", "Confirm the browser's installation prompt."]
    };
  }

  function showInstructions() {
    const content = platformInstructions();
    dialogTitle.textContent = content.title;
    dialogIntro.textContent = content.intro;
    steps.replaceChildren(...content.steps.map((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    }));
    if (typeof installDialog.showModal === "function") installDialog.showModal();
    else installDialog.setAttribute("open", "");
    closeButton.focus();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    setStatus("Install QuizVilla on this device.");
    updateVisibility();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installButtons.forEach((button) => { button.hidden = true; });
    setStatus("QuizVilla is installed on this device.");
  });

  async function handleInstallClick() {
    if (!deferredPrompt) {
      showInstructions();
      return;
    }
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    try {
      await promptEvent.prompt();
      const result = await promptEvent.userChoice;
      if (result?.outcome === "accepted") {
        setStatus("QuizVilla is being installed.");
      } else {
        setStatus("You can install QuizVilla later from this page.");
      }
    } catch (_) {
      setStatus("Use the browser menu to install QuizVilla.");
    }
  }

  installButtons.forEach((button) => button.addEventListener("click", handleInstallClick));

  closeButton.addEventListener("click", () => installDialog.close?.());
  installDialog.addEventListener("click", (event) => {
    if (event.target === installDialog) installDialog.close?.();
  });
  window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", updateVisibility);
  updateVisibility();
})();

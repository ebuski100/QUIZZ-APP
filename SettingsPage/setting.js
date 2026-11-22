(() => {
  const readSetting = (key, fallback = null) => {
    try { return window.localStorage ? localStorage.getItem(key) ?? fallback : fallback; }
    catch { return fallback; }
  };
  const writeSetting = (key, value) => {
    try { if (window.localStorage) localStorage.setItem(key, String(value)); }
    catch { /* Settings remain usable when storage is blocked or full. */ }
  };

  const difficultySelect = document.getElementById("Difficulty");
  const themeChoices = document.querySelectorAll(".theme-choice");
  const soundToggle = document.getElementById("soundToggle");
  const musicToggle = document.getElementById("musicToggle");
  const backgroundMusic = document.getElementById("backgroundMusic");
  const soundEffect = document.getElementById("soundEffect");
  const doneButton = document.getElementById("okBtn");
  let soundState = readSetting("soundState", "on");
  let musicState = readSetting("musicState", "paused");

  if (difficultySelect) {
    const storedDifficulty = readSetting("selectedDifficulty", "easy");
    difficultySelect.value = ["easy", "medium", "hard"].includes(storedDifficulty) ? storedDifficulty : "easy";
    difficultySelect.addEventListener("change", () => writeSetting("selectedDifficulty", difficultySelect.value));
  }

  function applyTheme(theme) {
    const activeTheme = theme === "dark" ? "dark" : "light";
    document.body.dataset.theme = activeTheme;
    document.documentElement.dataset.theme = activeTheme;
    document.documentElement.style.colorScheme = activeTheme;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = activeTheme === "light" ? "#f3f5f8" : "#0b1220";
    themeChoices.forEach((choice) => choice.setAttribute("aria-pressed", String(choice.dataset.theme === activeTheme)));
  }
  applyTheme(readSetting("theme", "light"));
  themeChoices.forEach((choice) => choice.addEventListener("click", () => {
    const theme = choice.dataset.theme === "dark" ? "dark" : "light";
    writeSetting("theme", theme);
    applyTheme(theme);
  }));
  window.addEventListener("storage", (event) => {
    if (event.key === "theme" || event.key === null) applyTheme(event.newValue);
  });

  function updateToggle(button, enabled, onLabel, offLabel, onAlt, offAlt) {
    if (!button) return;
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? onAlt : offAlt);
    const label = button.querySelector(".state-label");
    const icon = button.querySelector(".state-icon img");
    if (label) label.textContent = enabled ? onLabel : offLabel;
    if (icon) icon.src = enabled ? "../images/volume.png" : "../images/mute.png";
  }
  soundState = soundState === "off" ? "off" : "on";
  updateToggle(soundToggle, soundState === "on", "On", "Off", "Turn sound effects off", "Turn sound effects on");
  soundToggle?.addEventListener("click", () => {
    soundState = soundState === "on" ? "off" : "on";
    writeSetting("soundState", soundState);
    updateToggle(soundToggle, soundState === "on", "On", "Off", "Turn sound effects off", "Turn sound effects on");
  });

  // Existing pages store musicState as "playing" or "paused".
  musicState = musicState === "playing" || musicState === "on" ? "playing" : "paused";
  let musicWanted = musicState === "playing";
  let restoredMusicTime = false;
  function saveMusicTime() {
    if (backgroundMusic && Number.isFinite(backgroundMusic.currentTime)) writeSetting("musicTime", backgroundMusic.currentTime);
  }
  function restoreMusicTime() {
    if (!backgroundMusic || restoredMusicTime) return;
    if (backgroundMusic.readyState < 1) return;
    const savedTime = Number.parseFloat(readSetting("musicTime", "0"));
    if (Number.isFinite(savedTime) && savedTime >= 0) {
      try {
        if (Number.isFinite(backgroundMusic.duration) && backgroundMusic.duration > 0) {
          backgroundMusic.currentTime = Math.min(savedTime, backgroundMusic.duration);
        } else {
          backgroundMusic.currentTime = savedTime;
        }
      } catch { /* The browser may not have seekable audio data yet. */ }
    }
    restoredMusicTime = true;
  }
  async function syncMusicPlayback() {
    if (!backgroundMusic) return;
    if (!musicWanted || document.hidden) {
      backgroundMusic.pause();
      return;
    }
    restoreMusicTime();
    try { await backgroundMusic.play(); }
    catch { /* Browser autoplay restrictions are expected; the toggle can be used again. */ }
  }
  if (backgroundMusic) {
    backgroundMusic.addEventListener("loadedmetadata", restoreMusicTime, { once: true });
    backgroundMusic.addEventListener("timeupdate", saveMusicTime);
    backgroundMusic.addEventListener("pause", saveMusicTime);
    updateToggle(musicToggle, musicWanted, "On", "Off", "Turn background music off", "Turn background music on");
    if (backgroundMusic.readyState >= 1) restoreMusicTime();
    syncMusicPlayback();
  } else {
    updateToggle(musicToggle, false, "On", "Off", "Turn background music off", "Turn background music on");
  }
  musicToggle?.addEventListener("click", () => {
    musicWanted = !musicWanted;
    musicState = musicWanted ? "playing" : "paused";
    writeSetting("musicState", musicState);
    updateToggle(musicToggle, musicWanted, "On", "Off", "Turn background music off", "Turn background music on");
    syncMusicPlayback();
  });
  document.addEventListener("visibilitychange", syncMusicPlayback);

  // Keep the existing .btn click sound convention, with one listener and no
  // second sound in the Done handler.
  document.addEventListener("click", (event) => {
    if (soundState !== "on" || !soundEffect || !(event.target instanceof Element)) return;
    if (!event.target.closest(".btn")) return;
    try {
      soundEffect.currentTime = 0;
      const playback = soundEffect.play();
      if (playback?.catch) playback.catch(() => {});
    } catch { /* Optional audio should never prevent settings or navigation. */ }
  });

  function getReturnUrl() {
    const githubPages = window.location.hostname.toLowerCase().endsWith("github.io");
    const base = githubPages ? "/QUIZZ-APP/" : "../";
    let page = readSetting("lastPage", "homepage/home.html");
    if (typeof page !== "string" || !page.trim()) page = "homepage/home.html";
    page = page.trim().replace(/^\/+/, "");
    if (page.startsWith("QUIZZ-APP/")) page = page.slice("QUIZZ-APP/".length);
    const segments = page.split("/");
    const valid = !/[:\\?#]/.test(page) && segments.every((part) => part && part !== "." && part !== "..");
    if (!valid) page = "homepage/home.html";
    return base + page;
  }
  doneButton?.addEventListener("click", () => {
    saveMusicTime();
    window.setTimeout(() => { window.location.href = getReturnUrl(); }, 120);
  });

  document.querySelector(".profile")?.addEventListener("click", () => {
    writeSetting("editReturnPage", "SettingsPage/setting.html");
  });
})();

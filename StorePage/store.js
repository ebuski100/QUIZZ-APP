(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback = null) => {
    try { return window.localStorage ? localStorage.getItem(key) ?? fallback : fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => {
    try { if (window.localStorage) localStorage.setItem(key, String(value)); }
    catch { notify("Your browser could not save this change."); }
  };
  const numberFrom = (key, fallback = 0) => {
    const value = Number.parseInt(read(key, ""), 10);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };
  const base = window.location.hostname.toLowerCase().includes("github.io") ? "/QUIZZ-APP/" : "../";
  const coinDisplay = $(".coin-num1");
  const heartDisplay = $(".heartnum");
  const hintDisplay = $(".hintnum");
  const coinMax = $(".coinMax-cont");
  const heartMax = $(".heartMax-cont");
  const adDialog = $(".adModal");
  const hintDialog = $(".getAHintModal");
  const adVideo = $("#ad-video");
  const music = $("#backgroundMusic");
  const sound = $("#soundEffect");
  const progress = $("#progressBar");
  const adStatus = $(".ad-status");
  const continueAd = $(".modal-footer");
  const cancelAd = $("#cancel-ad-btn");
  const hintMappings = [
    { selector: ".fifty-fifty", used: "fiftyFiftyUsed", bought: "fiftyHintBought", label: "Fifty-Fifty" },
    { selector: ".expertAns", used: "expertUsed", bought: "expertAnsBought", label: "Expert Answer" },
    { selector: ".anotherQuestion", used: "anotherQuestionUsed", bought: "anotherQuestionBought", label: "Another Question" },
  ];
  let coins = numberFrom("coinCount");
  let hearts = numberFrom("heartNum", 5);
  let hintMode = "coin";
  let activeAdReward = null;
  let adElapsed = 0;
  let adTimer = null;
  let adFinishing = false;
  let adSessionId = 0;
  let feedbackTimer = null;
  let musicWanted = read("musicState", "paused") === "playing";

  // The older app initializes a missing heart balance to five. Existing balances
  // are read as-is and never reset when opening the Store.
  if (read("heartNum") === null) write("heartNum", hearts);
  if (coinDisplay) coinDisplay.textContent = String(coins);
  if (heartDisplay) heartDisplay.textContent = String(hearts);
  if (coinMax) coinMax.classList.toggle("displayMax", coins >= 5000);
  if (heartMax) heartMax.classList.toggle("displayMax", hearts >= 5);

  function notify(message) {
    const feedback = $(".store-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.add("is-visible");
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => feedback.classList.remove("is-visible"), 3000);
  }
  function play(audio) {
    if (!audio) return;
    try {
      audio.currentTime = 0;
      const result = audio.play();
      if (result?.catch) result.catch(() => {});
    } catch { /* Optional sound should not block a store action. */ }
  }
  function playFeedbackSound(path, delay = 0) {
    if (read("soundState", "on") !== "on") return;
    window.setTimeout(() => {
      try {
        const audio = new Audio(path);
        play(audio);
      } catch { /* Audio may be unavailable in a restricted browser. */ }
    }, delay);
  }
  function updateBalances() {
    if (coinDisplay) coinDisplay.textContent = String(coins);
    if (heartDisplay) heartDisplay.textContent = String(hearts);
    if (coinMax) coinMax.classList.toggle("displayMax", coins >= 5000);
    if (heartMax) heartMax.classList.toggle("displayMax", hearts >= 5);
    const hintsReady = hintMappings.filter((hint) => read(hint.used) !== "true").length;
    if (hintDisplay) hintDisplay.textContent = String(hintsReady);
    $(".coins")?.setAttribute("aria-label", `Coin balance: ${coins}`);
    $(".heart")?.setAttribute("aria-label", `Heart balance: ${hearts}`);
    $(".hint-balance")?.setAttribute("aria-label", `${hintsReady} unused hints`);
    const coinOptions = $$(".getCoins");
    coinOptions.forEach((option) => { option.disabled = coins >= 5000; });
    const oneBundle = $(".handful");
    const fiveBundle = $(".heap");
    if (oneBundle) oneBundle.disabled = coins >= 5000;
    if (fiveBundle) fiveBundle.disabled = coins >= 5000;
  }
  updateBalances();

  function setDialog(dialog, open) {
    if (!dialog) return;
    dialog.classList.toggle("is-open", open);
    dialog.setAttribute("aria-hidden", String(!open));
  }
  function refreshHintOptions() {
    hintMappings.forEach((hint) => {
      const option = $(hint.selector);
      if (!option) return;
      const alreadyOwned = read(hint.bought) === "true";
      const alreadyUsed = read(hint.used) === "true";
      option.disabled = alreadyOwned || alreadyUsed;
      option.setAttribute("aria-disabled", String(option.disabled));
      const text = $(".hintOptionText", option);
      if (text) text.textContent = alreadyOwned ? `${hint.label} · already claimed` : alreadyUsed ? `${hint.label} · used this game` : hint.label;
    });
    const allUsed = hintMappings.every((hint) => read(hint.used) === "true");
    const allHints = $("#allHintsCoin");
    if (allHints) allHints.disabled = !allUsed;
    const single = $("#getAHintCoin");
    const adHint = $("#allHintsAdBtn");
    const anyAvailable = hintMappings.some((hint) => read(hint.bought) !== "true" && read(hint.used) !== "true");
    if (single) single.disabled = !anyAvailable;
    if (adHint) adHint.disabled = !anyAvailable;
  }
  refreshHintOptions();
  const timerPurchase = $("#ansTimeCoin");
  if (timerPurchase && read("disableTimer")) timerPurchase.disabled = true;

  function closeHintDialog() { setDialog(hintDialog, false); }
  function openHintDialog(mode) {
    hintMode = mode;
    refreshHintOptions();
    setDialog(hintDialog, true);
    $(".modalCloseBtn")?.focus();
  }
  function completeHint(hint) {
    if (hintMode === "coin") {
      if (coins < 1000) { notify("You need 1,000 coins to choose a hint."); return; }
      coins -= 1000;
      write("coinCount", coins);
      write(hint.bought, "true");
    }
    write(hint.used, "false");
    if (hintMode === "ad") write(hint.bought, "true");
    updateBalances();
    refreshHintOptions();
    closeHintDialog();
    notify(`${hint.label} is ready for your next quiz.`);
    playFeedbackSound("../sounds/coinPurchase.wav", 200);
  }
  hintMappings.forEach((hint) => $(hint.selector)?.addEventListener("click", () => {
    if ($(hint.selector).disabled) return;
    completeHint(hint);
  }));
  $(".modalCloseBtn")?.addEventListener("click", closeHintDialog);
  hintDialog?.addEventListener("click", (event) => { if (event.target === hintDialog) closeHintDialog(); });
  $("#getAHintCoin")?.addEventListener("click", () => {
    if (coins < 1000) { notify("You need 1,000 coins to choose a hint."); return; }
    if (!hintMappings.some((hint) => read(hint.bought) !== "true" && read(hint.used) !== "true")) { notify("No hint choices are available right now."); return; }
    openHintDialog("coin");
  });

  $("#allHintsCoin")?.addEventListener("click", () => {
    if (coins < 3000) { notify("You need 3,000 coins for the hint set."); return; }
    if (!hintMappings.every((hint) => read(hint.used) === "true")) { notify("Use your current hints before replenishing the full set."); return; }
    coins -= 3000;
    write("coinCount", coins);
    hintMappings.forEach((hint) => write(hint.used, "false"));
    updateBalances();
    refreshHintOptions();
    notify("All three hints are ready for your next quiz.");
    playFeedbackSound("../sounds/coinPurchase.wav", 200);
  });

  $$(".coins-option").forEach((option) => option.addEventListener("click", () => {
    if (option.disabled) return;
    const isHeap = option.classList.contains("heap");
    const heartCost = isHeap ? 5 : 1;
    const coinReward = isHeap ? 5000 : 1000;
    if (hearts < heartCost) { notify(`You need ${heartCost} ${heartCost === 1 ? "heart" : "hearts"} for this coin bundle.`); return; }
    if (coins >= 5000) { notify("Your coin balance is already at its 5,000 limit."); return; }
    coins = Math.min(5000, coins + coinReward);
    hearts -= heartCost;
    write("coinCount", coins);
    write("heartNum", hearts);
    updateBalances();
    notify(`${coins.toLocaleString()} coins and ${hearts} hearts available.`);
    playFeedbackSound("../sounds/coinPurchase.wav", 200);
  }));

  timerPurchase?.addEventListener("click", () => {
    if (timerPurchase.disabled) { notify("Extra time is already active for this game."); return; }
    if (coins < 3000) { notify("You need 3,000 coins for extra time."); return; }
    const pauseTimeCount = Math.min(5, numberFrom("pauseTimeCount") + 5);
    coins -= 3000;
    write("coinCount", coins);
    write("pauseTimeCount", pauseTimeCount);
    updateBalances();
    timerPurchase.disabled = true;
    notify("Five timer pauses are ready for this game.");
    playFeedbackSound("../sounds/coinPurchase.wav", 200);
  });

  async function startAd(button) {
    if (button.disabled || adTimer || activeAdReward) return;
    const sessionId = ++adSessionId;
    activeAdReward = button.id === "few-coinsAdBtn" ? "coins" : "hint";
    adElapsed = 0;
    adFinishing = false;
    if (adStatus) adStatus.textContent = "Stay for 40 seconds to continue.";
    if (progress) progress.value = "0";
    if (continueAd) { continueAd.disabled = true; continueAd.textContent = "Continue to reward"; }
    setDialog(adDialog, true);
    adDialog?.querySelector(".close-modal")?.focus();
    music?.pause();
    try {
      const response = await fetch(`${base}adLinks.json`);
      if (!response.ok) throw new Error(`Ad list request failed (${response.status})`);
      const adList = await response.json();
      if (sessionId !== adSessionId || !activeAdReward) return;
      if (!Array.isArray(adList) || adList.length === 0) throw new Error("No ads are available");
      const selectedAd = adList[Math.floor(Math.random() * adList.length)];
      if (!selectedAd?.path) throw new Error("The ad list has no playable video path");
      adVideo.src = selectedAd.path;
      adVideo.load();
      const playback = adVideo.play();
      if (playback?.catch) playback.catch(() => { if (adStatus) adStatus.textContent = "Press play to start the video. Your watch time begins when it plays."; });
      if (adTimer) window.clearInterval(adTimer);
      adTimer = window.setInterval(() => {
        if (!adVideo.paused && !document.hidden) {
          adElapsed += 1;
          if (progress) progress.value = String(Math.min(adElapsed, 40));
          const mins = Math.floor(adElapsed / 60);
          const secs = String(adElapsed % 60).padStart(2, "0");
          const timeDisplay = $("#currentTime");
          if (timeDisplay) timeDisplay.textContent = `${mins}:${secs}`;
          if (adElapsed >= 40 && continueAd) {
            continueAd.disabled = false;
            if (adStatus) adStatus.textContent = "Reward unlocked. Continue when you are ready.";
          }
        }
      }, 1000);
    } catch (error) {
      if (sessionId !== adSessionId) return;
      if (adStatus) adStatus.textContent = "The reward video could not be loaded. Close this window and try again later.";
      console.error("Unable to load reward ad:", error);
      activeAdReward = null;
    }
  }
  function finishAd() {
    if (adFinishing || !activeAdReward || adElapsed < 40) return;
    adFinishing = true;
    if (adTimer) window.clearInterval(adTimer);
    adTimer = null;
    adSessionId += 1;
    adVideo?.pause();
    setDialog(adDialog, false);
    if (musicWanted && !document.hidden) music?.play()?.catch(() => {});
    if (activeAdReward === "coins") {
      const reward = Math.min(200, 5000 - coins);
      if (reward <= 0) notify("Your coin balance is already at its 5,000 limit.");
      else {
        coins += reward;
        write("coinCount", coins);
        updateBalances();
        notify(`${reward} coins added to your balance.`);
        playFeedbackSound("../sounds/coinPurchase.wav", 150);
      }
    } else {
      openHintDialog("ad");
    }
    activeAdReward = null;
  }
  function closeAd() {
    if (adTimer) window.clearInterval(adTimer);
    adTimer = null;
    adSessionId += 1;
    adVideo?.pause();
    if (adVideo) { adVideo.removeAttribute("src"); adVideo.load(); }
    activeAdReward = null;
    adFinishing = false;
    setDialog(adDialog, false);
    if (musicWanted && !document.hidden) music?.play()?.catch(() => {});
  }
  $$(".watch-ad").forEach((button) => button.addEventListener("click", () => startAd(button)));
  continueAd?.addEventListener("click", finishAd);
  cancelAd?.addEventListener("click", closeAd);
  $("#play-pause-overlay")?.addEventListener("click", () => {
    if (!adVideo) return;
    if (adVideo.paused) {
      const playback = adVideo.play();
      if (playback?.catch) playback.catch(() => {});
      $(".playPauseIcon").src = "../images/video-pause-button.png";
      $("#play-pause-overlay").setAttribute("aria-label", "Pause advertisement");
    } else {
      adVideo.pause();
      $(".playPauseIcon").src = "../images/play-button-arrowhead.png";
      $("#play-pause-overlay").setAttribute("aria-label", "Play advertisement");
    }
  });
  adVideo?.addEventListener("ended", () => {
    // Each selected ad continues to the next listed video until the 40-second
    // reward threshold is reached; only the continue action grants a reward.
    const sessionId = adSessionId;
    if (activeAdReward && adElapsed < 40) {
      fetch(`${base}adLinks.json`).then((response) => response.json()).then((list) => {
        if (sessionId !== adSessionId || !activeAdReward || !Array.isArray(list) || !list.length) return;
        const item = list[Math.floor(Math.random() * list.length)];
        if (item?.path) { adVideo.src = item.path; adVideo.load(); adVideo.play()?.catch(() => {}); }
      }).catch(() => {});
    }
  });
  adDialog?.addEventListener("click", (event) => { if (event.target === adDialog) closeAd(); });

  // Restore the established music preference and playback position.
  if (music) {
    music.addEventListener("timeupdate", () => write("musicTime", music.currentTime));
    music.addEventListener("pause", () => write("musicTime", music.currentTime));
    const savedTime = Number.parseFloat(read("musicTime", "0"));
    if (Number.isFinite(savedTime) && savedTime >= 0) {
      const restore = () => { try { music.currentTime = Number.isFinite(music.duration) ? Math.min(savedTime, music.duration) : savedTime; } catch {} };
      if (music.readyState >= 1) restore();
      else music.addEventListener("loadedmetadata", restore, { once: true });
    }
    if (musicWanted) music.play()?.catch(() => {});
    else music.pause();
  }
  document.addEventListener("visibilitychange", () => {
    if (!music) return;
    if (document.hidden || adDialog?.classList.contains("is-open") || !musicWanted) music.pause();
    else music.play()?.catch(() => {});
  });

  const theme = read("theme", "light");
  document.body.dataset.theme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  $(".quit-btn")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else window.location.href = `${base}homepage/home.html`;
  });
  $(".invite")?.addEventListener("click", async () => {
    const shareData = { title: "QuizVilla", text: "Try out this fun quiz app and earn rewards!", url: "https://ebuski100.github.io/QUIZZ-APP/" };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareData.url); notify("QuizVilla link copied to clipboard."); }
      else window.prompt("Copy your QuizVilla link:", shareData.url);
    } catch (error) { if (error?.name !== "AbortError") window.prompt("Copy your QuizVilla link:", shareData.url); }
  });
  $(".setting-icon")?.addEventListener("click", (event) => {
    event.preventDefault();
    write("lastPage", "StorePage/store.html");
    window.setTimeout(() => { window.location.href = `${base}SettingsPage/setting.html`; }, 200);
  });
  $(".profile")?.addEventListener("click", (event) => {
    event.preventDefault();
    write("editReturnPage", "StorePage/store.html");
    window.setTimeout(() => { window.location.href = `${base}EditPage/edit.html`; }, 200);
  });
  $$(".btn").forEach((button) => button.addEventListener("click", () => {
    if (read("soundState", "on") === "on" && !button.disabled) play(sound);
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (hintDialog?.classList.contains("is-open")) closeHintDialog();
      else if (adDialog?.classList.contains("is-open")) closeAd();
    }
  });
})();

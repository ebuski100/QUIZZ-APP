const isGithubPages = window.location.hostname.includes("github.io");
const base = isGithubPages ? "/QUIZZ-APP/" : "../";

const avatarItems = [...document.querySelectorAll(".avatar-item")];
const avatarTitle = document.querySelector(".avatar-title");
const loadingMessage = document.getElementById("loadingMessage");
const selectedPreview = document.getElementById("selectedPreview");
const selectionName = document.getElementById("selectionName");
const selectionHint = document.getElementById("selectionHint");
const previewRow = document.querySelector(".preview-row");
const backgroundMusic = document.getElementById("backgroundMusic");
const soundEffect = document.getElementById("soundEffect");
const quitBtn = document.querySelector(".quit-btn");

const avatarBaseUrl = "https://api.dicebear.com/6.x/adventurer/svg?";
const soundState = localStorage.getItem("soundState") || "on";
const savedMusicState = localStorage.getItem("musicState") || "paused";

function playClickSound() {
  if (soundState !== "on" || !soundEffect) return;
  soundEffect.currentTime = 0;
  const playback = soundEffect.play();
  if (playback && typeof playback.catch === "function") playback.catch(() => {});
}

function getAvatarUrl(index) {
  return `${avatarBaseUrl}seed=avatar-${index}`;
}

function selectAvatar(item, index, shouldNavigate = true) {
  const avatarUrl = getAvatarUrl(index);
  avatarItems.forEach((avatar) => {
    const selected = avatar === item;
    avatar.classList.toggle("is-selected", selected);
    avatar.setAttribute("aria-pressed", String(selected));
  });

  localStorage.setItem("profileImage", avatarUrl);
  selectedPreview.style.backgroundImage = `url("${avatarUrl}")`;
  selectedPreview.querySelector(".preview-placeholder")?.remove();
  selectionName.textContent = `Avatar ${index}`;
  selectionHint.textContent = "Your new profile look is saved.";
  previewRow.classList.add("has-selection");

  if (shouldNavigate) {
    playClickSound();
    window.setTimeout(() => {
      window.location.href = base + "EditPage/edit.html";
    }, 220);
  }
}

function loadAvatars() {
  const savedAvatar = localStorage.getItem("profileImage");
  let savedIndex = null;

  avatarItems.forEach((item, position) => {
    const index = position + 1;
    const avatarUrl = getAvatarUrl(index);
    item.style.backgroundImage = `url("${avatarUrl}")`;
    item.setAttribute("aria-pressed", "false");
    item.addEventListener("click", () => selectAvatar(item, index));
    if (savedAvatar === avatarUrl) savedIndex = index;
  });

  if (savedIndex !== null) {
    const savedItem = avatarItems[savedIndex - 1];
    selectAvatar(savedItem, savedIndex, false);
  }

  if (loadingMessage) loadingMessage.hidden = true;
}

loadAvatars();

if (backgroundMusic) {
  const savedMusicTime = Number.parseFloat(localStorage.getItem("musicTime")) || 0;
  backgroundMusic.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(savedMusicTime) && savedMusicTime > 0) {
      backgroundMusic.currentTime = Math.min(savedMusicTime, backgroundMusic.duration || savedMusicTime);
    }
  });

  const syncMusic = () => {
    if (savedMusicState === "playing" && !document.hidden) {
      const playback = backgroundMusic.play();
      if (playback && typeof playback.catch === "function") playback.catch(() => {});
    } else {
      backgroundMusic.pause();
    }
  };

  syncMusic();
  document.addEventListener("visibilitychange", syncMusic);
  backgroundMusic.addEventListener("timeupdate", () => {
    localStorage.setItem("musicTime", String(backgroundMusic.currentTime));
  });
}

quitBtn?.addEventListener("click", () => {
  playClickSound();
  window.setTimeout(() => {
    window.location.href = base + "EditPage/edit.html";
  }, 220);
});

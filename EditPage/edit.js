(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const modal = $("#myModal");
  const ageSelect = $("#Age");
  const genderSelect = $("#gender");
  const bannerBtn = $(".banner-edit-btn");
  const submitBtn = $(".submit");
  const closePicsBtn = $("#close-pics-modal");
  const backdropBtn = $("#modal-backdrop");
  const chooseAvatarBtn = $(".choose-avatar");
  const usernameInput = $(".usernameInput");
  const profileGalleryInput = $("#profileGalleryInput");
  const editQuitBtn = $(".editQuitBtn");
  const img = $("#chosen-image");
  const profileGallery = $(".profileGallery");
  const removeProfileBtn = $(".remove-profile-btn");
  const profileCameraBtn = $("#profile-camera-btn");
  const formMessage = $("#form-message");
  const backgroundMusic = $("#backgroundMusic");
  const soundEffect = $("#soundEffect");

  const isGithubPages =
    window.location.hostname.includes("github.io");
  const base = isGithubPages ? "/QUIZZ-APP/" : "../";
  const editReturnKey = "editReturnPage";
  const editPagePath = "EditPage/edit.html";
  const savedUsername = localStorage.getItem("username") || "player";
  const savedAge = localStorage.getItem("age") || "";
  const savedGender = localStorage.getItem("gender") || "";
  const defaultImage = "../images/user (5).png";

  function normalizeReturnPage(candidate) {
    if (typeof candidate !== "string" || !candidate.trim()) return null;
    let destination = candidate.trim().replace(/^\/+/, "");
    if (destination.startsWith("QUIZZ-APP/")) {
      destination = destination.slice("QUIZZ-APP/".length);
    }
    if (
      /[:\\?#]/.test(destination) ||
      destination.split("/").some((part) => !part || part === "." || part === "..") ||
      !destination.endsWith(".html") ||
      destination.toLowerCase() === editPagePath.toLowerCase()
    ) return null;
    return destination;
  }

  // `lastPage` is also used by Settings and may contain Edit itself after an
  // Avatar/Camera detour. Prefer the dedicated profile return path and reject
  // self-routes so old/stale values cannot reload this page in a loop.
  const editReturnPage =
    normalizeReturnPage(localStorage.getItem(editReturnKey)) ||
    normalizeReturnPage(localStorage.getItem("lastPage")) ||
    "homepage/home.html";
  localStorage.setItem(editReturnKey, editReturnPage);

  usernameInput.value = savedUsername;
  ageSelect.value = savedAge;
  genderSelect.value = savedGender;

  const savedImage = localStorage.getItem("profileImage");
  if (savedImage) img.src = savedImage;
  else img.src = defaultImage;

  function playClick() {
    try {
      if (localStorage.getItem("soundState") !== "off" && soundEffect) {
        soundEffect.currentTime = 0;
        const playback = soundEffect.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
      }
    } catch (_) { /* Audio or storage errors must not block navigation. */ }
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    closePicsBtn.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    bannerBtn.focus();
  }

  bannerBtn.addEventListener("click", () => {
    playClick();
    openModal();
  });
  closePicsBtn.addEventListener("click", () => {
    playClick();
    closeModal();
  });
  backdropBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open"))
      closeModal();
  });

  chooseAvatarBtn.addEventListener("click", () => {
    playClick();
    window.location.href = base + "Avatar/avatar.html";
  });

  profileCameraBtn.addEventListener("click", () => {
    playClick();
    localStorage.setItem("captureMode", "profileImage");
    localStorage.setItem("lastPage", "EditPage/edit.html");
    window.location.href = base + "photoCapture/camera.html";
  });

  profileGallery.addEventListener("click", () => {
    playClick();
    profileGalleryInput.click();
  });

  profileGalleryInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      formMessage.textContent = "Please choose a valid image file.";
      profileGalleryInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const imageData = loadEvent.target.result;
      img.src = imageData;
      try {
        localStorage.setItem("profileImage", imageData);
        formMessage.textContent = "Profile picture updated.";
      } catch (error) {
        formMessage.textContent =
          "This image is too large to save in browser storage. Try a smaller image.";
      }
      closeModal();
    };
    reader.onerror = () => {
      formMessage.textContent =
        "The selected image could not be opened.";
    };
    reader.readAsDataURL(file);
    profileGalleryInput.value = "";
  });

  removeProfileBtn.addEventListener("click", () => {
    playClick();
    localStorage.removeItem("profileImage");
    img.src = defaultImage;
    closeModal();
    formMessage.textContent = "Profile picture removed.";
  });

  function returnToPreviousPage() {
    window.location.href = base + editReturnPage;
  }
  editQuitBtn.addEventListener("click", () => {
    playClick();
    returnToPreviousPage();
  });

  $(".setting-icon")?.addEventListener("click", (event) => {
    event.preventDefault();
    playClick();
    localStorage.setItem("lastPage", "EditPage/edit.html");
    window.location.href = base + "SettingsPage/setting.html";
  });

  submitBtn.addEventListener("click", () => {
    playClick();
    const username = usernameInput.value.trim();
    if (!username) {
      formMessage.textContent =
        "Please enter a username before saving.";
      usernameInput.focus();
      return;
    }
    localStorage.setItem("age", ageSelect.value);
    localStorage.setItem("username", username);
    localStorage.setItem("gender", genderSelect.value);
    localStorage.setItem("oldUser", "true");
    formMessage.textContent = "Your profile has been saved.";
    window.setTimeout(returnToPreviousPage, 250);
  });

  const savedMusicState =
    localStorage.getItem("musicState") || "paused";
  const savedMusicTime =
    Number.parseFloat(localStorage.getItem("musicTime")) || 0;
  if (backgroundMusic) {
    backgroundMusic.addEventListener("loadedmetadata", () => {
      try {
        backgroundMusic.currentTime = savedMusicTime;
      } catch (_) {}
    });
    if (backgroundMusic.readyState >= 1) {
      try {
        backgroundMusic.currentTime = savedMusicTime;
      } catch (_) {}
    }
    const resumeMusic = () => {
      if (savedMusicState === "playing" && !document.hidden) {
        const playback = backgroundMusic.play();
        if (playback && typeof playback.catch === "function")
          playback.catch(() => {});
      } else {
        backgroundMusic.pause();
      }
    };
    resumeMusic();
    document.addEventListener("visibilitychange", resumeMusic);
    backgroundMusic.addEventListener("timeupdate", () => {
      localStorage.setItem(
        "musicTime",
        String(backgroundMusic.currentTime),
      );
    });
  }
})();

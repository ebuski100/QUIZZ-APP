(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const video = $("#video");
  const canvas = $("#canvas");
  const capturedPreview = $("#captured-image");
  const captureButton = $("#capture-button");
  const retakeButton = $("#retake-button");
  const confirmButton = $("#confirm-button");
  const cancelButton = $("#cancel-button");
  const retryButton = $("#retry-camera");
  const cameraStatus = $("#camera-status");
  const cameraError = $("#camera-error");
  const cameraFrame = $("#camera-frame");
  const cameraPlaceholder = $("#camera-placeholder");
  const modeLabel = $("#capture-mode-label");
  const music = $("#backgroundMusic");
  const sound = $("#soundEffect");

  const isGithubPages = window.location.hostname.toLowerCase().includes("github.io");
  const base = isGithubPages ? "/QUIZZ-APP/" : "../";
  const captureMode = (() => {
    try { return localStorage.getItem("captureMode"); }
    catch { return null; }
  })();
  let activeStream = null;
  let requestId = 0;
  let capturedData = "";

  function showError(message) {
    if (cameraError) { cameraError.textContent = message; cameraError.hidden = false; }
    if (cameraStatus) cameraStatus.textContent = "Camera unavailable";
    if (captureButton) captureButton.disabled = true;
    if (retryButton) retryButton.hidden = false;
    if (cameraPlaceholder) cameraPlaceholder.hidden = false;
  }
  function clearError() {
    if (cameraError) { cameraError.textContent = ""; cameraError.hidden = true; }
    if (retryButton) retryButton.hidden = true;
  }
  function stopCamera(invalidatePending = true) {
    if (invalidatePending) requestId += 1;
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      activeStream = null;
    }
    if (video) video.srcObject = null;
    if (captureButton) captureButton.disabled = true;
  }
  function returnTarget() {
    let destination = "EditPage/edit.html";
    try {
      const stored = localStorage.getItem("lastPage");
      if (typeof stored === "string" && stored.trim()) destination = stored.trim().replace(/^\/+/, "");
    } catch { /* Edit Profile is the established safe return destination. */ }
    if (/[:\\?#]/.test(destination) || destination.split("/").some((part) => !part || part === "." || part === "..")) {
      destination = "EditPage/edit.html";
    }
    if (destination.startsWith("QUIZZ-APP/")) destination = destination.slice("QUIZZ-APP/".length);
    return `${base}${destination}`;
  }
  function leavePage() {
    stopCamera();
    window.location.href = returnTarget();
  }

  if (captureMode !== "profileImage" && captureMode !== "bannerImage") {
    showError("No image type was selected. Return to Edit Profile and choose a profile photo or banner first.");
    if (retryButton) retryButton.hidden = true;
  } else {
    if (modeLabel) modeLabel.textContent = captureMode === "bannerImage" ? "PROFILE BANNER" : "PROFILE PHOTO";
    if (cameraFrame && captureMode === "bannerImage") cameraFrame.classList.add("banner-mode");
  }

  async function startCamera() {
    if (captureMode !== "profileImage" && captureMode !== "bannerImage") return;
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      showError("This browser cannot access a camera here. Open QuizVilla using HTTPS or localhost, then try again.");
      return;
    }
    stopCamera(false);
    const currentRequest = ++requestId;
    clearError();
    if (cameraStatus) cameraStatus.textContent = "Requesting camera access…";
    if (cameraPlaceholder) cameraPlaceholder.hidden = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" } }, audio: false });
      if (currentRequest !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      activeStream = stream;
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      if (currentRequest !== requestId) return;
      if (video.readyState >= 2 && video.videoWidth > 0) enableCapture();
      else if (cameraStatus) cameraStatus.textContent = "Camera connected. Finding the picture…";
    } catch (error) {
      stopCamera(false);
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        showError("Camera permission was denied. Allow camera access in your browser settings and try again.");
      } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        showError("No camera was found on this device. Connect a camera or choose another profile picture option.");
      } else if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
        showError("Your camera is already in use by another app. Close it there and try again.");
      } else if (error?.name === "OverconstrainedError") {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (currentRequest !== requestId) { fallbackStream.getTracks().forEach((track) => track.stop()); return; }
          activeStream = fallbackStream;
          video.srcObject = fallbackStream;
          await video.play();
          if (video.readyState >= 2 && video.videoWidth > 0) enableCapture();
        } catch { showError("QuizVilla could not start a camera with the available settings. Try again or use another picture option."); }
      } else {
        showError("QuizVilla could not start your camera. Check that it is connected and try again.");
      }
    }
  }
  function enableCapture() {
    clearError();
    if (captureButton) captureButton.disabled = false;
    if (cameraStatus) cameraStatus.textContent = "Camera ready. Center yourself in the frame.";
    if (cameraPlaceholder) cameraPlaceholder.hidden = true;
  }

  video?.addEventListener("loadeddata", () => {
    if (activeStream && video.videoWidth > 0 && capturedData === "") enableCapture();
  });
  captureButton?.addEventListener("click", () => {
    if (!activeStream || !video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      showError("The camera is not ready yet. Wait for the preview, then try again.");
      return;
    }
    try {
      const context = canvas?.getContext("2d");
      if (!context || !canvas) throw new Error("Canvas is unavailable");
      if (captureMode === "bannerImage") { canvas.width = 800; canvas.height = 400; }
      else { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedData = canvas.toDataURL("image/png");
      if (!capturedData.startsWith("data:image/png")) throw new Error("Image could not be created");
      capturedPreview.src = capturedData;
      capturedPreview.hidden = false;
      video.hidden = true;
      stopCamera();
      if (captureButton) captureButton.hidden = true;
      if (retakeButton) retakeButton.hidden = false;
      if (confirmButton) confirmButton.hidden = false;
      if (cameraStatus) cameraStatus.textContent = "Photo captured. Retake it or use this photo.";
      clearError();
    } catch (error) {
      console.error("Could not capture photo:", error);
      showError("The photo could not be captured. Please try again.");
    }
  });
  retakeButton?.addEventListener("click", () => {
    capturedData = "";
    if (capturedPreview) { capturedPreview.removeAttribute("src"); capturedPreview.hidden = true; }
    if (video) video.hidden = false;
    if (captureButton) captureButton.hidden = false;
    if (retakeButton) retakeButton.hidden = true;
    if (confirmButton) confirmButton.hidden = true;
    startCamera();
  });
  confirmButton?.addEventListener("click", () => {
    if (!capturedData || !["profileImage", "bannerImage"].includes(captureMode)) {
      showError("Take a photo before saving it.");
      return;
    }
    const storageKey = captureMode;
    try {
      if (!window.localStorage) throw new Error("Storage is unavailable");
      localStorage.setItem(storageKey, capturedData);
    } catch (error) {
      console.error("Could not save the captured photo:", error);
      if (cameraStatus) cameraStatus.textContent = "Photo could not be saved.";
      if (cameraError) { cameraError.textContent = "Browser storage may be full or unavailable. Retake a smaller photo or free storage space, then try again."; cameraError.hidden = false; }
      return;
    }
    stopCamera();
    if (cameraStatus) cameraStatus.textContent = "Photo saved. Returning to your profile…";
    window.setTimeout(() => { window.location.href = returnTarget(); }, 180);
  });
  cancelButton?.addEventListener("click", leavePage);
  retryButton?.addEventListener("click", startCamera);
  window.addEventListener("pagehide", () => stopCamera());
  window.addEventListener("beforeunload", () => stopCamera());

  // Preserve the app-wide music and click-sound preferences.
  const readStorage = (key, fallback = null) => {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  };
  const writeStorage = (key, value) => { try { localStorage.setItem(key, String(value)); } catch {} };
  let musicWanted = readStorage("musicState", "paused") === "playing";
  if (music) {
    const savedTime = Number.parseFloat(readStorage("musicTime", "0"));
    const restoreTime = () => {
      if (Number.isFinite(savedTime) && savedTime >= 0) {
        try { music.currentTime = Number.isFinite(music.duration) ? Math.min(savedTime, music.duration) : savedTime; } catch {}
      }
    };
    if (music.readyState >= 1) restoreTime();
    else music.addEventListener("loadedmetadata", restoreTime, { once: true });
    music.addEventListener("timeupdate", () => writeStorage("musicTime", music.currentTime));
    music.addEventListener("pause", () => writeStorage("musicTime", music.currentTime));
    const syncMusic = () => {
      if (musicWanted && !document.hidden) music.play()?.catch(() => {});
      else music.pause();
    };
    syncMusic();
    document.addEventListener("visibilitychange", syncMusic);
  }
  document.querySelectorAll(".btn").forEach((button) => button.addEventListener("click", () => {
    if (readStorage("soundState", "on") !== "off" && !button.disabled) {
      try { sound.currentTime = 0; sound.play()?.catch(() => {}); } catch {}
    }
  }));

  if (captureMode === "profileImage" || captureMode === "bannerImage") startCamera();
})();

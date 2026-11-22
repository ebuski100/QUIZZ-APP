const registerForm = document.getElementById("registerForm");
const usernameInput = document.getElementById("username");
const ageInput = document.getElementById("age");
const quitBtn = document.querySelector(".notInterested");
const soundEffect = document.getElementById("soundEffect");

const isGithubPages = window.location.hostname.includes("github.io");
const base = isGithubPages ? "/QUIZZ-APP/" : "../";

function playButtonSound() {
  const soundState = localStorage.getItem("soundState") || "on";

  if (soundState !== "on" || !soundEffect) return;

  soundEffect.currentTime = 0;
  const playback = soundEffect.play();

  // Browsers may block audio until the user has interacted with the page.
  if (playback && typeof playback.catch === "function") {
    playback.catch(() => {});
  }
}

document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", playButtonSound);
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const age = ageInput.value;

  if (!username || !age) {
    registerForm.reportValidity();
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("age", age);
  localStorage.setItem("showWelcome", "true");

  window.location.href = `${base}homepage/home.html`;
});

quitBtn.addEventListener("click", () => {
  window.location.href = "https://www.google.com";
});

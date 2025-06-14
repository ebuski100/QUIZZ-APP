const isGithubPages = window.location.hostname.includes("github.io");
const base = isGithubPages ? "/QUIZZ-APP/" : "../";
const avatarItems = document.querySelectorAll(".avatar-item");

const baseUrl = "https://api.dicebear.com/6.x/adventurer/svg?";

async function loadAvatars() {
  try {
    const testUrl = `${baseUrl}seed=test-avatar`;
    const response = await fetch(testUrl);

    if (!response.ok) {
      throw new Error(`Failed to load avatars. Status: ${response.status}`);
    }

    avatarItems.forEach((avatarItem, index) => {
      const avatarUrl = `${baseUrl}seed=avatar-${index + 1}`;
      avatarItem.style.backgroundImage = `url(${avatarUrl})`;
      avatarItem.style.backgroundSize = "cover";
      avatarItem.style.backgroundPosition = "center";
      avatarItem.style.backgroundRepeat = "no-repeat";

      avatarItem.addEventListener("click", () => {
        localStorage.setItem("profileImage", avatarUrl);
      });
    });
  } catch (error) {
    console.error("Error loading avatars:", error);

    // Disable avatar items if the API fails to load
    avatarItems.forEach((avatarItem) => {
      avatarItem.style.pointerEvents = "none";
      avatarItem.style.backgroundColor = "grey";
    });

    // Optionally, display an error message
    const avatarTitle = document.querySelector(".avatar-title");
    if (avatarTitle) {
      avatarTitle.textContent = "Failed to load avatars.";
      avatarTitle.style.color = "red";
    }
  }
}

// Call the function to load avatars
loadAvatars();
const savedTheme = localStorage.getItem("theme") || "light";
const avatarTitle = document.querySelector(".avatar-title");
if (savedTheme === "dark") {
  avatarTitle.classList.add("avatar-title-color");
  document.body.classList.add("dark");
}

const savedMusicState = localStorage.getItem("musicState") || "paused";

if (savedMusicState === "playing") {
  backgroundMusic.play();
} else {
  backgroundMusic.pause();
}

document.addEventListener("visibilitychange", () => {
  if (savedMusicState === "playing") {
    if (document.hidden) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play();
    }
  } else {
    backgroundMusic.pause();
  }
});
const savedMusicTime = parseFloat(sessionStorage.getItem("musicTime")) || 0;
backgroundMusic.currentTime = savedMusicTime;
backgroundMusic.addEventListener("timeupdate", () => {
  sessionStorage.setItem("musicTime", backgroundMusic.currentTime);
});
// const savedMusicTime = parseFloat(localStorage.getItem("musicTime")) || 0;
// backgroundMusic.currentTime = savedMusicTime;
// backgroundMusic.addEventListener("timeupdate", () => {
//   localStorage.setItem("musicTime", backgroundMusic.currentTime);
// });

const soundEffect = document.getElementById("soundEffect");

let soundState = localStorage.getItem("soundState") || "on";
const quitBtn = document.querySelector(".quit-btn");

quitBtn.addEventListener("click", () => {
  console.log(soundState);
  if (soundState === "on") {
    soundEffect.currentTime = 0;
    soundEffect.play();
  }
  setTimeout(() => {
    window.location.href = base + "EditPage/edit.html";
  }, 200);
});

avatarItems.forEach((avatarItem) => {
  avatarItem.addEventListener("click", () => {
    if (soundState === "on") {
      soundEffect.currentTime = 0; // Reset sound to the beginning
      soundEffect.play(); // Play the sound effect
    }
    setTimeout(() => {
      window.location.href = base + "EditPage/edit.html";
    }, 200);
  });
});

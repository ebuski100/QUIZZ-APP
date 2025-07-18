const dailyFacts = document.querySelector(".facts");

const backgroundMusic = document.getElementById("backgroundMusic");

const soundEffect = document.getElementById("soundEffect");
const shareBtn = document.querySelector(".homeInvite");
const key = "bd2DHoYWEBZI3SRst11pdQ==AKpB7FjAFnNsNFiU";
const oldUser = localStorage.getItem("oldUser");
const userWelcomeMsg = document.querySelector(".userWelcomeMsg");
const savedUsername = localStorage.getItem("username") || "Player";
const url = `https://api.api-ninjas.com/v1/facts`;
const isGithubPages = window.location.hostname.includes("github.io");
const base = isGithubPages ? "/QUIZZ-APP/" : "../";
const savedMusicState = localStorage.getItem("musicState") || "paused";

const buttons = document.querySelectorAll(".btn");
let soundState = localStorage.getItem("soundState") || "on";

if (localStorage.getItem("showWelcome") === "true") {
  if (!oldUser) {
    setTimeout(() => {
      userWelcomeMsg.classList.add("fly-in");
    }, 500);
    userWelcomeMsg.textContent = `Welcome ${savedUsername} 🖐🏼`;
  } else {
    setTimeout(() => {
      userWelcomeMsg.classList.add("fly-in");
    }, 500);
    userWelcomeMsg.textContent = `Welcome Back ${savedUsername} 🖐🏼`;
  }
  localStorage.removeItem("showWelcome");
} else {
  userWelcomeMsg.textContent = "";
}

shareBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  const shareData = {
    title: "Villa Quiz Game",
    text: "Try out this fun quiz app and earn rewards!",
    url: "https://ebuski100.github.io/QUIZZ-APP/",
  };

  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => console.log("App shared successfully!"))
      .catch((error) => console.log("Error sharing:", error));
  } else {
    // Fallback: copy link to clipboard
    navigator.clipboard.writeText(shareData.url).then(() => {
      alert("Quiz app link copied to clipboard! Share it with your friends.");
    });
  }
});

const reqOptions = {
  method: "GET",
  headers: {
    "X-Api-Key": key,
  },
};

fetch(url, reqOptions)
  .then((res) => {
    console.log("Response Status:", res.status);

    return res.text().then((text) => {
      console.log("Response Body:", text);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return JSON.parse(text);
    });
  })
  .then((data) => {
    console.log("Response Data:", data);
    if (data && data.length > 0) {
      const currentDate = new Date().toDateString();
      const lastFetchDate = localStorage.getItem("lastFetchDate");

      if (!lastFetchDate || currentDate !== lastFetchDate) {
        const newFact = data[0].fact; //
        localStorage.setItem("dailyFact", newFact);
        localStorage.setItem("lastFetchDate", currentDate);
        dailyFacts.textContent = newFact;
      } else {
        dailyFacts.textContent =
          localStorage.getItem("dailyFact") || "No facts available.";
      }
    } else {
      dailyFacts.textContent = "No facts available.";
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    dailyFacts.textContent = "Failed to load facts.";
  });

const exitBtn = document.querySelector(".exit");
const yes = document.querySelector(".yes");
const No = document.querySelector(".No");
const closeModal = document.querySelector(".close-modal");
const modalFooter = document.querySelector(".modal-footer");
const exitModal = document.querySelector(".exit-modal");
const playBtn = document.querySelector(".play");

const footerIcons = document.querySelectorAll(".tooltip-box");

playBtn.addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = base + "Quizpage/quiz.html";
  }, 200);
});
exitBtn.addEventListener("click", () => {
  exitModal.style.display = "block";
});
closeModal.addEventListener("click", () => {
  exitModal.style.display = "none";
});

modalFooter.addEventListener("click", () => {
  exitModal.style.display = "none";
});

No.addEventListener("click", () => {
  exitModal.style.display = "none";
});

yes.addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = "https://www.google.com";
  }, 200);
});

footerIcons.forEach((footerIcon) => {
  footerIcon.addEventListener("click", () => {
    setTimeout(() => {
      if (footerIcon.classList.contains("home")) {
        window.location.href = base + "homepage/home.html";
      } else if (footerIcon.classList.contains("profile")) {
        window.location.href = base + "EditPage/edit.html";
      } else if (footerIcon.classList.contains("setting-icon")) {
        const lastPage = "homepage/home.html";
        localStorage.setItem("lastPage", lastPage);
        window.location.href = base + "SettingsPage/setting.html";
      } else {
        window.location.href = base + "StorePage/store.html";
      }
    }, 200);
  });
});
const savedTheme = localStorage.getItem("theme") || "light";
const homeBody = document.querySelector(".container");

if (savedTheme === "dark") {
  homeBody.classList.add("dark");
}

if (savedMusicState === "playing") {
  backgroundMusic.play();
} else {
  backgroundMusic.pause();
}
// const gameLogo = document.querySelector(".game-logo-img");
// gameLogo.addEventListener("click", () => {
//   localStorage.removeItem("musicTime");
// });
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

const savedMusicTime = parseFloat(localStorage.getItem("musicTime")) || 0;
backgroundMusic.currentTime = savedMusicTime;
backgroundMusic.addEventListener("timeupdate", () => {
  localStorage.setItem("musicTime", backgroundMusic.currentTime);
});

buttons.forEach((button) => {
  console.log(soundState);
  button.addEventListener("click", () => {
    if (soundState === "on") {
      soundEffect.currentTime = 0; // Reset sound to the beginning
      soundEffect.play(); // Play the sound effect
    }
  });
});
console.log(buttons);

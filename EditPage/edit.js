const modal = document.getElementById("myModal");

const ageSelect = document.getElementById("Age");
const lastPage = localStorage.getItem("lastPage");
const bannerBtn = document.querySelector(".banner-edit-btn");
const submitBtn = document.querySelector(".button-cont");
// const profileBtn = document.querySelector(".edit-img-btn");
// console.log(profileBtn);
const closePicsBtn = document.getElementById("close-pics-modal");

const chooseAvatarBtn = document.querySelector(".choose-avatar");
const modalFooter = document.querySelector(".modal-footer");
const usernameInput = document.querySelector(".usernameInput");
const savedUsername = localStorage.getItem("username") || "player";
const savedAge = localStorage.getItem("age");
const profileGalleryInput = document.getElementById("profileGalleryInput");
const editQuitBtn = document.querySelector(".editQuitBtn");

const profile_Image = document.querySelector(".image-avatar");

const img = document.getElementById("chosen-image");

const profileGallery = document.querySelector(".profileGallery");

const removeProfileBtn = document.querySelector(".remove-profile-btn");

const oldUser = localStorage.getItem("oldUser");
const profileCameraBtn = document.getElementById("profile-camera-btn");

const isGithubPages = window.location.hostname.includes("github.io");
const base = isGithubPages ? "/QUIZZ-APP/" : "../";

profileCameraBtn.addEventListener("click", () => {
  localStorage.setItem("captureMode", "profileImage");
  setTimeout(() => {
    window.location.href = base + "photoCapture/camera.html";
  }, 200);
});

removeProfileBtn.addEventListener("click", () => {
  localStorage.removeItem("profileImage");
  img.src = "../images/user (5).png";
  modal.style.display = "none";
});

editQuitBtn.addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = base + lastPage;
  }, 200);
});
if (usernameInput) {
  usernameInput.value = savedUsername;
}

if (Age) {
  ageSelect.value = savedAge;
}

modalFooter.addEventListener("click", () => {
  modal.style.display = "none";
});

bannerBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

closePicsBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

profileGallery.addEventListener("click", () => {
  profileGalleryInput.click();
});

const image = localStorage.getItem("profileImage");
if (image) {
  img.src = image;
}

chooseAvatarBtn.addEventListener("click", () => {
  setTimeout(() => {
    window.location.href = base + "Avatar/avatar.html";
  }, 200);
});
submitBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  const selectedAge = ageSelect.value;

  localStorage.setItem("age", selectedAge);
  localStorage.setItem("username", username);
  localStorage.setItem("oldUser", "true");
  setTimeout(() => {
    window.location.href = base + lastPage;
  }, 200);
});

profileGalleryInput.addEventListener("change", (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      img.src = imageData;
      localStorage.setItem("profileImage", imageData);
    };
    modal.style.display = "none";
    reader.readAsDataURL(files[0]);
  }
});

const savedTheme = localStorage.getItem("theme") || "light";
const editContainer = document.querySelector(".edit-container");
if (savedTheme === "dark") {
  editContainer.classList.add("dark");
  document.body.classList.add("bodyColor");
}

const savedMusicState = localStorage.getItem("musicState") || "playing";

if (savedMusicState === "playing") {
  backgroundMusic.play();
} else {
  backgroundMusic.pause();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    backgroundMusic.pause();
  } else {
    backgroundMusic.play();
  }
});
const savedMusicTime = parseFloat(localStorage.getItem("musicTime")) || 0;
backgroundMusic.currentTime = savedMusicTime;
backgroundMusic.addEventListener("timeupdate", () => {
  localStorage.setItem("musicTime", backgroundMusic.currentTime);
});
const buttons = document.querySelectorAll(".btn");
let soundState = localStorage.getItem("soundState") || "on";

const soundEffect = document.getElementById("soundEffect");
buttons.forEach((button) => {
  console.log(soundState);
  button.addEventListener("click", () => {
    if (soundState === "on") {
      soundEffect.currentTime = 0;
      soundEffect.play();
    }
  });
});

const videoContainer = document.getElementById("videoContainer");
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteIcon = muteBtn.querySelector("i");
const time = document.getElementById("time");
const volume = document.getElementById("volume");
const timeLine = document.getElementById("timeLine");
const fullScreen = document.getElementById("fullScreen");
const fullScreenIcon = fullScreen.querySelector("i");
const controlls = document.getElementById("controlls");
const textarea = document.getElementById("textarea");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");

let controlsMoveTimeOut = null;

let videoVolume = 0.5;
video.volume = videoVolume;

const handlePlay = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
  volume.value = video.muted ? 0 : videoVolume;
};

const handleChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteIcon.classList = "fas fa-volume-up";
  }
  videoVolume = value;
  video.volume = value;
};

const formatTime = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(11, 19);
};
const handleLoadedMetData = () => {
  handlePlay();
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeLine.max = Math.floor(video.duration);
};
handleLoadedMetData();
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeLine.value = Math.floor(video.currentTime);
};
const handleTimeLineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScrean = () => {
  const fullScreenElm = document.fullscreenElement;

  if (fullScreenElm) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControlls = () => {
  controlls.classList.remove("showing");
};

const handleMouseMove = () => {
  if (controlsMoveTimeOut) {
    clearTimeout(controlsMoveTimeOut);
    controlsMoveTimeOut = null;
  }
  controlls.classList.add("showing");
  controlsMoveTimeOut = setTimeout(hideControlls, 3000);
};

const handleMousedown = () => {
  handlePlay();
};

const handleKeydown = (event) => {
  const key = event.code;
  if (key === "Space" && event.target.id !== "textarea") {
    event.preventDefault();
    handlePlay();
    handleMouseMove();
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
fullScreen.addEventListener("click", handleFullScrean);
volume.addEventListener("input", handleChange);
timeLine.addEventListener("input", handleTimeLineChange);
video.addEventListener("canplay", handleLoadedMetData);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mousedown", handleMousedown);
video.addEventListener("ended", handleEnded);
controlls.addEventListener("mousemove", handleMouseMove);
window.addEventListener("keydown", handleKeydown);

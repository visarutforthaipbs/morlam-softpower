document.addEventListener("DOMContentLoaded", () => {
  const playButtons = document.querySelectorAll(".playButton");

  playButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const audioId = this.getAttribute("data-audio");
      const audio = document.getElementById(audioId);
      if (audio.paused) {
        audio.play();
        this.textContent = "หยุด";
      } else {
        audio.pause();
        this.textContent = "เล่น";
      }
    });
  });
});

//add sound in section 1
var sections = document.querySelectorAll(".observe-section");
var audio = document.getElementById("section-audio");

var observer2 = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0; // Optional: reset audio to start
    }
  });
});

sections.forEach((section) => {
  observer2.observe(section);
});

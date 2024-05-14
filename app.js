//add responsive hidden
const observer1 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry);
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});
const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer1.observe(el));

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

// d3 chart//
const spec = "bar.vg.json";
vegaEmbed("#vis", spec)
  // result.view provides access to the Vega View API
  .then((result) => console.log(result))
  .catch(console.warn);

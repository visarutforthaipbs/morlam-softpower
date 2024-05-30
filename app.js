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

//popup//
// Get all images that trigger modals
var imgs = document.querySelectorAll(".myImg");

// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the elements inside the modal
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
var modalHeader = document.getElementById("modalHeader");

// Add an onclick event to each image
imgs.forEach(function (img) {
  img.onclick = function () {
    modal.style.display = "block";
    modalImg.src = this.src;
    captionText.innerHTML = this.alt;
    modalHeader.innerHTML = this.dataset.header; // Use the data-header attribute of the clicked image
  };
});

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// Add animation
var targetSection = document.getElementById("targetSection");
var transformElement = document.getElementById("transformElement");

var observer = new IntersectionObserver(function (entries) {
  // If the target section is no longer intersecting with the viewport, move the image off the screen
  if (!entries[0].isIntersecting) {
    transformElement.style.transform = "translateX(-100%)";
  }
  // If the target section is partially or fully in view, move the image onto the screen
  else {
    transformElement.style.transform = "translateX(0)";
  }
});

// Start observing the target section
observer.observe(targetSection);

// Initialize ScrollMagic controller
var controller = new ScrollMagic.Controller();

// Create a scene
var scene = new ScrollMagic.Scene({
  triggerElement: "#trigger", // Element that triggers the animation
  triggerHook: 0.5, // Trigger the animation at the middle of the viewport
  duration: "100%", // Duration of the scene
})
  .setClassToggle("#animate", "fade-in") // Add or remove class to trigger animation
  .addTo(controller); // Add the scene to the controller

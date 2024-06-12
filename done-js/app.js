// Add responsive hidden
const observer1 = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer1.observe(el));

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

const observer1 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry) 
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});
const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer1.observe(el)); 

//add sound in section 1
var sections = document.querySelectorAll('.observe-section');
var audio = document.getElementById('section-audio');

var observer2 = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            audio.play();
        } else {
            audio.pause();
            audio.currentTime = 0; // Optional: reset audio to start
        }
    });
});

sections.forEach(section => {
    observer2.observe(section);
});

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal
var img = document.getElementById("myImg");
var modalImg = document.getElementById("img01");
var modalTitle = document.getElementById("modalTitle");
var modalText = document.getElementById("modalText");
img.onclick = function(){
  modal.style.display = "block";
  modalTitle.innerHTML = "กลุ่มแม่ยกหน้าเวทีกลุ่มแม่ยกหน้าเวที "; // Replace with your title
  modalText.innerHTML = "ส่วนใหญ่เป็นเพศหญิงหรือเพศที่ 3 มีอายุ 40-65 ปี ส่วนใหญ่ยังอยู่ในวัยทำงานหรือทำธุรกิจส่วนตัว บางส่วนเกษียณอายุแล้ว ในด้านฐานะทางการเงินไม่มีภาระค่าใช้จ่ายมากนัก ลูกหลานสามารถดูแลตัวเองได้แล้ว หรือลูกหลานสามารถให้การสนับสนุนเรื่องทุนทรัพย์ในการมาดูหมอลำได้ แม่ยกหมอลำมีการรวมกลุ่มกันเวลามาชมหมอลำ มักจะมาหาศิลปินหลังเวที โดยนำอาหารหรือของฝากมาให้ศิลปิน มีการให้มาลัยกับศิลปินหรือบางครั้งมีการ รวบรวมเงินเพื่อให้ได้มาลัยพวงใหญ่ และคล้องมาลัยศิลปินในนามของกลุ่มแม่ยก ในส่วนของความชื่นชอบการแสดงของหมอลำนั้นกลุ่มแม่ยกชอบดูลำเรื่องต่อกลอนและช่วงคอนเสิร์ต โดยจะชอบฉากหรือเพลงที่ศิลปินที่ตนเองชื่นชอบแสดงมากเป็นพิเศษ  "; // Replace with your text
}

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() { 
  modal.style.display = "none";
}
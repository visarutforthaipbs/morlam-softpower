<script>
  import { onMount } from 'svelte';

  let ambientAudio;
  let isIntersecting = false;

  onMount(() => {
    // Ambient sound intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isIntersecting = true;
          ambientAudio?.play().catch(() => {
            console.log("Ambient autoplay blocked. Waiting for user interaction...");
            const playAmbientOnInteraction = () => {
              ambientAudio?.play().catch((e) => console.log(e));
              document.removeEventListener("click", playAmbientOnInteraction);
            };
            document.addEventListener("click", playAmbientOnInteraction);
          });
        } else {
          isIntersecting = false;
          if (ambientAudio) {
            ambientAudio.pause();
            ambientAudio.currentTime = 0;
          }
        }
      });
    }, { threshold: 0.1 });

    const observerTarget = document.getElementById("section-audio-container");
    if (observerTarget) observer.observe(observerTarget);

    return () => {
      observer.disconnect();
    };
  });

  // Public method to stop ambient audio (called from parent when card audio plays)
  export function pauseAmbient() {
    if (ambientAudio) {
      ambientAudio.pause();
    }
  }
</script>

<!--ชื่อเรื่อง-->
<section class="background-cover">
  <div class="container-money">
    <div class="loader">
      {#each Array(23) as _}
        <span></span>
      {/each}
    </div>
  </div>
  <div class="wrapper">
    <div class="first-title">
      <h1 class="section0">จักรวาลหมอลำ —<br>ขุมพลังทางเศรษฐกิจจากภาคอีสาน</h1>
      <h2 class="ph" id="ph-1">
        6,615 ล้านบาท คือผลกระทบทางเศรษฐกิจที่เกิดขึ้นต่อปีจากการแสดงหมอลำและการจ้างงานอีกกว่า 38,835 คน
        <br />ทำให้หมอลำกลายเป็นหนึ่งในขุมพลังทางเศรษฐกิจของภูมิภาคอีสาน ที่ควรได้รับการผลักดันในยุคที่วัฒนธรรมกลายเป็นอำนาจ
      </h2>
      <!--credit-->
      <div class="title-credit">
        <p class="credit-text">
          เรื่องโดย
          <a href="https://localsthaipbs.net/" target="_blank" rel="noreferrer">
            เครือข่ายสื่อสาธารณะท้องถิ่น (Local PBS)
          </a>
          <br />
          เว็ปไซต์และกราฟฟิก
          <a href="https://visarutforthaipbs.github.io/piwebsit2024/" target="_blank" rel="noreferrer">
            โครงการห้องทดลองปัญญารวมหมู่
          </a>
        </p>
      </div>

      <!--molum pic-->
      <div class="morlum-pic">
        <img src="/asset/new-ci/Asset 18pi-logo-blue.png" class="wiggling-image" alt="หมอลำ" />

        <!--music animation-->
        <div class="section-flow-2">
          <dotlottie-player src="https://lottie.host/94bdb57f-8d3e-40f2-bb2d-f4fe7718deb3/Pup4GdSQ7D.json"
            background="transparent" speed="1" style="width: 300px; height: 300px;" loop autoplay></dotlottie-player>
        </div>
      </div>

      <div id="section-audio-container" class="section-flow-1 observe-section">
        <audio bind:this={ambientAudio} id="section-audio" src="/sound/หมอลำซิ่ง.mp4" preload="none"></audio>
      </div>
    </div>

    <!--can and pin-->
    <div class="morlum-pic-1">
      <img src="/asset/new-ci/new-pin.svg" id='khean-1' class="wiggling-image-2" alt="khean" />
    </div>
    <div class="morlum-pic-2">
      <img src="/asset/new-ci/new-can.svg" id='khean-2' class="wiggling-image-2" alt="pin" />
    </div>
  </div>
</section>

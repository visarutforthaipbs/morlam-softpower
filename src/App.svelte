<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import Hero from './components/Hero.svelte';
  import AudioShowcase from './components/AudioShowcase.svelte';
  import Timeline from './components/Timeline.svelte';
  import AudienceProfiles from './components/AudienceProfiles.svelte';
  import Treemap from './components/Treemap.svelte';
  import BubbleMap from './components/BubbleMap.svelte';
  import CulturalMap from './components/CulturalMap.svelte';
  import SoftpowerGraph from './components/SoftpowerGraph.svelte';
  import ScrollProgress from './components/ScrollProgress.svelte';
  import { scrolly, inview } from './lib/scrolly.js';

  let heroComponent;

  // Active scroll step per scrollytelling section (drives each visualization).
  let treemapStep = 0;
  let bubbleStep = 0;
  let culturalStep = 0;
  let softpowerStep = 0;

  // Lazy-mount flags so heavy viz (Leaflet, remote topojson) load just-in-time.
  let treemapReady = false;
  let bubbleReady = false;
  let culturalReady = false;
  let softpowerReady = false;

  function handlePlayTrack() {
    if (heroComponent) {
      heroComponent.pauseAmbient();
    }
  }

  onMount(() => {
    // Scroll reveal observer for elements with .hidden class
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  });
</script>

<Header />
<ScrollProgress />

<main>
  <Hero bind:this={heroComponent} />

  <!--section 1 เปิดเรื่อง -->
  <section class="hidden">
    <div class="wrapper">
      <h2 class="setion1quote">
        “ขยับสบัดฟ้อน ลายแคนซ้อนอ้อนแคนซิ่ง”
      </h2>
      <div class="basic-grid">
        <div>
          <p>
            ถ้าคุณเป็นหนึ่งคนที่อาศัยอยู่ในต่างจังหวัด หรือแม้แต่ในกรุงเทพฯ
            เองก็ตาม คุณคงไม่มีทางที่จะปฏิเสธได้เลยว่า ไม่รู้จัก หรือไม่เคยเห็น
            ผ่านตาเลยกับสิ่งที่เป็นความบันเทิงที่เรียกว่า หมอลำ
            การดึงดูดผู้คนหลักหมื่นคนให้สามารถมาออกันอยู่หน้าเวทีตั้งแต่ช่วงหัวค่ำจนไปถึงเช้าของอีกวัน
            ภายใต้การขยับร่างกายไปตามเสียงแคน ลายพิณ
            ที่เป็นเอกลักษณ์และลีลาการร้องการนำเสนอของศิลปิน
            คงเป็นภาพที่เป็นเครื่องยืนยันความนิยมของหมอลำในสังคมไทยได้เป็นอย่างดี
          </p>
        </div>
        <div>
          <p>
            ความสว่างไสวของเวทีขนาดใหญ่ ความสวยงามของชุดหางเครื่องที่ระยิบระยับล้อไปกับแสงไฟ
            และเสียงร้องที่เป็นเอกลักษณ์
            หมอลำไม่ได้เป็นเพียงแค่ความบันเทิงในยามค่ำคืนของคนอีสานเท่านั้น
            หากแต่ภายใต้สิ่งเหล่านั้นยังมีระบบเศรษฐกิจขนาดใหญ่ที่ซ่อนอยู่เบื้องหลัง
            ซึ่งสร้างงาน สร้างรายได้
            และขับเคลื่อนอุตสาหกรรมสร้างสรรค์ของภูมิภาคและของประเทศอย่างมหาศาล
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Audio showcase -->
  <AudioShowcase on:playtrack={handlePlayTrack} />

  <!-- Section 3: Timeline -->
  <Timeline />

  <!-- Section 4: Audience Segmentation -->
  <AudienceProfiles />

  <!-- Section 5: Treemap Economic Value -->
  <section class="hidden scrolly-section" use:inview={() => (treemapReady = true)}>
    <div class="scrolly-wrapper" use:scrolly={{ onStep: (i) => (treemapStep = i) }}>
      <div class="scrolly-text-column">
        <h2 class="setion1quote" style="margin-top: 0; font-size: 2.2rem; margin-bottom: 2rem;">ขุมพลังมูลค่าทางเศรษฐกิจ</h2>
        <div class="scrolly-step">
          <p>
            จะเห็นได้ว่าคนดูหมอลำนั้นมีอยู่หลากหลายกลุ่ม และแต่ละกลุ่มมีการใช้จ่ายที่แตกต่างกันออกไป ตั้งแต่ 150 - 1,000 บาทต่อการมาดูหมอลำ 1 ครั้ง
            ซึ่งนี่คงพอจะทำให้เห็นมูลค่าทางเศรษฐกิจบางส่วนที่สามารถเกิดขึ้นมาได้จากอุตสาหกรรมหมอลำ
          </p>
        </div>
        <div class="scrolly-step">
          <p>
            แต่แน่นอนว่าภายใต้การดูหมอลำนั้นไม่ได้มีเฉพาะมูลค่าทางเศรษฐกิจที่มาจากผู้ชมเท่านั้น แต่ยังรวมไปถึงในส่วนอื่นๆ ที่สามารถแบ่งออกได้เป็นอย่างน้อย 3 ประเภท:
          </p>
          <ol style="margin-left: 20px; color: var(--text-secondary); line-height: 1.8; font-family: var(--font-body); font-size: 0.95rem;">
            <li style="margin-bottom: 8px;">มูลค่าทางเศรษฐกิจที่มาจากค่าใช้จ่ายในการเข้าชมหมอลำ</li>
            <li style="margin-bottom: 8px;">มูลค่าทางเศรษฐกิจที่มาจากผู้จัดงานหรือผู้ว่าจ้าง</li>
            <li style="margin-bottom: 8px;">มูลค่าทางเศรษฐกิจที่มาจากคณะหมอลำ</li>
          </ol>
        </div>
        <div class="scrolly-step">
          <p>
            และสำหรับมูลค่าทางเศรษฐกิจที่เกิดขึ้นมาจากวงการหมอลำนั้น ก็ไม่ได้เพียงแค่กระจายอยู่ในอุตสาหกรรมหมอลำเท่านั้น แต่ยังได้กระจายอยู่อุตสาหกรรมอื่นๆ ในรูปของผลกระทบทางเศรษฐกิจอีกกว่า 19 สาขา ซึ่งรวมผลกระทบทางเศรษฐกิจทั้งหมดแล้วจะมีมูลค่ากว่า 6,615 ล้านบาท
          </p>
        </div>
      </div>
      <div class="scrolly-viz-column">
        {#if treemapReady}<Treemap activeStep={treemapStep} />{/if}
      </div>
    </div>
  </section>

  <!-- Section 6: Bubble Map Foreign Audience -->
  <section class="hidden scrolly-section" use:inview={() => (bubbleReady = true)}>
    <div class="scrolly-wrapper" use:scrolly={{ onStep: (i) => (bubbleStep = i) }}>
      <div class="scrolly-text-column">
        <h2 class="setion1quote" style="margin-top: 0; font-size: 2.2rem; margin-bottom: 2rem;">ศักยภาพในต่างประเทศ</h2>
        <div class="scrolly-step">
          <p>
            ในปัจจุบันคณะหมอลำมีพื้นที่การแสดงอยู่ในหลายจังหวัดที่มีชาวอีสานอาศัยและทำงานอยู่ อย่างเช่น ในจังหวัดระยอง และชลบุรี ซึ่งนั่นเท่ากับว่าบริเวณใดที่มีคนอีสานอยู่จำนวนมาก ก็ย่อมมีโอกาสสูงที่จะสามารถช่วยขยายฐานคนดูของหมอลำได้
          </p>
        </div>
        <div class="scrolly-step">
          <p>
            และในปัจจุบันที่หลายคนเรียกว่าเป็นโลกไร้พรมแดนแล้ว หลายๆ ประเทศในโลกก็ได้มีคนอีสานไปอาศัยและทำงานอยู่ซึ่งรวมๆ แล้วกว่า 76,000 กว่าคน
            โดยเฉพาะอย่างยิ่งกับประเทศในแถบเอเชียตะวันออกเฉียงใต้อย่าง ไต้หวัน เกาหลี และญี่ปุ่น
          </p>
        </div>
        <div class="scrolly-step">
          <p>
            นั่นหมายความว่าประเทศเหล่านั้นอาจจะเป็นโอกาสที่ดีที่จะทำให้หมอลำขยายฐานคนดูไปได้กว้างขึ้น
            สามารถลองดูเมืองในต่างประเทศที่มีคนอีสานไปทำงานและอาศัยอยู่ในปัจจุบันได้จากแผนที่ทางขวามือ
          </p>
        </div>
      </div>
      <div class="scrolly-viz-column">
        {#if bubbleReady}<BubbleMap activeStep={bubbleStep} />{/if}
      </div>
    </div>
  </section>

  <!-- Section 7: Cultural Map Ecological Background -->
  <section class="hidden scrolly-section" use:inview={() => (culturalReady = true)}>
    <div class="scrolly-wrapper" use:scrolly={{ onStep: (i) => (culturalStep = i) }}>
      <div class="scrolly-text-column">
        <h2 class="setion1quote" style="margin-top: 0; font-size: 2.2rem; margin-bottom: 2rem;">ต้นทุนทางวัฒนธรรมหมอลำ</h2>
        <div class="scrolly-step">
          <p>
            และการต่อยอดวงการหมอลำที่ต้องการรากฐานทางวัฒนธรรมจากท้องถิ่นที่แข็งแรงก็สามารถเห็นได้จากสิ่งที่อาจจะถูกเรียกว่าเป็นต้นทุนทางวัฒนธรรมเดิมที่มีอยู่
          </p>
        </div>
        <div class="scrolly-step">
          <p>
            และสำหรับภูมิภาคอีสานนั้นต้นทุนทางวัฒนธรรม ก็อาจจะสามารถเห็นได้จาก 3 ส่วนใหญ่ๆ:
          </p>
          <ol style="margin-left: 20px; color: var(--text-secondary); line-height: 1.8; font-family: var(--font-body); font-size: 0.95rem;">
            <li style="margin-bottom: 8px;">ธุรกิจขนาดเล็กที่เกิดขึ้นเพื่อสนับสนุนวงการหมอลำ</li>
            <li style="margin-bottom: 8px;">พ่อครูแม่ครูที่มีความรู้ดั้งเดิม</li>
            <li style="margin-bottom: 8px;">สถาบันการศึกษาที่ถ่ายถอดทักษะให้กับคนรุ่นใหม่</li>
          </ol>
        </div>
        <div class="scrolly-step">
          <p>
            โดยสามารถดูการกระจายตัวของต้นทุนทางวัฒนธรรมเหล่านี้ได้จากแผนที่ทางขวามือ เลือกกรองตามประเภทต่างๆ หรือคลิกเพื่อเปิดรายละเอียดเพิ่มเติมในแถบข้างได้
          </p>
        </div>
      </div>
      <div class="scrolly-viz-column">
        {#if culturalReady}<CulturalMap activeStep={culturalStep} />{/if}
      </div>
    </div>
  </section>

  <!-- Section 8: Softpower Network Graph -->
  <section class="hidden scrolly-section" use:inview={() => (softpowerReady = true)}>
    <div class="scrolly-wrapper" use:scrolly={{ onStep: (i) => (softpowerStep = i) }}>
      <div class="scrolly-text-column">
        <h2 class="setion1quote" style="margin-top: 0; font-size: 2.2rem; margin-bottom: 2rem;">ขุมพลังซอฟต์พาวเวอร์อีสาน</h2>
        <div class="scrolly-step">
          <p>
            หมอลำคงเป็นเพียงหนึ่งในต้นทุนทางวัฒนธรรมด้านความบันเทิงของอีสาน ที่มาจากพลังสร้างสรรค์ของชาวอีสาน แต่อย่าลืมว่าภาคอีสานก็ยังมักจะมีผลิตภัณฑ์ทางวัฒนธรรมอื่นๆ ที่โดดเด่น เช่น อาหาร แฟชั่น ท่องเที่ยว และดนตรี
          </p>
        </div>
        <div class="scrolly-step">
          <p>
            หมอลำและหลากหลายผลิตภัณฑ์วัฒนธรรมเหล่านี้มีจุดเริ่มต้นมาจากพลังสร้างสรรค์ของคนในท้องถิ่น ซึ่งในปัจจุบันสามารถเชื่อมโยงและต่อยอดกลายมาเป็นสิ่งที่เรียกว่า ซอฟต์พาวเวอร์ (Soft Power)
          </p>
        </div>
        <div class="scrolly-step">
          <p>
            การเปลี่ยนแปลงในโลกยุคโลกาภิวัตน์ทำให้วัฒนธรรมไม่ได้ถูกจำกัดอยู่เพียงแค่ในพื้นที่อีกต่อไป ขุมพลังทางวัฒนธรรมของชาวอีสานที่บ่มเพาะมาอย่างยาวนาน มีศักยภาพสูงที่จะกลายเป็นพลังขับเคลื่อนเศรษฐกิจที่ช่วยยกระดับคุณภาพชีวิตของคนในภูมิภาคได้ หากได้รับการสนับสนุนอย่างเป็นรูปธรรม
          </p>
        </div>
      </div>
      <div class="scrolly-viz-column">
        {#if softpowerReady}<SoftpowerGraph activeStep={softpowerStep} />{/if}
      </div>
    </div>
  </section>
</main>

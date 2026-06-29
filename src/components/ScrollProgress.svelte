<script>
  import { onMount } from 'svelte';

  let progress = 0;

  onMount(() => {
    let ticking = false;

    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progress = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  });
</script>

<div class="scroll-progress" aria-hidden="true">
  <div class="scroll-progress__bar" style="transform: scaleX({progress})"></div>
</div>

<style>
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    z-index: 1000;
    pointer-events: none;
  }

  .scroll-progress__bar {
    width: 100%;
    height: 100%;
    transform-origin: 0 50%;
    transform: scaleX(0);
    background: linear-gradient(
      90deg,
      var(--neon-pink, #ff2d55),
      var(--neon-purple, #af52de),
      var(--neon-cyan, #00c7be)
    );
    box-shadow: 0 0 12px rgba(255, 45, 85, 0.6);
    will-change: transform;
  }
</style>

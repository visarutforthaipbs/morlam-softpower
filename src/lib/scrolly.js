import scrollama from 'scrollama';

/**
 * Svelte action that turns a container of `.scrolly-step` elements into a
 * scroll-driven stepper. Reports the active step index via `onStep`.
 *
 * Usage:
 *   <div class="scrolly-wrapper" use:scrolly={{ onStep: (i) => step = i }}>
 *     <div class="scrolly-step">…</div>
 *   </div>
 *
 * @param {HTMLElement} node
 * @param {{ onStep?: (index: number) => void, offset?: number, stepSelector?: string }} params
 */
export function scrolly(node, params = {}) {
  let { onStep, offset = 0.6, stepSelector = '.scrolly-step' } = params;
  let scroller;
  let frame;

  function setup() {
    const steps = node.querySelectorAll(stepSelector);
    if (!steps.length) return;

    scroller = scrollama();
    scroller
      .setup({ step: steps, offset, once: false })
      .onStepEnter(({ index }) => {
        steps.forEach((el, i) => el.classList.toggle('is-active', i === index));
        onStep?.(index);
      });
  }

  // Wait one frame so snippet/child DOM is committed before scrollama measures.
  frame = requestAnimationFrame(setup);

  const onResize = () => scroller?.resize();
  window.addEventListener('resize', onResize);

  return {
    update(next) {
      onStep = next.onStep ?? onStep;
    },
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      scroller?.destroy();
    }
  };
}

/**
 * Svelte action that fires once when the node nears the viewport. Used to
 * lazy-mount heavy visualizations (Leaflet, remote topojson) so they don't
 * cost anything until the reader is about to reach them.
 *
 * @param {HTMLElement} node
 * @param {(() => void) | { onEnter?: () => void, rootMargin?: string }} param
 */
export function inview(node, param) {
  const onEnter = typeof param === 'function' ? param : param?.onEnter;
  const rootMargin =
    (typeof param === 'object' && param?.rootMargin) || '400px 0px';

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          onEnter?.();
          obs.unobserve(node);
        }
      }
    },
    { rootMargin }
  );

  observer.observe(node);
  return { destroy: () => observer.disconnect() };
}

/** True when the user prefers reduced motion — viz transitions honor this. */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

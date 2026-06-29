<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { prefersReducedMotion } from '../lib/scrolly.js';

  export let activeStep = 0;

  let containerElement;
  let tooltipElement;
  let renderScene = null; // set once the treemap is drawn
  let showTotal = false;

  // Top-level economic-value categories, in data order.
  const CATEGORIES = [
    'ประมาณการค่าใช้จ่ายในการเข้าชมหมอลำ',
    'มูลค่าทางเศรษฐกิจของผู้จัดงานหรือผู้ว่าจ้าง',
    'มูลค่าทางเศรษฐกิจส่วนของคณะหมอลำ'
  ];

  // Re-render the active scene whenever the scroll step changes.
  $: if (renderScene) renderScene(activeStep);

  onMount(() => {
    if (!containerElement) return;

    const width = containerElement.clientWidth || 600;
    const height = containerElement.clientHeight || 500;

    const color = d3
      .scaleOrdinal()
      .range(["#ff2d55", "#00c7be", "#af52de"]);

    const treemapLayout = d3
      .treemap()
      .size([width, height])
      .paddingInner(4)
      .paddingOuter(2)
      .round(true);

    const svg = d3
      .select(containerElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("font-family", "var(--font-body)");

    const tooltip = d3.select(tooltipElement);

    function formatMoney(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    function roundToTwo(num) {
      return +(Math.round(num + "e+2") + "e-2");
    }

    d3.json("/data/treemap-data-json")
      .then((data) => {
        const root = d3
          .hierarchy(data)
          .eachBefore((d) => {
            d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
          })
          .sum((d) => d.size)
          .sort((a, b) => b.height - a.height || b.value - a.value);

        treemapLayout(root);

        const node = svg
          .selectAll(".node")
          .data(root.leaves())
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

        node
          .append("rect")
          .attr("id", (d) => d.data.id)
          .attr("width", (d) => Math.max(0, d.x1 - d.x0))
          .attr("height", (d) => Math.max(0, d.y1 - d.y0))
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", (d) => d.parent ? color(d.parent.data.name) : color(d.data.name))
          .attr("stroke", "var(--bg-secondary)")
          .attr("stroke-width", 2)
          .style("fill-opacity", 0.8)
          .style("cursor", "pointer");

        node
          .append("clipPath")
          .attr("id", (d) => "clip-" + d.data.id)
          .append("use")
          .attr("xlink:href", (d) => "#" + d.data.id);

        node
          .append("text")
          .attr("clip-path", (d) => `url(#clip-${d.data.id})`)
          .attr("x", 8)
          .attr("y", 18)
          .attr("font-size", (d) => {
            const boxHeight = d.y1 - d.y0;
            const boxWidth = d.x1 - d.x0;
            const textLength = d.data.name.length;
            return Math.min(
              13,
              Math.max(9, Math.min(boxWidth / textLength, boxHeight / 2.5))
            );
          })
          .style("fill", "#ffffff")
          .style("font-weight", "600")
          .style("pointer-events", "none")
          .text((d) => {
            const boxWidth = d.x1 - d.x0;
            const boxHeight = d.y1 - d.y0;
            const charsToShow = Math.floor(boxWidth / 9);

            if (boxWidth < 50 || boxHeight < 25) return "";

            return d.data.name.length > charsToShow
              ? d.data.name.substring(0, Math.max(3, charsToShow - 2)) + "..."
              : d.data.name;
          });

        node
          .on("mouseover", function () {
            tooltip.style("display", "block");
            
            d3.select(this)
              .select("rect")
              .transition()
              .duration(150)
              .style("fill-opacity", 1)
              .attr("stroke", "var(--neon-yellow)")
              .attr("stroke-width", 2);
          })
          .on("mousemove", (event, d) => {
            const tooltipNode = tooltip.node();
            const tooltipWidth = tooltipNode.offsetWidth;
            const tooltipHeight = tooltipNode.offsetHeight;

            // Position relative to viewport client coordinates
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            let left = mouseX + 15;
            let top = mouseY + 15;

            const svgRect = containerElement.getBoundingClientRect();

            if (left + tooltipWidth > svgRect.left + svgRect.width) {
              left = mouseX - tooltipWidth - 15;
            }
            if (top + tooltipHeight > svgRect.top + svgRect.height) {
              top = mouseY - tooltipHeight - 15;
            }

            tooltip
              .html(
                `<div style='color: var(--neon-yellow); font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;'>${d.data.name}</div>
                 <div style='color: var(--text-secondary); font-size: 0.85rem;'>มูลค่าเศรษฐกิจ: <span style='color: var(--text-primary); font-weight: 600;'>฿ ${formatMoney(Math.round(d.value))}</span> (${roundToTwo((d.value / root.value) * 100)}%)</div>`
              )
              .style("left", `${left}px`)
              .style("top", `${top}px`);
          })
          .on("mouseout", function () {
            tooltip.style("display", "none");

            d3.select(this)
              .select("rect")
              .transition()
              .duration(150)
              .style("fill-opacity", 0.8)
              .attr("stroke", "var(--bg-secondary)")
              .attr("stroke-width", 2);
          });

        // --- Scroll-driven scenes -------------------------------------------
        // 0: spotlight audience spending  ·  1: reveal all 3 sources  ·  2: full + ฿6,615M total
        const categoryOf = (d) => (d.parent ? d.parent.data.name : d.data.name);

        renderScene = function (step) {
          const dur = prefersReducedMotion() ? 0 : 600;

          node
            .select("rect")
            .transition()
            .duration(dur)
            .style("fill-opacity", (d) => {
              if (step <= 0) return categoryOf(d) === CATEGORIES[0] ? 0.95 : 0.12;
              return 0.85;
            });

          node
            .select("text")
            .transition()
            .duration(dur)
            .style("opacity", (d) =>
              step <= 0 && categoryOf(d) !== CATEGORIES[0] ? 0.15 : 1
            );

          showTotal = step >= 2;
        };

        renderScene(activeStep);
      })
      .catch((error) => console.error("Error loading JSON data:", error));
  });
</script>

<div class="treemap-wrapper" style="position: relative; width: 100%; height: 100%;">
  <div bind:this={containerElement} id="treemap-container" style="width: 100%; height: 100%; margin: 0;"></div>
  <div bind:this={tooltipElement} class="treemap-tooltip" style="position: fixed; display: none;"></div>

  <div class="viz-callout" class:show={showTotal} aria-hidden={!showTotal}>
    <span class="viz-callout__label">รวมผลกระทบทางเศรษฐกิจกว่า</span>
    <span class="viz-callout__value">฿6,615 ล้านบาท</span>
  </div>
</div>

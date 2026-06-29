<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import * as d3GeoProj from 'd3-geo-projection';
  import * as topojson from 'topojson-client';
  import { prefersReducedMotion } from '../lib/scrolly.js';

  export let activeStep = 0;

  let containerElement;
  let tooltipElement;
  let renderScene = null;
  let showTotal = false;

  // Countries highlighted in scene 1 (named in the copy: Taiwan, Korea, Japan).
  const EAST_ASIA = new Set(['Taiwan', 'South Korea', 'Japan']);

  $: if (renderScene) renderScene(activeStep);

  onMount(() => {
    if (!containerElement) return;

    const width = containerElement.clientWidth || 800;
    const height = containerElement.clientHeight || 520;

    const svg = d3
      .select(containerElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3GeoProj
      .geoRobinson()
      .scale(Math.min(200, width / 4)) // Scale for world map dynamically
      .center([0, 0])
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // A single zoom layer so scenes can glide between world and regional views.
    const zoomLayer = svg.append("g");
    const poly = zoomLayer.append("g");
    const line = zoomLayer.append("g");
    const bubble = zoomLayer.append("g");

    // Transform that frames East Asia (between Japan, Korea, Taiwan).
    function eastAsiaTransform() {
      const focus = projection([127, 30]);
      const k = 2.2;
      if (!focus) return "translate(0,0) scale(1)";
      return `translate(${width / 2 - focus[0] * k}, ${height / 2 - focus[1] * k}) scale(${k})`;
    }

    const tooltip = d3.select(tooltipElement);

    const dataURL = "/data/Updated_Merged_Country_Locations.csv";
    const polygonsURL =
      "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_polygons_simplified.json";
    const polylinesURL =
      "https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/geospatial/world_lines_simplified.json";

    // Load and draw polygons (countries)
    d3.json(polygonsURL).then((topology) => {
      poly
        .selectAll("path")
        .data(
          topojson.feature(topology, topology.objects.world_polygons_simplified)
            .features
        )
        .enter()
        .append("path")
        .attr("fill", "#131126") // Deep indigo country polygons
        .attr("stroke", "#1c1936")
        .attr("stroke-width", 0.5)
        .attr("d", pathGenerator);
    });

    // Load and draw lines (borders/rivers)
    d3.json(polylinesURL).then((topology) => {
      line
        .selectAll("path")
        .data(
          topojson.feature(topology, topology.objects.world_lines_simplified)
            .features
        )
        .enter()
        .append("path")
        .style("fill", "none")
        .attr("d", pathGenerator)
        .attr("class", (d) => d.properties.type);
    });

    d3.csv(dataURL).then((population) => {
      const valueScale = d3
        .scaleSqrt()
        .domain(d3.extent(population, (d) => +d.amount))
        .range([6, 32]); // Bubble range scale

      const mouseover = function (event, d) {
        tooltip.style("display", "block");
        d3.select(this)
          .transition()
          .duration(200)
          .style("fill", "var(--neon-yellow)")
          .style("stroke", "var(--neon-yellow)")
          .style("fill-opacity", 0.95)
          .attr("r", (d) => valueScale(+d.amount) + 3);
      };

      const mousemove = function (event, d) {
        const format = d3.format(",");
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;

        const circle = d3.select(this);
        const circleX = +circle.attr("cx");
        const circleY = +circle.attr("cy");

        let left = circleX + 15;
        let top = circleY - tooltipHeight / 2;

        const svgRect = containerElement.getBoundingClientRect();

        if (left + tooltipWidth > svgRect.width) {
          left = svgRect.width - tooltipWidth - 15;
        }
        if (left < 0) left = 15;
        if (top + tooltipHeight > svgRect.height) {
          top = svgRect.height - tooltipHeight - 15;
        }
        if (top < 0) top = 15;

        tooltip
          .html(
            `<div style='color: var(--neon-yellow); font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;'>${d.country}</div>
             <div style='color: var(--text-secondary); font-size: 0.85rem;'>จำนวนชาวอีสาน: <span style='color: var(--text-primary); font-weight: 600;'>${format(d.amount)} คน</span></div>`
          )
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      };

      const mouseleave = function () {
        tooltip.style("display", "none");
        d3.select(this)
          .transition()
          .duration(200)
          .style("fill", "var(--neon-pink)")
          .style("stroke", "var(--neon-cyan)")
          .style("fill-opacity", 0.7)
          .attr("r", (d) => valueScale(+d.amount));
      };

      const circles = bubble
        .selectAll("circle")
        .data(population)
        .enter()
        .append("circle")
        .attr("cx", (d) => {
          const coords = projection([+d.lon, +d.lat]);
          return coords ? coords[0] : 0;
        })
        .attr("cy", (d) => {
          const coords = projection([+d.lon, +d.lat]);
          return coords ? coords[1] : 0;
        })
        .attr("r", (d) => valueScale(+d.amount))
        .style("fill", "var(--neon-pink)")
        .attr("stroke", "var(--neon-cyan)")
        .attr("stroke-width", 1.5)
        .attr("fill-opacity", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      // --- Scroll-driven scenes ---------------------------------------------
      // 0: dim world overview · 1: zoom to East Asia, spotlight TW/KR/JP · 2: full world + 76,000 total
      renderScene = function (step) {
        const dur = prefersReducedMotion() ? 0 : 900;
        const focus = step === 1;

        zoomLayer
          .transition()
          .duration(dur)
          .attr("transform", focus ? eastAsiaTransform() : "translate(0,0) scale(1)");

        circles
          .transition()
          .duration(dur)
          .attr("fill-opacity", (d) => {
            if (step <= 0) return 0.28;
            if (focus) return EAST_ASIA.has(d.country_en) ? 0.95 : 0.12;
            return 0.7;
          })
          .style("fill", (d) =>
            focus && EAST_ASIA.has(d.country_en)
              ? "var(--neon-yellow)"
              : "var(--neon-pink)"
          );

        showTotal = step >= 2;
      };

      renderScene(activeStep);
    });
  });
</script>

<div class="bubble-map-wrapper" style="position: relative; width: 100%; height: 100%;">
  <div bind:this={containerElement} id="viz_container" style="width: 100%; height: 100%; margin: 0;"></div>
  <div bind:this={tooltipElement} class="tooltip" style="position: absolute; display: none; pointer-events: none;"></div>

  <div class="viz-callout" class:show={showTotal} aria-hidden={!showTotal}>
    <span class="viz-callout__label">ชาวอีสานทำงานและอาศัยอยู่ทั่วโลกกว่า</span>
    <span class="viz-callout__value">76,000+ คน</span>
  </div>
</div>

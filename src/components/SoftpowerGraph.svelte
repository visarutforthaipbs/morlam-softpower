<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { prefersReducedMotion } from '../lib/scrolly.js';

  export let activeStep = 0;

  let containerElement;
  let descVisible = true;
  let renderScene = null;

  $: if (renderScene) renderScene(activeStep);

  onMount(() => {
    if (!containerElement) return;

    const width = containerElement.clientWidth || 800;
    const height = containerElement.clientHeight || 550;

    // Set up SVG container
    const svg = d3
      .select(containerElement)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Add zoom group container
    const container = svg.append("g");

    // Zoom behavior setup in D3 v7
    const zoom = d3
      .zoom()
      .scaleExtent([0.4, 8])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Define Category Nodes lists
    const categories = ["ภาพยนตร์", "อาหาร", "เพลง", "สถานที่ท่องเที่ยว", "แฟชั่น", "กีฬา"];
    const hubId = "ซอฟต์พาวเวอร์อีสาน";

    // Node radius size scales
    function getNodeRadius(d) {
      if (d.id === hubId) return 50;
      if (categories.includes(d.id)) return 32;
      return 20; // Leaf nodes radius
    }

    // YouTube / video style triangle marker
    const defs = container.append("defs");
    defs
      .append("marker")
      .attr("id", "Triangle")
      .attr("refX", 7)
      .attr("refY", 3.5)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .style("fill", "var(--neon-cyan)") // Cyan neon arrows
      .attr("d", "M 0 0 L 7 3.5 L 0 7 Z");

    // Offset parallel edges calculation
    function offsetEdge(d, sourceSize, targetSize) {
      const diffX = d.target.y - d.source.y;
      const diffY = d.target.x - d.source.x;

      const angle0 = Math.atan2(diffY, diffX) + Math.PI / 2;
      const edgeNum = +d.edgeNumber || 0;
      const angle1 = angle0 + (Math.PI * 0.75 + edgeNum * 0.25);
      const angle2 = angle0 + (Math.PI * 0.25 - edgeNum * 0.25);

      const x1 = d.source.x + sourceSize * Math.cos(angle1);
      const y1 = d.source.y - sourceSize * Math.sin(angle1);
      const x2 = d.target.x + targetSize * Math.cos(angle2);
      const y2 = d.target.y - targetSize * Math.sin(angle2);

      return { x1, y1, x2, y2 };
    }

    // Load soft power node CSV data
    d3.csv("/data/soft_power_nodes.csv")
      .then((data) => {
        const nodeHash = {};
        const nodes = [];
        const edges = [];

        data.forEach((edge) => {
          if (!nodeHash[edge.source]) {
            nodeHash[edge.source] = { id: edge.source, label: edge.source };
            nodes.push(nodeHash[edge.source]);
          }
          if (!nodeHash[edge.target]) {
            nodeHash[edge.target] = { id: edge.target, label: edge.target };
            nodes.push(nodeHash[edge.target]);
          }
          edges.push({
            source: nodeHash[edge.source],
            target: nodeHash[edge.target],
            edgeNumber: +edge.edgeNumber || 0,
          });
        });

        createForceNetwork(nodes, edges);
      })
      .catch((error) => console.error("Error loading soft power node CSV:", error));

    function createForceNetwork(nodes, edges) {
      // Force Simulation setup in D3 v7
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(edges).id((d) => d.id).distance(140)
        )
        .force(
          "charge",
          d3.forceManyBody().strength((d) => (d.id === hubId ? -900 : -250))
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "collision",
          d3.forceCollide().radius((d) => getNodeRadius(d) + 10)
        )
        .on("tick", updateNetwork);

      // Draw connecting edges
      const link = container
        .selectAll("line")
        .data(edges)
        .enter()
        .append("line")
        .attr("class", "node-link")
        .attr("marker-end", "url(#Triangle)");

      // Draw nodes groups
      const node = container
        .selectAll("g.node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

      // Draw circles inside node groups
      node
        .append("circle")
        .attr("class", "node-circle")
        .attr("r", (d) => getNodeRadius(d))
        .style("fill", (d) => {
          if (d.id === hubId) return "var(--neon-pink)"; // Main Pink node
          if (categories.includes(d.id)) return "var(--neon-purple)"; // Category Purple nodes
          return "#120f28"; // Leaf slate node
        })
        .style("stroke", (d) => {
          if (d.id === hubId) return "#ffffff";
          if (categories.includes(d.id)) return "#ffffff";
          return "var(--neon-cyan)"; // Cyan outlines
        })
        .style("stroke-width", "1.5px")
        .style("filter", (d) => {
          // Glow effect for main categories
          if (d.id === hubId) return "drop-shadow(0 0 10px rgba(255, 45, 85, 0.6))";
          if (categories.includes(d.id)) return "drop-shadow(0 0 8px rgba(175, 82, 222, 0.5))";
          return "none";
        });

      // Draw labels text
      node
        .append("text")
        .attr("class", "node-text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-size", (d) => {
          if (d.id === hubId) return "13px";
          if (categories.includes(d.id)) return "11px";
          return "9px";
        })
        .style("font-weight", (d) => (d.id === hubId ? "700" : "500"))
        .text((d) => d.id);

      function updateNetwork() {
        // Calculate and offset parallel lines
        link.each(function (d) {
          const startCoords = offsetEdge(
            d,
            getNodeRadius(d.source),
            getNodeRadius(d.target)
          );
          d3.select(this)
            .attr("x1", startCoords.x1)
            .attr("y1", startCoords.y1)
            .attr("x2", startCoords.x2)
            .attr("y2", startCoords.y2);
        });

        // Update positions of node groups
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      }

      // --- Scroll-driven scenes -----------------------------------------------
      // 0: spotlight the hub · 1: reveal the 6 culture categories · 2: full network
      const levelOf = (d) =>
        d.id === hubId ? 0 : categories.includes(d.id) ? 1 : 2;

      renderScene = function (step) {
        const dur = prefersReducedMotion() ? 0 : 600;

        node
          .transition()
          .duration(dur)
          .style("opacity", (d) => (levelOf(d) <= step ? 1 : 0.12));

        link
          .transition()
          .duration(dur)
          .style("opacity", (d) =>
            levelOf(d.source) <= step && levelOf(d.target) <= step ? 0.6 : 0.05
          );
      };

      renderScene(activeStep);

      // Drag handlers
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  });
</script>

<div id="softpower-node-container" style="position: relative; width: 100%; height: 100%; margin: 0; background: var(--bg-secondary);">
  <div bind:this={containerElement} id="softpower-node-viz" style="width: 100%; height: 100%;"></div>
  
  {#if descVisible}
    <div class="description" id="softpower-desc" style="position: absolute; top: 20px; left: 20px; z-index: 10; background: rgba(18, 14, 40, 0.85); backdrop-filter: blur(8px); padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 250px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
      <button 
        class="close-btn" 
        id="close-softpower-desc" 
        on:click={() => descVisible = false}
        style="position: absolute; top: 12px; right: 15px; background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer; transition: color 0.3s;" 
        type="button"
      >
        &times;
      </button>
      <strong style="color: var(--neon-yellow); font-family: var(--font-display); font-size: 1.02rem;">ซอฟต์พาวเวอร์อีสานมีอะไรบ้าง</strong>
      <p style="font-size: 0.82rem; margin: 8px 0 0 0; line-height: 1.5; color: var(--text-secondary);">แผนที่เครือข่ายความสัมพันธ์และจุดเด่นทางวัฒนธรรมในด้านต่างๆ ของภาคอีสาน</p>
    </div>
  {/if}
  
  <div class="note" style="position: absolute; bottom: 20px; left: 20px; z-index: 10; background: rgba(7, 5, 16, 0.6); padding: 6px 12px; border-radius: 10px; font-size: 0.72rem; color: var(--text-secondary);">เลื่อนเมาส์เพื่อซูมเข้า-ออก หรือลากโหนดเพื่อย้ายตำแหน่ง</div>
</div>
